function LocalPlayer(music)
{
	this.music = that;
	this.audio = new Audio();
	this.init();
}

LocalPlayer.prototype.init = function(){
	this.audio.autoplay = true;
	this.audio.loop = true;
};

LocalPlayer.prototype.start = function(track){
	this.audio.src = track.url;
	this.play();
};

LocalPlayer.prototype.pause = function(){
	this.audio.pause();
};

LocalPlayer.prototype.play = function(){
	this.audio.play();
};

LocalPlayer.prototype.volume = function(v){
	this.audio.volume = Math.max(0, Math.min(v, 1));
};

LocalPlayer.prototype.destroy = function(){
	this.audio.parentNode.removeChild(this.audio);
};

function YoutubePlayer(music)
{
	this.music = music;
	this.youtube;
}

YoutubePlayer.prototype.init = function(){

};

YoutubePlayer.prototype.start = function(track){
	if(track.type == 'playlist') this.player.loadPlaylist({list: track.url});
    else this.player.loadPlaylist(track.url);
};

YoutubePlayer.prototype.pause = function(){
	this.youtube.pauseVideo();
};

YoutubePlayer.prototype.play = function(){
	this.youtube.playVideo();
};

YoutubePlayer.prototype.volume = function(v){
	this.audio.setVolume(Math.max(0, Math.min(v, 1)) * 100);
};

YoutubePlayer.prototype.destroy = function(){
	this.audio.parentNode.removeChild(this.audio);
};

function Music(room)
{
	this.room = room;
	this.playlist = [];
	this.current = 0;
    this.currentIndex = 0;
	this.savedVolume = 0;
	this.currentVolume = 0;
	this.volet = 0;
	this.localPlayer;
	this.youtubePlayer;
	this.player;

	this.$play = $("#play");
	this.$mute = $("#mute");
	this.$volume = $("#volume");
	this.$bar = this.$volume.find(".audio-volume-bar");
	this.$musicPlayer = $("#music-player");

    this.$musicPopin;
    this.$musicUrl;
    this.$playLater;
    this.$playNow;

	this.init();
}

Music.prototype.load = function(data)
{
    if(data.add){
        this.playlist.push(data);
        if(this.playlist.length == 1){
            this.current = 0;
            this.start();
        }
    } else {
        this.current = 0;
        this.playlist = [data];
        this.start();
    }
};

Music.prototype.start = function()
{
    if(this.playlist.length === 0)
        return;
	if(this.playlist[this.current].type == 'local')
		this.player = this.localPlayer;
	else
		this.player = this.youtubePlayer;

    this.player.start(this.playlist[this.current]);
    this.play();
};

Music.prototype.next = function()
{
	if(++this.current >= this.playlist.length)
		this.current = 0;
	this.start();
};

Music.prototype.parseURL = function(url)
{
    var type = 'video';
    if(url.indexOf('list=') != -1){
        url = url.replace(/(>|<)/gi,'').split(/(vi\/|list=|\/v\/|youtu\.be\/|\/embed\/)/);
        type = 'playlist';
    } else {
        url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    }

    if(url[2] !== undefined)
        url = url[2].split(/[^0-9a-z_\-]/i);

    return {
        url: url[0],
        type: type
    };
};

Music.prototype.play = function()
{
	this.$play
		.removeClass("fa-play")
		.addClass("fa-pause");
	this.player.play();
};

Music.prototype.pause = function()
{
	this.$play
		.removeClass("fa-pause")
		.addClass("fa-play");
	this.player.pause();
};

Music.prototype.volume = function(volume)
{
	volume = Math.min(Math.max(volume, 0), 1);

	var c = "fa ";
	if(volume == 0){
		c += "fa-volume-off";
	} else if(volume < 0.4){
		c += "fa-volume-down";
	} else {
		c += "fa-volume-up";
	}

	this.$mute[0].className = c;

	this.$bar.css('width', (volume*100)+'%');

	this.player.volume(volume * 0.2);
    this.currentVolume = volume;
};

Music.prototype.mute = function()
{
	this.savedVolume = this.currentVolume;
	this.volume(0);
};

Music.prototype.unmute = function()
{
	this.volume(this.savedVolume);
	this.savedVolume = 0;
};

