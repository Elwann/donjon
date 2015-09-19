var io = require('socket.io').listen(3000);
var DICES = require('./dices.js');

var messageid = 0;
var imagesid = 0;
var userid = 0;
var rooms = {};

function User(id, socket, name, admin)
{
	this.id = id;
	this.socket = socket;
	this.name = name;
	this.admin = admin || false;
	this.connected = true;
}

function Room(name, admin)
{
	this.name = name;
	this.admin = admin;
	this.users = [admin];
	this.messages = [];
	this.images = [];
	this.settings = {
		dices3D: true
	};

	if(this.settings.dices3D)
		this.dices = new DICES.Dices3D(this.name, 1000, 1000);

	console.log("Create room "+name+" by "+admin.name);
}

Room.prototype.getSocket = function() {
	return {
		name: this.name,
		users: this.users,
		messages: this.messages,
		settings: this.settings
	};
};

Room.prototype.isAdmin = function(name)
{
	return (name == this.admin.name);
};

Room.prototype.getUserByName = function(name)
{
	for (var i = this.users.length - 1; i >= 0; i--)
	{
		if(this.users[i].name.toLowerCase() == name.toLowerCase())
			return this.users[i];
	}

	return false;
};

Room.prototype.addUser = function(user)
{
	console.log("Add user "+user.name+" from room "+this.name);
	this.users.push(user);
};

Room.prototype.removeUser = function(user)
{
	console.log("Remove user "+user.name+" from room "+this.name);
	if(this.getUserByName(user.name))
		this.users.splice(this.users.indexOf(user), 1);
};

Room.prototype.getMessageIndexById = function(id)
{
	for (var i = this.messages.length - 1; i >= 0; i--)
	{
		if(this.messages[i].id == id)
			return i;
	}

	return -1;
};

Room.prototype.addMessage = function(message)
{
	var index = this.getMessageIndexById(message.id);
	if(index < 0){
		this.messages.push(message);
	} else {
		this.messages[index] = message;
	}
};

Room.prototype.getImageById = function(id)
{
	for (var i = this.images.length - 1; i >= 0; i--)
	{
		if(this.images[i].id == id)
			return this.images[i];
	}

	return false;
};

Room.prototype.parseMessage = function(user, socket, id, msg, action)
{
	if(!user)
		return;

	var that = this;

	var message = {
		id: id,
		user: user,
		message: msg
	};

	// On test si il y a une commande de type @Destinataire
	var receiver = testReceiver(message);
	if(receiver)
	{
		// On test si il y a un destinataire avec ce nom
		var dest = receiver;
		receiver = this.getUserByName(receiver);
		if(!receiver)
		{
			// Si non, on previent l'utilisateur et stop ici
			socket.emit('chat', chatError(message, dest+" is not in the room"));
			return;
		}
		// On test si le message est vide
		if(message.message == "")
		{
			// Si vide, on previent l'utilisateur et stop ici
			socket.emit('chat', chatError(message, "Please add your message after @"+dest));
			return;
		}
	}

	// On test si c'est un commande
	var command = testCommand(message.message);
	if(command)
	{
		// On tente de l'executer
		message = execCommand(command, message);
		if(message.error)
		{
			// Si la commande n'est pas reconnu, on l'indique
			console.log(user.name+' to '+this.name+': command error');
			socket.emit('chat', message);
			return;
		}
		else
		{
			// Si c'est une commande
			message["command"] = command;
			if(this.settings.dices3D)
			{
				if(command == '/roll')
				{
					var colors = ['#001F3F', '#0074D9', '#7FDBFF', '#39CCCC', '#3D9970', '#2ECC40', '#01FF70', '#FFDC00', '#FF851B', '#FF4136', '#85144B',  '#F012BE', '#B10DC9', '#DDDDDD'];
					var to = (receiver) ? receiver.socket : this.name;
					this.dices.roll(
						user,
						to,
						diceArray(message.dice),
						colors[Math.floor(colors.length * Math.random())],
						this.diceStart,
						this.diceUpdate,
						function(to, room, user, data){
							that.diceResult(to, room, user, data, receiver, message.dice);
						},
						this.diceEnd
					);
					return;
				}
			}
		}
	}
	
	// On envoie le message on bon destinataire
	console.log(user.name+' to '+this.name+': '+msg);
	if(receiver)
	{
		//TODO store private message
		message["prive"] = receiver.name;
		socket.emit(action, message);
		if(receiver.name.toLowerCase() != user.name.toLowerCase())
			io.to(receiver.socket).emit(action, message);
	}
	else
	{
		this.addMessage(message);
		io.to(this.name).emit(action, message);
	}
}

