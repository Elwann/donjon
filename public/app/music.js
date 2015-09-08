var Music = {
	playlist: [],
	current: 0,
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
		musiclist += '<ul>';

		return musiclist;
	},
	showList: function(){
		$.post('music/list.php', function(data){

			//var musiclist = '';

			//for(var i = 0; i < data.length; i++){
			//	musiclist += '<li class="song" data-song="music/'+data[i]+'">'+data[i]+'</li>';
			//}

			$("body").append(
				'<div class="music-selector overlay centerer">'+
					'<div class="popin mui-panel centered">'+
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
		$('#volume').find('.audio-volume-bar').css('width', (volume*100)+'%');
		Music.player.volume = volume;
	}
};

$("#volume").mousedown(function(e){
	e.preventDefault();
	Music.volume(Math.round(e.offsetX/$(this).width()*100)/100);
	$(window).on('mousemove.volume', function(e){
		var vol = $("#volume");
		var offset = e.clientX - vol.offset().left;
		Music.volume(Math.round(offset/vol.width()*100)/100);
	});
});

$(window).mouseup(function(){
	$(window).off('mousemove.volume');
});

$(Music.player).on('ended', function(e){
	Music.pause();
	Music.next();
});

Music.player.volume = 1;