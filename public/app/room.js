function Room(socket, name, user, users, messages)
{
	this.socket = socket;
	this.name = name;
	this.user = user;

	this.dices = new Dices(this);
	this.users = new Users(this, users);
	this.images = new Images(this);
	this.chat = new Chat(this, messages);
	this.music = new Music(this);

	this.$roomName = $("#room-name");
	this.$logout = $("#logout");

	this.init(users);
}

Room.prototype.init = function(users)
{
	var that = this;

	this.$roomName.text(this.name);

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
	this.users.destroy();
	this.chat.destroy();
	this.music.destroy();
};