Room.prototype.diceStart = function(to, data)
{
	io.to(to).emit('dice start', data);
};

Room.prototype.diceUpdate = function(to, data)
{
	io.to(to).emit('dice update', data);
};

Room.prototype.diceResult = function(to, room, user, data, receiver, raw)
{
	var message = {
		id: messageid++,
		command: '/roll',
		dice: raw,
		user: user,
		message: '<span class="dice-original">'+raw+'</span> <span class="dice-total mui-text-display1">'+data.total+'</span> <span class="dice-detail mui-text-caption">detail '+data.details+'</span>'
	};

	if(to == room)
	{
		this.addMessage(message);
		io.to(to).emit('chat', message);
	}
	else if(receiver)
	{
		message["prive"] = receiver.name;
		socket.emit('chat', message);
		if(receiver.name.toLowerCase() != user.name.toLowerCase())
			io.to(receiver.socket).emit('chat', message);
	}
};

Room.prototype.diceEnd = function(to, data)
{
	io.to(to).emit('dice end', data);
};

io.on('connection', function(socket)
{
	console.log('user '+socket.id+' connected');

	var user;
	var room;

	//
	// Gestion du chat
	//
	function parseMessage(id, msg, action)
	{
		if(!room || !user)
			return;

		rooms[room].parseMessage(user, socket, id, msg, action);
	}
	
	socket.on('chat', function(msg){
		parseMessage(messageid++, msg, 'chat');
	});

	socket.on('chat edit', function(id, msg){
		parseMessage(id, msg, 'chat edit');
	});

	//
	// Gestion des images
	//
	socket.on('image upload', function(name, data)
	{
		if(!room || !user)
			return;

		// On crée une nouvelle image
		var image = {
			id: imagesid++,
			name: name,
			url: data
		};

		rooms[room].images.push(image);

		// On crée un message maintenant que l'image est upload
		var message = {
			id: messageid++,
			user: user,
			image: image.id,
			name: image.name
		};
		
		// On envoie le message avec le lien de l'image
		console.log(user.name+' to '+room+': image '+name);
		rooms[room].addMessage(message);
		io.to(room).emit('chat', message);
	});

	socket.on('image download', function(data){
		if(!room || !user)
			return;

		var image = rooms[room].getImageById(data);
		if(image){
			io.to(room).emit('image', image);
		}
	});

	//
	// Gestion de la musique
	//
	socket.on('music', function(song)
	{
		if(!room || !user)
			return;

		if(!user.admin)
			return;

		console.log('Play audio "'+song+'" in room '+room);
		io.to(room).emit('music', song);
	});

	socket.on('music pause', function()
	{
		if(!room || !user)
			return;

		if(!user.admin)
			return;

		console.log('Pause audio in room '+room);
		io.to(room).emit('music pause');
	});

	socket.on('music volume', function(volume)
	{
		if(!room || !user)
			return;

		if(!user.admin)
			return;

		console.log('Volume audio "'+volume+'" in room '+room);
		io.to(room).emit('music volume', volume);
	});

	//
	// Gestion du typing
	//
	socket.on('typing start', function()
	{
		if(!room || !user)
			return;

		io.to(room).emit('typing start', user);
	});

	socket.on('typing stop', function()
	{
		if(!room || !user)
			return;

		io.to(room).emit('typing stop', user);
	});

	//
	// Connection
	//
	socket.on('room join', function(data)
	{
		console.log('room join');

		// Si la room n'exist pas, on exit
		if(!rooms[data.room])
		{
			socket.emit('login', { 
				succes: false, 
				error: 'Room '+data.room+' don\'t exist. <br>Press "create" to create instead.'
			});
			return;
		}

		// Si l'user existe, on exit
		if(rooms[data.room].getUserByName(data.user))
		{
			socket.emit('login', { 
				succes: false, 
				error: 'User '+data.user+' exist. <br>Please use another name.'
			});
			return;
		}

		// Si tout est OK

		// On enregiste les valeurs
		room = data.room;
		user = new User(userid++, socket.id, data.user, rooms[room].isAdmin(data.user));
		// On s'ajoute a la room
		rooms[room].addUser(user);

		// On ajoute la socket a sa room
		socket.join(room);

		// TODO: Prévenir les autres de la connection
		io.to(room).emit('user login', user);

		// On notifie que la connection s'est bien passé
		socket.emit('login', { 
			succes: true,
			room: rooms[room].getSocket(),
			user: user
		});
	});

	socket.on('room create', function(data)
	{
		console.log('room create');

		// Si la room exist, on exit
		if(rooms[data.room])
		{
			socket.emit('login', { 
				succes: false, 
				error: 'Room '+data.room+' already exist. <br>Press "join" to join instead.'
			});
			return;
		}

		// Si tout est OK

		// On enregiste les valeurs
		room = data.room;
		user = new User(userid++, socket.id, data.user, true);
		// On s'ajoute a la room
		rooms[room] = new Room(room, user);

		// On ajoute la socket a sa room
		socket.join(room);

		// TODO: Prévenir les autres de la connection
		io.to(room).emit('user login', user);

		// On notifie que la connection s'est bien passé
		socket.emit('login', { 
			succes: true,
			room: rooms[room].getSocket(),
			user: user
		});
	});

	socket.on('disconnect', function()
	{
		if(!user && !room)
		{
			console.log('user '+socket.id+' disconnected');
			return;
		}
		
		rooms[room].removeUser(user);
		io.to(room).emit('user logout', user);
		console.log('user '+user.name+' disconnected from room '+room);
	});
});

