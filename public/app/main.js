(function(){

	//
	// Socket connection and login gestion
	//

	var url = Config.url || 'http://localhost:3000';
	var socket = io(url);

	var room;
	var loading = false;

	function loginRoom(item, room, user, action)
	{
		if(room == "" || user == "" || loading) 
			return false;

		loading = true;
		item.append('&nbsp;&nbsp;<i id="loading" class="fa fa-spin fa-refresh"></i>');
		socket.emit(action, { room: room, user: user });
	}

	// Join room
	function joinRoom()
	{
		loginRoom($("#join"), $("#room").val(), $("#user").val(), 'room join');
		return false;
	}

	// Create room
	function createRoom()
	{
		loginRoom($("#create"), $("#room").val(), $("#user").val(), 'room create');
		return false;
	}

	// Wait for server login event and create Room Object
	socket.on('login', function(data){
		loading = false;
		$("#loading").remove();

		if(!data.succes){
			$("#login-msg").html(data.error).addClass('error');
			return;
		}

		room = new Room(socket, data.room.name, data.user, data.room.users, data.room.messages);
		Cookies.set('login', data.room.name+'|'+data.user.name, { expires: 356 });

		$(".login-wrapper").fadeOut(300);
	});

	// Handle click events
	$("#login").submit(joinRoom);
	$("#join").click(joinRoom);
	$("#create").click(createRoom);

	// If cookie try to login
	var cookie = Cookies.get('login');
	if(cookie) {
		var ck = cookie.split("|");
		loginRoom($("#join"), ck[0], ck[1], 'room join');
	}

})();