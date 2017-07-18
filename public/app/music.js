function LocalPlayer(music)
{
	this.music = music;
	this.audio = new Audio();
	this.volet = 0;
	this.init();
}

LocalPlayer.prototype.init = function(){
	var that = this;
	document.body.appendChild(this.audio);
	this.audio.autoplay = true;
	this.audio.loop = true;

	if(that.music.room.user.admin){
		$.post('music/list.php', function(data){
			that.music.$musicPopin.find('.local-contener').append(that.crawlSongs(data));

			$('body').on('click.music', '.song .fa-play', function(e){
				e.preventDefault();
				that.song($(this).parent().parent(), false);
			});

			$('body').on('click.music', '.song .fa-plus', function(e){
				e.preventDefault();
				that.song($(this).parent().parent(), true);
			});

			$('body').on('click.music', '.playlist .fa-play', function(e){
				e.preventDefault();
				that.playlist($(this).parent().parent(), false);
			});

			$('body').on('click.music', '.playlist .fa-plus', function(e){
				e.preventDefault();
				that.playlist($(this).parent().parent(), true);
			});
		});
	}
};

LocalPlayer.prototype.song = function(elem, add){
	var that = this;
	that.music.$musicPopin.fadeOut(300);
	var songs = {
		type: 'local',
		add: add,
		url: [elem.attr('data-song')]
	};
	that.music.room.socket.emit('music', songs);
};

LocalPlayer.prototype.playlist = function(elem, add){
	var that = this;
	var songs = {
		type: 'local',
		add: add,
		url: []
	};
	that.music.$musicPopin.fadeOut(300);
	elem.next('input').next('label').next('ul').find('.song').each(function(){
		songs.url.push($(this).attr('data-song'));
	});

	that.music.room.socket.emit('music', songs);
};

LocalPlayer.prototype.crawlSongs = function(playlist){
	++this.volet;
	var musiclist = '';
	musiclist += '<h4 class="playlist list link">'+playlist.title+'<span class="icon-play"><i class="fa fa-plus"></i><i class="fa fa-play"></i></span></h4>';
	musiclist += '<input id="volet-'+this.volet+'" type="checkbox" '+((this.volet==1)?'checked':'')+' class="volet-checkbox">';
	musiclist += '<label for="volet-'+this.volet+'" class="volet-btn link fa fa-caret-right"></label>';
	musiclist += '<ul class="volet-content">';
	for(var i = 0; i < playlist.songs.length; i++){
		if(playlist.songs[i].type == "playlist"){
			musiclist += '<li>'+this.crawlSongs(playlist.songs[i])+'</li>';
		} else {
			musiclist += '<li class="song list link" data-song="music/'+playlist.songs[i].url+'">'+playlist.songs[i].title+'<span class="icon-play"><i class="fa fa-plus"></i><i class="fa fa-play"></i></span></li>';
		}
	}
	musiclist += '</ul>';

	return musiclist;
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
	console.log(this.audio);
	this.audio.parentNode.removeChild(this.audio);
};

function YoutubePlayer(music)
{
	this.music = music;
    this.index = 0;
	this.youtube;
    this.$musicUrl;
    this.$playLater;
    this.$playNow;

	this.init();
}