Music.prototype.init = function()
{
	var that = this;

	that.youtubePlayer = new YoutubePlayer(that);
	that.localPlayer = new LocalPlayer(that);

    // Youtube player tag
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = function() {
        that.player = new YT.Player('yt-player', {
            height: '1',
            width: '1',
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }

    // 4. The API will call this function when the video player is ready.
    function onPlayerReady(event) {
        console.log('player ready');

        that.volume(0.5);

        that.$volume.on('mousedown.music', function(e){
            e.preventDefault();
            that.volume(Math.round(e.offsetX/$(this).width()*100)/100);
            $(window).on('mousemove.music', function(e){
                var offset = e.clientX - that.$volume.offset().left;
                that.volume(Math.round(offset/that.$volume.width()*100)/100);
            });
        });

        that.$mute.on('click.music', function(){
            if(that.savedVolume == 0){
                that.mute();
            } else {
                that.unmute();
            }
        });

        $(window).on('mouseup.music', function(){
            $(window).off('mousemove.music');
        });

        $('body').on("click.music", ".music-selector-close", function(){
            that.$musicPopin.fadeOut(300);
        });

        that.room.socket.on('music', function(data){
            that.load(data);
        });

        that.room.socket.on('music pause', function(){
            that.pause();
        });

        that.room.socket.on('music play', function(){
            that.play();
        });

        that.room.socket.on('music volume', function(data){
            that.volume(data);
        });

        if(that.room.user.admin)
        {
            $('.room-wrapper').append('<div id="music-player"><div class="music-title">Click to choose song</div></div>');

            $('.room-wrapper').append('<div class="music-selector overlay centerer" style="display:none;">'+
                '<div class="popin mui-panel centered">'+
                    '<i class="music-selector-close fa fa-times link"></i>'+
                    '<div class="mui-form-group">'+
                        '<input id="music-url" type="text" class="mui-form-control" placeholder="https://www.youtube.com/watch?v=fOEQTJV_3-w">'+
                        '<label>Youtube url</label>'+
                    '</div>'+
                    '<button id="play-later" class="mui-btn mui-btn-flat mui-btn-default mui-pull-left">To playlist</button>'+
                    '<button id="play-now" class="mui-btn mui-btn-raised mui-btn-primary mui-pull-right">Play now</button>'+
                '</div>'+
            '</div>');

            that.$musicPlayer = $("#music-player");
            that.$musicPopin = $(".music-selector");
            that.$musicUrl = $("#music-url");
            that.$playLater = $("#play-later");
            that.$playNow = $("#play-now");

            that.$musicPlayer.on("click.music", function(e){
                e.preventDefault();
                if(that.room.user.admin){
                    that.$musicPopin.fadeIn(300);
                }
            });

            that.$play.on("click.music", function(e){
                e.preventDefault();
                if(that.room.user.admin)
                {
                    var $this = $(this);
                    if($this.hasClass('fa-play')){
                        if(that.player){
                            that.room.socket.emit('music play');
                        } else {
                            that.$musicPopin.fadeIn(300);
                        }
                    } else {
                        that.room.socket.emit('music pause');
                    }
                }
            });

            that.$playNow.on('click.music', function(e){
                e.preventDefault();
                var value = that.$musicUrl[0].value;
                var parse = that.parseURL(value);
                parse.add = false;
                that.$musicPopin.fadeOut(300);
                that.room.socket.emit('music', parse);
                //console.log('play now', parse);
            });

            that.$playLater.on('click.music', function(e){
                e.preventDefault();
                var value = that.$musicUrl[0].value;
                var parse = that.parseURL(value);
                parse.add = true;
                that.$musicPopin.fadeOut(300);
                that.room.socket.emit('music', parse);
                //console.log('play later', parse);
            });
        }
    }

    function onPlayerStateChange(event) {
        //console.log('event: ' + event.data, 'index: ' + that.currentIndex, 'length: ' + (event.target.getPlaylist().length-1));
        if(event.data == YT.PlayerState.PLAYING)
            that.currentIndex = event.target.getPlaylistIndex();
        if(event.data == YT.PlayerState.ENDED && that.currentIndex == event.target.getPlaylist().length-1){
            that.next();
            //console.log('Fin de la playlist');
        }
    }
};

Music.prototype.destroy = function()
{
	this.player.destroy();
	this.$volume.off('.music');
	this.$mute.off('.music');
	this.$play.off('.music');
	this.$playNow.off('.music');
	this.$playLate.off('.music');
	$('body').off('.music');
	$(window).off('.music');

	this.room.socket.removeAllListeners('music');
	this.room.socket.removeAllListeners('music play');
	this.room.socket.removeAllListeners('music pause');
	this.room.socket.removeAllListeners('music volume');

	this.$musicPlayer.remove();
};
