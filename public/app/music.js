var Music = {
	playlist: [],
	current: 0,
	vol: 0,
	player: new Audio(),
	crawlSongs: function(playlist){
		var musiclist = '<strong class="playlist link">'+playlist.title+'</strong>';
		musiclist += '<ul>';
		for(var i = 0; i < playlist.songs.length; i++){
			if(playlist.songs[i].type == "playlist"){
				musiclist += '<li>'+Music.crawlSongs(playlist.songs[i])+'</li>';
			} else {
				musiclist += '<li class="song link" data-song="music/'+playlist.songs[i].url+'">'+playlist.songs[i].title+'</li>';
			}
		}
		musiclist += '</ul>';

		return musiclist;
	},
	showList: function(){
		$.post('music/list.php', function(data){
			$("body").append(
				'<div class="music-selector overlay centerer">'+
					'<div class="popin mui-panel centered">'+
						'<i class="music-selector-close fa fa-times link"></i>'+
						Music.crawlSongs(data)+
					'</div>'+
				'</div>'
			);
		});
	},
	load: function(data)
	{
		Music.playlist = data;
		Music.current = 0;
		Music.play();
	},
	next: function(){
		++Music.current;
		if(Music.current >= Music.playlist.length)
			Music.current = 0;

		Music.play();
	},
	play: function(){
		$("#play")
			.removeClass("fa-play")
			.addClass("fa-pause");

		Music.player.src = Music.playlist[Music.current];
		Music.player.loop = false;
		Music.player.play();
	},
	pause: function()
	{
		$("#play")
			.removeClass("fa-pause")
			.addClass("fa-play");
		Music.player.pause();
	},
	volume: function(volume)
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

		$('#mute')[0].className = c;
		
		$('#volume').find('.audio-volume-bar').css('width', (volume*100)+'%');
		Music.player.volume = volume;
	},
	mute: function(){
		Music.vol = Music.player.volume;
		Music.volume(0);
	},
	unmute: function(){
		Music.volume(Music.vol);
		Music.vol = 0;
	},
	init: function(){
		$("#volume").on('mousedown.music', function(e){
			e.preventDefault();
			Music.volume(Math.round(e.offsetX/$(this).width()*100)/100);
			$(window).on('mousemove.music', function(e){
				var vol = $("#volume");
				var offset = e.clientX - vol.offset().left;
				Music.volume(Math.round(offset/vol.width()*100)/100);
			});
		});

		$("#mute").on('click.music', function(){
			if(Music.vol == 0){
				Music.mute();
			} else {
				Music.unmute();
			}
		});

		$(window).on('mouseup.music', function(){
			$(window).off('mousemove.music');
		});

		$('body').on("click.music", ".music-selector-close", function(){
			$('.music-selector').fadeOut(300);
		});

		$(Music.player).on('ended.music', function(e){
			Music.pause();
			Music.next();
		});

		Music.player.volume = 1;
	},
	destroy: function(){
		Music.player.pause();
		Music.player.src = null;
		$("#volume").off('.music');
		$("#mute").off('.music');
		$('body').off('.music');
		$(window).off('.music');
		$(Music.player).off('.music');
	}
};