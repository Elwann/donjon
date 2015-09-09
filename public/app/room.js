function Room(socket, name, user, users, messages)
{
	this.socket = socket;
	this.name = name;
	this.user = user;

	this.dices = new Dices(this);
	this.chat = new Chat(this, messages);
	this.music = new Music(this);

	this.$roomName = $("#room-name");
	this.$logout = $("#logout");
	this.$users = $("#users");

	this.init(users);
}

Room.prototype.init = function(users)
{
	var that = this;

	this.$roomName.text(this.name);

	// Setup users
	for(var i = 0, length = users.length; i < length; i++){
		this.showUser(users[i]);
	}

	// users
	this.socket.on('user login', function(data){
		that.showUser(data);
	});

	this.socket.on('user logout', function(data){
		that.removeUser(data);
	});

	// Is admin
	if(this.user.admin)
	{
		$("body").addClass('admin-layout');
	}

	// Login out
	this.$logout.on("click.room", function(e){
		e.preventDefault();
		Cookies.remove('login');
		that.destroy();		
		window.location.href = window.location.href; 
	});
};

Room.prototype.destroy = function()
{
	$("body").removeClass('admin-layout');
	this.$roomName.text("");
	this.$logout.off(".room");

	this.dices.destroy();
	this.chat.destroy();

	//TODO removeListener socket
};

Room.prototype.showUser = function(user)
{
	var c = "user";
	if(user.admin) c += " admin";
	if(user.name == this.user.name) c += " me";
	this.$users.append('<li class="'+c+'" id="user-'+user.name+'">'+user.name+'</li>');
};

Room.prototype.removeUser = function(user)
{
	$("#users #user-"+user.name).remove();
};