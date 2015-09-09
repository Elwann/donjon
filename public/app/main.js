(function(){

	//
	// Socket connection and login gestion
	//

	var url = Config.url || 'http://localhost:3000';
	var socket = io(url);

	var room;

	// Join room
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

	// Create room
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

	// Wait for server login event and create Room Object
	socket.on('login', function(data){
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
		socket.emit('room join', {
			room: ck[0],
			user: ck[1]
		});
	}

})();