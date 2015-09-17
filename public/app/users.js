function Users(room, users)
{
	this.room = room;
	this.users = [];

	this.$users = $("#users");

	this.init(users);
}

Users.prototype.getUserByName = function(name) {
	for (var i = this.users.length - 1; i >= 0; i--) {
		if(this.users[i].name.toLowerCase() == name.toLowerCase())
			return this.users[i];
	}

	return false;
};

Users.prototype.showUser = function(user)
{
	var c = "user";
	if(user.admin) c += " admin";
	if(user.name == this.room.user.name) c += " me";

	var $user = '<li class="'+c+'" id="user-'+user.id+'">'+user.name+'<span class="user-dice"></span></li>';

	if(user.admin) {
		this.$users.prepend($user);
	} else {
		this.$users.append($user);
	}
};

Users.prototype.addUser = function(user)
{
	if(user.admin) {
		this.users.shift(user);
	} else {
		this.users.push(user);
	}

	this.showUser(user);
};

Users.prototype.removeUser = function(user)
{
	var index = this.users.indexOf(user);
	if(index >= 0)
		this.users.splice(index, 1);
	
	$("#user-"+user.id).remove();
};

Users.prototype.typingStart = function(user)
{
	$("#user-"+user.id).addClass("typing");
};

Users.prototype.typingStop = function(user)
{
	$("#user-"+user.id).removeClass("typing");
};

Users.prototype.showLastDice = function(user, dice)
{
	$("#user-"+user.id).find(".user-dice").html(dice);
};

Users.prototype.init = function(users)
{
	var that = this;

	// Setup users
	for(var i = 0, length = users.length; i < length; i++){
		this.addUser(users[i]);
	}

	// Users connexions
	this.room.socket.on('user login', function(data){
		that.addUser(data);
	});

	this.room.socket.on('user logout', function(data){
		that.removeUser(data);
	});

	// Users typing
	this.room.socket.on('typing start', function(data){
		that.typingStart(data);
	});

	this.room.socket.on('typing stop', function(data){
		that.typingStop(data);
	});
};

Users.prototype.destroy = function()
{
	this.room.socket.removeAllListeners('user login');
	this.room.socket.removeAllListeners('user logout');
	this.room.socket.removeAllListeners('typing start');
	this.room.socket.removeAllListeners('typing stop');
};