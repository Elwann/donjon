var io = require('socket.io').listen(3000)

var rooms = {};

function User(name, admin){
	this.name = name;
	this.admin = admin || false;
	this.connected = true;
}

function Room(name, admin){
	this.name = name;
	this.admin = admin;
	this.users = [admin];
	this.messages = [];

	console.log("Create room "+name+" by "+admin.name);
}

Room.prototype.isAdmin = function(name) {
	return (name == this.admin.name);
};

Room.prototype.hasUserByName = function(name) {
	for (var i = this.users.length - 1; i >= 0; i--) {
		if(this.users[i].name.toLowerCase() == name.toLowerCase())
			return true;
	}

	return false;
};

Room.prototype.addUser = function(user) {
	console.log("Add user "+user.name+" from room "+this.name);
	this.users.push(user);
};

Room.prototype.removeUser = function(user) {
	console.log("Remove user "+user.name+" from room "+this.name);
	if(this.hasUserByName(user.name)) this.users.splice(this.users.indexOf(user), 1);
};

Room.prototype.addMessage = function(message){
	this.messages.push(message);
};

io.on('connection', function(socket){

	console.log('user connected');

	var user;
	var room;

	socket.on('chat', function(msg){
		if(!room || !user)
			return;

		var message = {
			user: user,
			message: msg
		};

		// On test si c'est un commande
		var command = testCommand(msg);
		if(command != ""){

			// On tente de l'executer
			message = execCommand(command, message);
			
			if(message.error){
				// Si la commande n'est pas reconnu, on l'indique
				console.log(user.name+' to '+room+': command error');
				socket.emit('chat', message);
				return;
			} else {
				// Si c'est un commande
				message["command"] = command;
			}
		}
		
		console.log(user.name+' to '+room+': '+msg);
		rooms[room].addMessage(message);
		io.to(room).emit('chat', message);
	});

	socket.on('music', function(song){
		if(!room || !user)
			return;

		if(!user.admin)
			return;

		console.log('Play audio "'+song+'" in room '+room);
		io.to(room).emit('music', song);
	});

	socket.on('music pause', function(){
		if(!room || !user)
			return;

		if(!user.admin)
			return;

		console.log('Pause audio in room '+room);
		io.to(room).emit('music pause');
	});

	socket.on('music volume', function(volume){
		if(!room || !user)
			return;

		if(!user.admin)
			return;

		console.log('Volume audio "'+volume+'" in room '+room);
		io.to(room).emit('music volume', volume);
	})

	socket.on('room join', function(data){
		console.log('room join');

		// Si la room n'exist pas, on exit
		if(!rooms[data.room]){
			socket.emit('login', { 
				succes: false, 
				error: 'Room '+data.room+' don\'t exist. <br>Press "create" to create instead.'
			});
			return;
		}

		// Si l'user existe, on exit
		if(rooms[data.room].hasUserByName(data.user)){
			socket.emit('login', { 
				succes: false, 
				error: 'User '+data.user+' exist. <br>Please use another name.'
			});
			return;
		}

		// Si tout est OK

		// On enregiste les valeurs
		room = data.room;
		user = new User(data.user, rooms[room].isAdmin(data.user));
		// On s'ajoute a la room
		rooms[room].addUser(user);

		// On ajoute la socket a sa room
		socket.join(room);

		// TODO: Prévenir les autres de la connection
		io.to(room).emit('user login', user);

		// On notifie que la connection s'est bien passé
		socket.emit('login', { 
			succes: true,
			room: rooms[room],
			user: user
		});
	});

	socket.on('room create', function(data){
		console.log('room create');

		// Si la room exist, on exit
		if(rooms[data.room]){
			socket.emit('login', { 
				succes: false, 
				error: 'Room '+data.room+' already exist. <br>Press "join" to join instead.'
			});
			return;
		}

		// Si tout est OK

		// On enregiste les valeurs
		room = data.room;
		user = new User(data.user, true);
		// On s'ajoute a la room
		rooms[room] = new Room(room, user);

		// On ajoute la socket a sa room
		socket.join(room);

		// TODO: Prévenir les autres de la connection
		io.to(room).emit('user login', user);

		// On notifie que la connection s'est bien passé
		socket.emit('login', { 
			succes: true,
			room: rooms[room],
			user: user
		});
	});

	socket.on('disconnect', function(){
		if(!user && !room){
			console.log('user disconnected');
			return;
		}
		
		rooms[room].removeUser(user);
		io.to(room).emit('user logout', user);
		console.log('user '+user.name+' disconnected from room '+room);
	});
});

function commandDice(message){

	var raw = message.message;
	var diceroll = message.message;

	if(raw.indexOf('d') < 0) {
		return chatError(message, "Not a valid dice");
	}

	function rollDice(match, p1, p2, offset, string){
		p1 = p1 || 1;

		var calc = [];
		for(var i = 0; i < p1; i++){
			calc.push(Math.ceil(Math.random()*p2));
		}

		if(calc.length > 1){
			return ' ( ' + calc.join(" + ") + ' ) ';
		} else {
			return ' ' + calc[0] + ' ';
		}
	}

	var re = /([0-9]*)d([0-9]+)/ig;

	var diceroll = diceroll.replace(re, rollDice);
	var total = diceroll;

	message["dice"] = message.message;
	message.message = '<span class="dice-original">rolls '+raw+'</span> <span class="dice-total mui-text-display1">'+eval(total.replace(/[^-()\d/*+.]/g, ''))+'</span> <span class="dice-detail mui-text-caption">detail '+diceroll.trim()+'</span>';

	return message;
}

function execCommand(command, message){
	message.message = message.message.replace(command+" ", "");

	switch(command){
		case "/roll": return commandDice(message); break;
		default: return chatError(message, "Unknown command");
	}
}

function testCommand(message){

	if(message.indexOf("/") != 0) return "";

	var message = message.split(" ");
	var command = message.shift();

	return command;
}

function chatError(message, error){
	message.message = error; 
	message["error"] = true; 
	return message;
}