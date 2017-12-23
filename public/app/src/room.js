function Room(socket, name, user, users, messages, options)
{
	this.socket = socket;
	this.name = name;
	this.user = user;

	this.dices = new Dices(this, options.defaultDices);
	if(hasWebGLSupport()){
		this.dice = new Dices3D(this, window.innerWidth, window.innerHeight);
	} else {
		this.dice = new Dices2D(this, window.innerWidth, window.innerHeight);
	}
	this.users = new Users(this, users);
	this.images = new Images(this);
	this.chat = new Chat(this, messages);
	this.music = new Music(this);
	this.options = options;

	this.$options = $('#options');
	this.$roomName = $("#room-name");
	this.$logout = $("#logout");

	this.optionsOpened = false;

	this.init(users);
}

Room.prototype.init = function(users)
{
	var that = this;

	this.$roomName.text(this.name);

	// Is admin
	if(this.user.admin)
	{
		$("body")
			.addClass('admin-layout')
			.on('click.room', '.options-save', $.proxy(that.saveOptions, that))
			.on('click.room', '.options-close', $.proxy(that.closeOptions, that));
		this.$options.on('click.room', $.proxy(that.showOptions, that));
	}

	// Login out
	this.$logout.on("click.room", function(e){
		e.preventDefault();
		Cookies.remove('login');
		that.destroy();
		window.location.href = window.location.href;
	});

	this.socket.on('change settings', function(data){
		//TODO: change settings without reloading
		window.location.href = window.location.href;
	});

	this.socket.on('disconnect', function(){
		that.destroy();
		window.location.href = window.location.href;
	});
};

Room.prototype.showOptions = function()
{
	var contenu = '<div id="options-popin" class="overlay centerer"><div class="popin mui-panel centered"><i class="options-close popin-close fa fa-times link"></i>';
	contenu += '<div class="mui-form-group"><label for="options-dices-3d">Use 3D dice</label><input id="options-dices-3d" type="checkbox"'+((this.options.dices3D) ? ' checked' : ' ')+'></div>';
<<<<<<< HEAD
	contenu += '<div class="mui-form-group"><input id="options-default-dices" class="mui-form-control mui-empty mui-dirty" type="text" value="'+this.options.defaultDices.join(' ')+'"><label>Default dice (separated by spaces)</label></div>';
	contenu += '<div class="mui-form-group"><input id="options-custom-roll" class="mui-form-control mui-empty mui-dirty" type="text" value="'+this.options.customRoll+'"><label>/dice command (custom /roll where agument are remplacing $n)</label></div>';
	contenu += '<button class="options-close mui-btn mui-btn-flat mui-btn-default mui-pull-left">Cancel</button><button class="options-close mui-btn mui-btn-raised mui-btn-primary mui-pull-right">Save</button>';
=======
	contenu += '<div class="mui-form-group"><input id="options-default-dices" class="mui-form-control mui-empty mui-dirty" type="text" value="'+this.options.defaultDices.join(',')+'"><label>Default dice (separated by comma)</label></div>';
	contenu += '<div class="mui-form-group"><input id="options-custom-roll" class="mui-form-control mui-empty mui-dirty" type="text" value="'+this.options.customRoll+'"><label>/dice command (custom /roll where agument are remplacing $n)</label></div>';
	contenu += '<button class="options-close mui-btn mui-btn-flat mui-btn-default mui-pull-left">Cancel</button><button class="options-save mui-btn mui-btn-raised mui-btn-primary mui-pull-right">Save</button>';
>>>>>>> 5fa72a5fc2f18b08cdee9cfeff3e5b6da2899e70
	contenu += '</div></div>';
	$('body').append(contenu);
	this.optionsOpened = true;
};

Room.prototype.saveOptions = function()
{
	if(!this.user.admin)
		return;

<<<<<<< HEAD
	this.options.dices3D = $('#options-default-dices').prop('checked');

	console.log(this.options);

	this.socket.emit('save options', this.options);
=======
	var options = {
		dices3D: $('#options-dices-3d').prop('checked'),
		defaultDices: $('#options-default-dices').val().split(','),
		customRoll: $('#options-custom-roll').val()
	};

	this.socket.emit('save settings', options);
>>>>>>> 5fa72a5fc2f18b08cdee9cfeff3e5b6da2899e70
	this.closeOptions();
};

Room.prototype.closeOptions = function()
{
	if(this.optionsOpened == false)
		return;

	$('#options-popin').remove();
	this.optionsOpened = false;
};

Room.prototype.destroy = function()
{
	$("body")
		.removeClass('admin-layout')
		.off(".room");
	this.$roomName.text("");
	this.$logout.off(".room");
	this.$options.off(".room");

	this.dices.destroy();
	this.users.destroy();
	this.chat.destroy();
	this.music.destroy();
};