YoutubePlayer.prototype.init = function(){
	var that = this;

	// Youtube player tag
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	window.onYouTubeIframeAPIReady = function() {
		that.youtube = new YT.Player('yt-player', {
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

		if(that.music.room.user.admin){
			that.music.$musicPopin.find('.youtube-contener').append(
				'<div class="mui-form-group">'+
					'<input id="music-url" type="text" class="mui-form-control" placeholder="https://www.youtube.com/watch?v=KqeKikpLQ5o">'+
					'<label>Youtube url</label>'+
				'</div>'+
				'<button id="play-later" class="mui-btn mui-btn-flat mui-btn-default mui-pull-left">To playlist</button>'+
				'<button id="play-now" class="mui-btn mui-btn-raised mui-btn-primary mui-pull-right">Play now</button>'
			);

			that.$musicUrl = $("#music-url");
			that.$playLater = $("#play-later");
			that.$playNow = $("#play-now");

			that.$playNow.on('click.music', function(e){
				e.preventDefault();
				var value = that.$musicUrl[0].value;
				var parse = that.parseURL(value);
				parse.add = false;
				that.music.$musicPopin.fadeOut(300);
				that.music.room.socket.emit('music', parse);
				//console.log('play now', parse);
			});

			that.$playLater.on('click.music', function(e){
				e.preventDefault();
				var value = that.$musicUrl[0].value;
				var parse = that.parseURL(value);
				parse.add = true;
				that.music.$musicPopin.fadeOut(300);
				that.music.room.socket.emit('music', parse);
				//console.log('play later', parse);
			});
		}
	}


    function onPlayerStateChange(event) {
        //console.log('event: ' + event.data, 'index: ' + that.currentIndex, 'length: ' + (event.target.getPlaylist().length-1));
        if(event.data == YT.PlayerState.PLAYING)
            that.index = event.target.getPlaylistIndex();
        if(event.data == YT.PlayerState.ENDED && that.index == event.target.getPlaylist().length-1){
            that.music.next();
            //console.log('Fin de la playlist');
        }
    }
};

YoutubePlayer.prototype.parseURL = function(url)
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

YoutubePlayer.prototype.start = function(track){
	if(track.type == 'playlist') this.youtube.loadPlaylist({list: track.url});
    else this.youtube.loadPlaylist(track.url);
};

YoutubePlayer.prototype.pause = function(){
	this.youtube.pauseVideo();
};

YoutubePlayer.prototype.play = function(){
	this.youtube.playVideo();
};

YoutubePlayer.prototype.volume = function(v){
	this.youtube.setVolume(Math.max(0, Math.min(v, 1)) * 100);
};

YoutubePlayer.prototype.destroy = function(){
	this.youtube.destroy();
	if(this.music.room.user.admin){
		this.$playNow.off('.music');
		this.$playLater.off('.music');
	}
};

function Music(room)
{
	this.room = room;
	this.playlist = [];
	this.current = 0;
	this.savedVolume = 0;
	this.currentVolume = 0;
	this.localPlayer;
	this.youtubePlayer;
	this.player;

	this.$play = $("#play");
	this.$mute = $("#mute");
	this.$volume = $("#volume");
	this.$bar = this.$volume.find(".audio-volume-bar");
	this.$musicPlayer = $("#music-player");

    this.$musicPopin;

	this.init();
}

Music.prototype.load = function(data)
{
	console.log('data', data);
    if(data.add){
		if(data.type == 'local'){
			for(var i = 0, l = data.url.length; i<l; i++)
				this.playlist.push({type: data.type, add: data.add, url: data.url[i]});
		} else {
			this.playlist.push(data);
		}

        if(this.playlist.length == 1){
            this.current = 0;
            this.start();
        }
    } else {
		this.playlist = [];
		if(data.type == 'local'){
			for(var i = 0, l = data.url.length; i<l; i++)
				this.playlist.push({type: data.type, add: data.add, url: data.url[i]});
		} else {
			this.playlist.push(data);
		}
		this.current = 0;
        this.start();
    }
};

Music.prototype.start = function()
{
	console.log(this.playlist);
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

Music.prototype.play = function()
{
	this.$play
		.removeClass("fa-play")
		.addClass("fa-pause");
	this.player.play();
	this.volume(this.currentVolume);
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

	if(this.player)
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
				'<div class="youtube-contener"></div>'+
				'<div class="local-contener" style="position:relative;clear:both;"></div>'+
            '</div>'+
        '</div>');

        that.$musicPlayer = $("#music-player");
        that.$musicPopin = $(".music-selector");

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

		$('body').on("click.music", ".music-selector-close", function(){
	        that.$musicPopin.fadeOut(300);
	    });
    }
};

Music.prototype.destroy = function()
{
	this.youtubePlayer.destroy();
	this.localPlayer.destroy();

	this.$volume.off('.music');
	this.$mute.off('.music');
	this.$play.off('.music');
	$('body').off('.music');
	$(window).off('.music');

	this.room.socket.removeAllListeners('music');
	this.room.socket.removeAllListeners('music play');
	this.room.socket.removeAllListeners('music pause');
	this.room.socket.removeAllListeners('music volume');

	if(this.room.user.admin){
		this.$musicPlayer.remove();
		this.$musicPopin.remove();
	}
};
