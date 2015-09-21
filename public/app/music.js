function Music(room)
{
	this.room = room;
	this.playlist = [];
	this.current = 0;
	this.vol = 0;
	this.volet = 0;
	this.player = new Audio();

	this.$play = $("#play");
	this.$mute = $("#mute");
	this.$volume = $("#volume");
	this.$bar = this.$volume.find(".audio-volume-bar");
	this.$musicPlayer = $("#music-player");

	this.init();
}

Music.prototype.crawlSongs = function(playlist)
{
	++this.volet;
	var musiclist = '';
	musiclist += '<h4 class="playlist list link">'+playlist.title+'<i class="icon-play fa fa-play"></i></h4>';
	musiclist += '<input id="volet-'+this.volet+'" type="checkbox" '+((this.volet==1)?'checked':'')+' class="volet-checkbox">';
	musiclist += '<label for="volet-'+this.volet+'" class="volet-btn link fa fa-caret-right"></label>';
	musiclist += '<ul class="volet-content">';
	for(var i = 0; i < playlist.songs.length; i++){
		if(playlist.songs[i].type == "playlist"){
			musiclist += '<li>'+this.crawlSongs(playlist.songs[i])+'</li>';
		} else {
			musiclist += '<li class="song list link" data-song="music/'+playlist.songs[i].url+'">'+playlist.songs[i].title+'<i class="icon-play fa fa-play"></i></li>';
		}
	}
	musiclist += '</ul>';

	return musiclist;
};

Music.prototype.showList = function()
{
	var that = this;
	this.volet = 0;

	if($(".music-selector").length > 0){
		$(".music-selector").fadeIn(300);
	} else {
		$.post('music/list.php', function(data){
			$("body").append(
				'<div class="music-selector overlay centerer" style="display:none;">'+
					'<div class="popin mui-panel centered">'+
						'<i class="music-selector-close fa fa-times link"></i>'+
						'<div style="position:relative;">'+that.crawlSongs(data)+'</div>'+
					'</div>'+
				'</div>'
			);

			$(".music-selector").fadeIn(300);
		});
	}
};

Music.prototype.load = function(data)
{
	this.playlist = data;
	this.current = 0;
	this.play();
};

Music.prototype.next = function()
{
	++this.current;
	if(this.current >= this.playlist.length)
		this.current = 0;

	this.play();
};

Music.prototype.play = function()
{
	this.$play
		.removeClass("fa-play")
		.addClass("fa-pause");

	this.player.src = this.playlist[this.current];
	this.player.loop = false;
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
	this.player.volume = volume;
};

Music.prototype.mute = function()
{
	this.vol = this.player.volume;
	this.volume(0);
};

Music.prototype.unmute = function()
{
	this.volume(this.vol);
	this.vol = 0;
};

Music.prototype.init = function()
{
	var that = this;

	this.$volume.on('mousedown.music', function(e){
		e.preventDefault();
		that.volume(Math.round(e.offsetX/$(this).width()*100)/100);
		$(window).on('mousemove.music', function(e){
			var offset = e.clientX - that.$volume.offset().left;
			that.volume(Math.round(offset/that.$volume.width()*100)/100);
		});
	});

	this.$mute.on('click.music', function(){
		if(that.vol == 0){
			that.mute();
		} else {
			that.unmute();
		}
	});

	$(window).on('mouseup.music', function(){
		$(window).off('mousemove.music');
	});

	$('body').on("click.music", ".music-selector-close", function(){
		$('.music-selector').fadeOut(300);
	});

	$(this.player).on('ended.music', function(e){
		that.pause();
		that.next();
	});

	this.room.socket.on('music', function(data){
		that.load(data);
	});

	this.room.socket.on('music pause', function(){
		that.pause();
	});

	this.room.socket.on('music volume', function(data){
		that.volume(data);
	});

	this.player.volume = 1;

	if(this.room.user.admin)
	{
		$('.room-wrapper').append('<div id="music-player"><div class="music-title">Click to choose song</div></div>');

		this.$musicPlayer = $("#music-player");

		this.$musicPlayer.on("click.music", function(e){
			e.preventDefault();
			if(that.room.user.admin)
			{
				that.showList();
			}
		});

		this.$play.on("click.music", function(e){
			e.preventDefault();
			if(that.room.user.admin)
			{
				var $this = $(this);
				if($this.hasClass('fa-play')){
					that.showList();
				} else {
					that.room.socket.emit('music pause');
				}
			}
		});

		$('body').on('click.music', '.song', function(e){
			e.preventDefault();
			$('.music-selector').fadeOut(300);
			if(that.room.user.admin)
			{
				that.room.socket.emit('music', [$(this).attr('data-song')]);
			}
		});

		$('body').on('click.music', '.playlist', function(e){
			e.preventDefault();
			$('.music-selector').fadeOut(300);
			if(that.room.user.admin){
				var songs = [];
				$(this).next('input').next('label').next('ul').find('.song').each(function(){
					songs.push($(this).attr('data-song'));
				});

				that.room.socket.emit('music', songs);
			}
		});
	}
};

Music.prototype.destroy = function()
{
	this.player.pause();
	this.player.src = "";
	this.$volume.off('.music');
	this.$mute.off('.music');
	this.$play.off('.music');
	$('body').off('.music');
	$(window).off('.music');
	$(this.player).off('.music');

	this.room.socket.removeAllListeners('music');
	this.room.socket.removeAllListeners('music pause');
	this.room.socket.removeAllListeners('music volume');

	this.$musicPlayer.remove();
};