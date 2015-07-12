// Listen on port 1080 (arbitrarily chosen here and in index.html
var io = require('socket.io').listen(3000)

var rooms = {};

function Room(name, admin){
	this.name = name;
	this.admin = admin;
	this.users = [admin];
	this.messages = [];

	console.log("Create room "+name+" by "+admin);
}

Room.prototype.isAdmin = function(user) {
	return (user == this.admin);
};

Room.prototype.hasUser = function(user) {
	return (this.users.indexOf(user) != -1);
};

Room.prototype.addUser = function(user) {
	console.log("Add user "+user+" from room "+this.name);
	this.users.push(user);
};

Room.prototype.removeUser = function(user) {
	console.log("Remove user "+user+" from room "+this.name);
	if(this.hasUser(user)) this.users.splice(this.users.indexOf(user), 1);
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
			admin: rooms[room].isAdmin(user),
			message: msg
		};

		// On test si c'est un commande
		var command = testCommand(msg);
		if(command != ""){

			// On tente de l'executer
			message.message = execCommand(command, msg);
			
			if(message.message != ""){
				// Si c'est un commande
				message["command"] = command;
			} else {
				// Si la commande n'est pas reconnu, on l'indique
				socket.on('message', {
					type: "warning",
					message: "Unknown command"
				});

				return;
			}
		}
		
		rooms[room].addMessage(message);

		console.log(user+' to '+room+': '+msg);
		io.to(room).emit('chat', message);
	});

	socket.on('music', function(song){
		if(!room || !user)
			return;

		if(!rooms[room].isAdmin(user))
			return;

		console.log('Play audio "'+song+'" in room '+room);
		io.to(room).emit('music', song);
	});

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
		if(rooms[data.room].hasUser(data.user)){
			socket.emit('login', { 
				succes: false, 
				error: 'User '+data.user+' exist. <br>Please use another name.'
			});
			return;
		}

		// Si tout est OK
		// On enregiste les valeurs
		room = data.room;
		user = data.user;
		// On s'ajoute a la room
		rooms[room].addUser(user);

		// On ajoute la socket a sa room
		socket.join(room);

		// On notifie que la connection s'est bien passé
		socket.emit('login', { 
			succes: true,
			room: rooms[room],
			user: user,
			admin: rooms[room].isAdmin(user)
		});

		// TODO: Prévenir les autres de la connection
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
		user = data.user;
		// On s'ajoute a la room
		rooms[room] = new Room(room, user);

		// On ajoute la socket a sa room
		socket.join(room);

		// On notifie que la connection s'est bien passé
		socket.emit('login', { 
			succes: true,
			room: rooms[room],
			user: user,
			admin: rooms[room].isAdmin(user)
		});

		// TODO: Prévenir les autres de la connection
	});

	socket.on('disconnect', function(){
		if(!user && !room){
			console.log('user disconnected');
			return;
		}
		
		rooms[room].removeUser(user);
		console.log('user '+user+' disconnected from room '+room);
	});
});

function commandDice(message){

	var raw = message;
	var diceroll = message;

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

	return '<span class="dice-original">rolls '+raw+'</span> <span class="dice-total mui-text-display1">'+eval(total.replace(/[^-()\d/*+.]/g, ''))+'</span> <span class="dice-detail mui-text-caption">detail '+diceroll.trim()+'</span>';
}

function execCommand(command, message){
	message = message.replace(command+" ", "");

	switch(command){
		case "/roll": return commandDice(message); break;
		default: ""
	}
}

function testCommand(message){

	if(message.indexOf("/") != 0) return "";

	var message = message.split(" ");
	var command = message.shift();

	return command;
}