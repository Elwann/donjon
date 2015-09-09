function Chat(room, messages)
{
	this.room = room;
	this.messages = [];

	this.$messages = $("#messages");
	this.$message = $("#message");
	this.$content = $("#content");
	this.$chat = $("#chat");

	this.init(messages);
}

Chat.prototype.showCommand = function(data)
{
	switch(data.command){
		case "/roll":
			var c = '';
			if(data.user.name == this.room.user.name) c += ' me';
			if(data.user.admin) c += ' admin';
			this.$messages.append($('<li id="msg-'+this.messages.length+'" class="diceroll mui-panel'+c+'">').html('<span class="user">'+data.user.name+':</span> '+data.message));
			this.messages.push(data);
			if(data.user.name == this.room.user.name) this.room.dices.roll(data.dice);
			break;
	}

	this.$content.scrollTop(this.$content[0].scrollHeight);

	return true;
};

Chat.prototype.showError = function(data)
{
	this.$messages.append($('<li id="msg-'+this.messages.length+'" class="message error me">').html(data.message));
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

	if(this.messages.length > 0 && this.messages[this.messages.length-1].user.name == data.user.name && !this.messages[this.messages.length-1].command){
		this.messages[this.messages.length-1].message += "<br>"+data.message;
		$('#msg-'+(this.messages.length-1)).find('.text').append("<br>"+data.message);
	} else {
		var c = '';
		if(data.user.name == this.room.user.name) c += ' me';
		if(data.user.admin) c += ' admin';

		this.$messages.append($('<li id="msg-'+this.messages.length+'" class="message mui-panel'+c+'">').html(
			'<span class="user">'+data.user.name+':</span> '+
			'<span class="text">'+data.message+'</span>'
		));

		this.messages.push(data);
	}

	this.$content.scrollTop(this.$content[0].scrollHeight);
};

Chat.prototype.init = function(messages)
{
	var that = this;

	for (i = 0, length = messages.length; i < length; i++) {
		this.addMessage(messages[i]);
	}

	// chat
	this.$chat.on("submit.chat", function(e){
		e.preventDefault();

		var message = that.$message.val();

		if(message != ""){
			that.room.socket.emit('chat', message);
			that.$message.val('');
		}

		return false;
	});

	this.room.socket.on('chat', function(data){
		that.addMessage(data);
	});
};

Chat.prototype.destroy = function()
{
	this.$chat.off(".chat");
	//TODO removeListener socket
};