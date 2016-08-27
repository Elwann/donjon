function Users(room, users)
{
	this.room = room;
	this.users = [];
	this.grabbed = null;
	this.ghost = null;

	this.$users = $("#users");
	this.item;

	this.init(users);
}

Users.prototype.getUserByName = function(name) {
	for (var i = this.users.length - 1; i >= 0; i--) {
		if(this.users[i].name.toLowerCase() == name.toLowerCase())
			return this.users[i];
	}

	return false;
};

Users.prototype.getUserById = function(id) {
	for (var i = this.users.length - 1; i >= 0; i--) {
		if(this.users[i].id == id)
			return this.users[i];
	}

	return false;
};

Users.prototype.getIndexById = function(id) {
	for (var i = this.users.length - 1; i >= 0; i--) {
		if(this.users[i].id == id)
			return i;
	}

	return -1;
};

Users.prototype.showUser = function(user)
{
	var c = "user";
	if(user.admin) c += " admin";
	if(user.name == this.room.user.name) c += " me";

	var $caracs =
		'<div class="user-details mui-panel">' +
			'<!--<div class="title"><strong>Characteristics</strong></div>' +
			'<div class="user-health noselect" data-carac="health"><i class="fa fa-heart"></i> <span>8</span></div>' +
			'<div class="user-defense noselect" data-carac="defense"><i class="fa fa-shield"></i> <span>8</span></div>-->' +
			'<div class="title"><strong>Tokens</strong></div>' +
			'<div class="user-tokens"></div>' +
		'</div>';

	var $user = '<li data-user="'+user.id+'" data-sort="'+user.order+'" class="user-item '+c+'" id="user-'+user.id+'">'+user.name+'<span class="user-dice"></span>'+$caracs+'</li>';

	if(user.admin) {
		this.$users.prepend($user);
	} else {
		this.$users.append($user);
	}

	this.refreshTokens(user);
};

Users.prototype.addUser = function(user)
{
	if(user.admin) {
		this.users.unshift(user);
	} else {
		this.users.push(user);
	}

	this.showUser(user);
	this.order();
};

Users.prototype.removeUser = function(user)
{
	var index = this.getIndexById(user.id);
	if(index >= 0)
		this.users.splice(index, 1);

	$("#user-"+user.id).remove();
	this.order();
};

Users.prototype.refreshTokens = function(user)
{
	u = this.getUserById(user.id);
	if(u){
		u.tokens = user.tokens;
		var ts = $("#user-"+user.id+" .user-tokens");
		var tok = "";

		for(var t in u.tokens){
			tok += '<div class="token '+t+'" data-user="'+user.id+'" data-token="'+t+'">'+u.tokens[t]+'</div>';
		}

		if(tok == ""){
			ts.html('<div class="notoken">No tokens</div>');
		} else {
			ts.html(tok);
		}
	}
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

Users.prototype.grab = function(elem, position)
{
	if(this.grabbed !== null || !this.room.user.admin || elem.hasClass('admin'))
		return;

	var self = this;
	$('body').addClass('grabbing');
	this.ghost = elem.clone()
		.css({
			position: "absolute",
			top: "0",
			left: "0",
			width: elem.outerWidth()+'px',
			transform: "translate("+position.x+"px, "+position.y+"px)"
		})
		.appendTo('body');
	this.grabbed = elem.addClass('grabbing');

	$('body').on('mouseup.sortable', function(e){
		e.preventDefault();
		self.release({x:e.pageX, y:e.pageY});
	});

	$('body').on('mousemove.sortable', function(e){
		e.preventDefault();
		self.grabbing({x:e.pageX, y:e.pageY});
	});
};

Users.prototype.grabbing = function(position)
{
	if(this.grabbed === null)
		return;

	var self = this;
	this.ghost.css("transform", "translate("+position.x+"px, "+position.y+"px)");

	this.items.each(function(){
		var $this = $(this);
		if(!$this.hasClass('grabbing') && !$this.hasClass('admin')){
			var top = $this.offset().top;
			var height = $this.outerHeight();
			if(top < position.y && position.y< top + height){
				// if is in range
				if(position.y> top + height / 2){
					self.grabbed.after($this);
				} else {
					self.grabbed.before($this);
				}

				return;
			}
		}
	});
};

Users.prototype.release = function()
{
	if(this.grabbed === null)
		return;

	$('body').removeClass('grabbing');
	this.grabbed.removeClass('grabbing');
	this.grabbed = null;
	this.ghost.remove();
	this.ghost = null;
	$('body').off('.sortable');

	if(this.room.user.admin)
		this.ordering();
};

Users.prototype.order = function()
{
	var that = this;
	this.items = this.$users.find('.user').sort(function(a, b){
		return parseInt($(a).data('sort'), 10) - parseInt($(b).data('sort'), 10);
	}).each(function(index){
		var order = $(this).data('sort');
		that.$users.append($(this));
	});
};

Users.prototype.ordering = function()
{
	var data = {};
	this.items = this.$users.find('.user');
	this.items.each(function(index){
		$(this).data('sort', index);
		var id = $(this).data('user');
		if(id && index)
			data[id] = index;
	});

	this.room.socket.emit('user order', data);
};

Users.prototype.sort = function(list)
{
	for(var l in list){
		l = parseInt(l, 10);
		var user = this.getUserById(l);
		if(user){
			user.order = parseInt(list[l], 10);
			$("#user-"+l).data('sort', list[l]);
		}
	}

	this.order();
};

Users.prototype.init = function(users)
{
	var that = this;

	// Setup users
	for(var i = 0, length = users.length; i < length; i++){
		var user = users[i];
		if(user.connected){
			if(user.name.toLowerCase() == this.room.user.name.toLowerCase()){
				user = this.room.user;
			}

			this.addUser(user);
			this.refreshTokens(user);
		}
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

	// User token
	this.room.socket.on('token give', function(data){
		that.refreshTokens(data);
	});

	this.room.socket.on('token use', function(data, token){
		that.refreshTokens(data);
		var token = $(
			'<div id="token-popin-'+data.id+'" class="before overlay centerer">'+
				'<div class="popin centered mui-panel text-align-center">'+
					'<h3>'+data.name+' use '+token+' token</h3>'+
					'<div class="'+token+' token big">&nbsp;</div>'+
				'</div>'+
			'</div>');
		$('body').append(token);

		token.delay(2000).fadeOut(300, function(){$("#token-popin-"+data.id).remove();});
		setTimeout(function(){token.removeClass('before');});
	});

	// User order
	this.room.socket.on('user order', function(data){
		console.log(data);
		that.sort(data);
	});

	if(this.room.user.admin){
		this.$users.on('mousedown.sortable', '.user-details', function(e){
			e.preventDefault();
			e.stopPropagation();
		});

		this.$users.on('mousedown.sortable', '.user', function(e){
			e.preventDefault();
			that.grab($(this), {x:e.pageX, y:e.pageY});
		});

		$('body').on('click.token', '#users .user .token', function(){
			that.room.socket.emit('token use', $(this).data('user'), $(this).data('token'));
		});
	} else {
		$('body').on('click.token', '#user-'+this.room.user.id+' .token', function(){
			that.room.socket.emit('token use', that.room.user.id, $(this).data('token'));
		});
	}

	this.order();
};

Users.prototype.destroy = function()
{
	this.room.socket.removeAllListeners('user login');
	this.room.socket.removeAllListeners('user logout');
	this.room.socket.removeAllListeners('typing start');
	this.room.socket.removeAllListeners('typing stop');
	this.$users.off('.sortable');
	$('body').off('.token').off('.sortable');
};