function commandDice(message)
{
	var raw = message.message;
	var diceroll = message.message;

	if(raw.indexOf('d') < 0)
	{
		return chatError(message, "Not a valid dice");
	}

	function rollDice(match, p1, p2, offset, string)
	{
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
	message.message = '<span class="dice-original">'+raw+'</span> <span class="dice-total mui-text-display1">'+eval(total.replace(/[^-()\d/*+.]/g, ''))+'</span> <span class="dice-detail mui-text-caption">detail '+diceroll.trim()+'</span>';

	return message;
}

function diceArray(dice)
{
	var ds = dice.split(' ').join('+').split('+');
	var dices = [];
	for(var i = 0; i < ds.length; i++)
	{
		var d = ds[i].split('d');
		if(d[0] == '') 
			d[0] = 1;
		var l = parseInt(d[0], 10);
		for(var j = 0; j < l; j++)
			dices.push('d'+d[1]);
	}

	return dices;
}

function execCommand(command, message)
{
	message.message = message.message.replace(command+" ", "");

	switch(command){
		case "/roll": return commandDice(message); break;
		default: return chatError(message, "Unknown command");
	}
}

function testCommand(message)
{
	if(message.indexOf("/") != 0)
		return false;

	var msg = message.split(" ");
	var command = msg.shift();

	return command;
}

function testReceiver(message)
{
	if(message.message.indexOf("@") != 0)
		return false;

	message.message = message.message.split(" ");
	var receiver = message.message.shift().replace("@", "");
	message.message = message.message.join(" ");

	return receiver;
}

function chatError(message, error)
{
	message.message = error; 
	message["error"] = true; 
	return message;
}