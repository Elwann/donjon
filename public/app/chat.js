function Chat(room, messages)
{
	this.room = room;
	this.messages = [];
	this.typing = null;

	this.$messages = $("#messages");
	this.$message = $("#message");
	this.$content = $("#content");
	this.$chat = $("#chat");

	this.init(messages);
}

Chat.prototype.getClass = function(data) {
	var c = '';
	if(data.user.name == this.room.user.name) c += ' me';
	if(data.user.admin) c += ' admin';
	if(data.prive) c += ' prive';

	return c;
};

Chat.prototype.showCommand = function(data)
{
	switch(data.command){
		case "/roll":
			this.$messages.append($('<li id="msg-'+this.messages.length+'" class="diceroll mui-panel'+this.getClass(data)+'">').html('<span class="user">'+((data.prive) ? data.user.name+' to '+data.prive : data.user.name)+':</span> '+data.message));
			this.messages.push(data);
			this.room.users.showLastDice(data.user, data.message);
			if(data.user.name == this.room.user.name) this.room.dices.roll(data.dice);
			break;
	}

	this.$content.scrollTop(this.$content[0].scrollHeight);

	return true;
};

Chat.prototype.showError = function(data)
{
	data.user.name = "error";
	this.$messages.append($('<li id="msg-'+this.messages.length+'" class="message error me">').html(data.message));
	this.messages.push(data);
	this.$content.scrollTop(this.$content[0].scrollHeight);
	return;
};

Chat.prototype.addMessage = function(data)
{
	if(data.error){
		this.showError(data);
		return;
	}

	if(data.command){
		this.showCommand(data);
		return;
	}

	if(this.messages.length > 0 && this.messages[this.messages.length-1].user.name == data.user.name && !this.messages[this.messages.length-1].command && this.messages[this.messages.length-1].prive == data.prive){
		this.messages[this.messages.length-1].message += "<br>"+data.message;
		$('#msg-'+(this.messages.length-1)).find('.text').append("<br>"+data.message);
	} else {
		// Change le nom pour différencer privé / public
		this.$messages.append($('<li id="msg-'+this.messages.length+'" class="message mui-panel'+this.getClass(data)+'">').html(
			'<span class="user">'+((data.prive) ? data.user.name+' to '+data.prive : data.user.name)+':</span> '+
			'<span class="text">'+data.message+'</span>'
		));

		this.messages.push(data);
	}

	this.$content.scrollTop(this.$content[0].scrollHeight);
};

Chat.prototype.typingStart = function()
{
	var that = this;
	if(this.typing)
	{
		// Si typing en cours, on update
		clearTimeout(this.typing);
		this.typing = setTimeout(function(){ that.typingStop(); }, 2500);
	}
	else
	{
		// Sinon on emet l'info
		this.room.socket.emit('typing start');
		this.typing = setTimeout(function(){ that.typingStop(); }, 2500);
	}
};

Chat.prototype.typingStop = function()
{
	clearTimeout(this.typing);
	this.typing = null;
	this.room.socket.emit('typing stop');
};

Chat.prototype.init = function(messages)
{
	var that = this;

	// Ajouter messages existants
	for (i = 0, length = messages.length; i < length; i++) {
		this.addMessage(messages[i]);
	}

	// Envoyer message
	this.$chat.on("submit.chat", function(e){
		e.preventDefault();

		var message = that.$message.val();

		if(message != ""){
			that.room.socket.emit('chat', message);
			that.$message.val('');
			that.typingStop();
		}

		return false;
	});

	// Recevoir messages
	this.room.socket.on('chat', function(data){
		that.addMessage(data);
	});

	// Gestion du typing
	this.$message.on("keypress.chat", function(e){
		// e.keyCode : 8 back, 13 entrée
		if(e.keyCode != 8 && e.keyCode != 13)
		{
			that.typingStart();
		}
	});
};

Chat.prototype.destroy = function()
{
	this.$chat.off(".chat");
	this.$message.off(".chat");
	this.room.socket.removeAllListeners('chat');
};