(function(){

	//
	// Socket connection and online gestion
	//

	var url = Config.url || 'http://localhost:3000';
	var socket = io(url);

	var name;
	var messages = [];

	function setupRoom(room){

		// Hide login
		$(".login-wrapper").fadeOut(300);

		// Setup layout
		$("#room-name").text(room.name);

		// Setup users
		for(var i = 0, length = room.users.length; i < length; i++){
			showUser(room.users[i]);
		}

		// Setup messages
		for (i = 0, length = room.messages.length; i < length; i++) {
			addMessage(room.messages[i]);
		}

		// Setup dices
		//Dices.load(room.name+" dices");

		// users
		socket.on('user login', function(data){
			showUser(data);
		});

		socket.on('user logout', function(data){
			removeUser(data);
		});
		
		// chat
		$('#chat').submit(function(){
			var message = $('#message').val();

			if(message != ""){
				socket.emit('chat', message);
				$('#message').val('');
			}

			return false;
		});

		socket.on('chat', function(data){
			addMessage(data);
		});

		// Dice
		$(document).on("click", ".dice", function(e){
			e.preventDefault();
			var dice = $(this).html();
			socket.emit('chat', "/roll "+dice);
		});

		// Music
		socket.on('music', function(data){
			Music.load(data);
		});

		socket.on('music pause', function(){
			Music.pause();
		});

		socket.on('music volume', function(data){
			Music.volume(data);
		});

		// Is admin
		if(name.admin){
			$("body").addClass('admin-layout');
			$('.room-wrapper').append('<div id="music-player"><div class="music-title">Click to choose song</div></div>');

			$("#music-player").click(function(e){
				e.preventDefault();
				Music.showList();
			});

			$("#play").click(function(e){
				e.preventDefault();
				var $this = $(this);
				if($this.hasClass('fa-play')){
					Music.showList();
				} else {
					socket.emit('music pause');
				}
			});
		}
	}

	function joinRoom(){
		var room = $("#room").val();
		var user = $("#user").val();

		if(room == "" || user == "") return false;

		socket.emit('room join', {
			room: room,
			user: user
		});

		return false;
	}

	function createRoom(){
		var room = $("#room").val();
		var user = $("#user").val();

		if(room == "" || user == "") return false;

		socket.emit('room create', {
			room: room,
			user: user
		});

		return false;
	}

	socket.on('login', function(data){
		if(!data.succes){
			$("#login-msg").html(data.error).addClass('error');
			return;
		}

		name = data.user;
		Cookies.set('login', data.room.name+'|'+data.user.name, { expires: 356 });
		setupRoom(data.room);
	});

	$("#login").submit(joinRoom);
	$("#join").click(joinRoom);
	$("#create").click(createRoom);

	$("#logout").click(function(e){
		e.preventDefault();
		Cookies.remove('login');
		Dices.unload();
		window.location.href = window.location.href; 
	});

	var cookie = Cookies.get('login');
	if(cookie) {
		var ck = cookie.split("|");
		socket.emit('room join', {
			room: ck[0],
			user: ck[1]
		});
	}

	//
	// Users
	//

	function showUser(user)
	{
		var c = "user";
		if(user.admin) c += " admin";
		if(user.name == name.name) c += " me";
		$("#users").append('<li class="'+c+'" id="user-'+user.name+'">'+user.name+'</li>');
	}

	function removeUser(user)
	{
		$("#users #user-"+user.name).remove();
	}

	//
	// Chat
	//

	function showCommand(data){

		switch(data.command){
			case "/roll":
				var c = '';
				if(data.user.name == name.name) c += ' me';
				if(data.user.admin) c += ' admin';
				$('#messages').append($('<li id="msg-'+messages.length+'" class="diceroll mui-panel'+c+'">').html('<span class="user">'+data.user.name+':</span> '+data.message));
				messages.push(data);
				if(data.user.name == name.name) Dices.roll(data.dice);
				break;
		}

		var content = $("#content");
		content.scrollTop(content[0].scrollHeight);

		return true;
	}

	function showError(data){
		$('#messages').append($('<li id="msg-'+messages.length+'" class="message error me">').html(data.message));
		var content = $("#content");
		content.scrollTop(content[0].scrollHeight);
		return;
	}

	function addMessage(data){

		if(data.error){
			showError(data);
			return;
		}

		if(data.command){
			showCommand(data);
			return;
		}

		if(messages.length > 0 && messages[messages.length-1].user.name == data.user.name && !messages[messages.length-1].command){
			messages[messages.length-1].message += "<br>"+data.message;
			$('#msg-'+(messages.length-1)).find('.text').append("<br>"+data.message);
		} else {
			var c = '';
			if(data.user.name == name.name) c += ' me';
			if(data.user.admin) c += ' admin';

			$('#messages').append($('<li id="msg-'+messages.length+'" class="message mui-panel'+c+'">').html(
				'<span class="user">'+data.user.name+':</span> '+
				'<span class="text">'+data.message+'</span>'
			));

			messages.push(data);
		}

		var content = $("#content");
		content.scrollTop(content[0].scrollHeight);
	}


	//
	// Music player
	//

	$('body').on('click', '.song', function(){
		$('.music-selector').fadeOut(300);
		if(name.admin){
			socket.emit('music', [$(this).attr('data-song')]);
		}
	});

	$('body').on('click', '.playlist', function(e){
		$('.music-selector').fadeOut(300);
		if(name.admin){
			var songs = [];
			$(this).next('ul').find('.song').each(function(){
				songs.push($(this).attr('data-song'));
			});

			socket.emit('music', songs);
		}
	});

})();