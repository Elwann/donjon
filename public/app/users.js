function Users(room, users)
{
	this.room = room;
	this.users = [];

	this.$users = $("#users");

	this.init(users);
}

Users.prototype.showUser = function(user)
{
	var c = "user";
	if(user.admin) c += " admin";
	if(user.name == this.room.user.name) c += " me";

	var $user = '<li class="'+c+'" id="user-'+user.name+'">'+user.name+'</li>';

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
	$("#users #user-"+user.name).remove();
};

Users.prototype.init = function(users)
{
	var that = this;

	// Setup users
	for(var i = 0, length = users.length; i < length; i++){
		this.addUser(users[i]);
	}

	// users
	this.room.socket.on('user login', function(data){
		that.addUser(data);
	});

	this.room.socket.on('user logout', function(data){
		that.removeUser(data);
	});
};

Users.prototype.destroy = function()
{
	this.room.socket.removeAllListeners('user login');
	this.room.socket.removeAllListeners('user logout');
};