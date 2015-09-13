function Chat(room, messages)
{
	this.msgbox = 0;
	this.room = room;
	this.messages = [];
	this.myMessages = [];
	this.typing = null;
	this.editMode = -1;

	this.$messages = $("#messages");
	this.$message = $("#message");
	this.$content = $("#content");
	this.$chat = $("#chat");

	this.init(messages);
}

Chat.prototype.getMessageIndexById = function(id)
{
	for (var i = this.messages.length - 1; i >= 0; i--)
	{
		if(this.messages[i].id == id)
			return i;
	}

	return -1;
};

Chat.prototype.addMessage = function(message, editable)
{
	// On garde aussi en référence uniquement mes messages
	if(message.user.name == this.room.user.name && editable)
		this.myMessages.push(message);

	this.messages.push(message);
};

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
			this.$messages.append($('<li id="msgbox-'+(++this.msgbox)+'" class="diceroll mui-panel'+this.getClass(data)+'">').html('<span class="user">'+((data.prive) ? data.user.name+' to '+data.prive : data.user.name)+':</span> '+data.message));
			this.addMessage(data, false);
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
	this.$messages.append($('<li id="msgbox-'+(++this.msgbox)+'" class="message error me">').html(data.message));
	this.addMessage(data, false);
	this.$content.scrollTop(this.$content[0].scrollHeight);
	return;
};

Chat.prototype.message = function(data)
{
	if(data.error){
		this.showError(data);
		return;
	}

	if(data.command){
		this.showCommand(data);
		return;
	}

	if(this.messages.length > 0 
		&& this.messages[this.messages.length-1].user.name == data.user.name 
		&& !this.messages[this.messages.length-1].command 
		&& this.messages[this.messages.length-1].prive == data.prive)
	{
		// On ne crée pas de nouvelle box
		$('#msgbox-'+this.msgbox).find('.text').append('<div id="msg-'+data.id+'">'+data.message+'</div>');
	} 
	else
	{
		// Nouvelle box
		this.$messages.append(
			'<li id="msgbox-'+(++this.msgbox)+'" class="message mui-panel'+this.getClass(data)+'">'+
				'<div class="user">'+((data.prive) ? data.user.name+' to '+data.prive : data.user.name)+':</div> '+
				'<div class="text"><div id="msg-'+data.id+'">'+data.message+'</div></div>'+
			'</li>'
		);
	}

	this.addMessage(data, true);
	this.$content.scrollTop(this.$content[0].scrollHeight);
};

Chat.prototype.editMessage = function(data)
{
	// Errors and command aren't editable
	if(data.error || data.command) return;

	var index = this.getMessageIndexById(data.id);
	if(index >= 0)
	{
		var myIndex = this.myMessages.indexOf(this.messages[index]);
		if(myIndex >= 0)
		{
			this.myMessages[myIndex] = data;
			this.messages[index] = data;
			$("#msg-"+data.id).html(data.message);
		}
		
	}
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

Chat.prototype.startEdit = function()
{
	if(this.editMode >= 0){
		var that = this;
		var text = this.myMessages[this.editMode].raw;
		this.$message.focus();
		this.$message.val(text);
		setTimeout(function(){ that.$message.putCursorAtEnd(); }, 0);
	}
};

Chat.prototype.stopEdit = function()
{
	if(this.editMode >= 0){
		this.$message.val("");
		this.editMode = -1;
	}
};

Chat.prototype.editPrev = function()
{
	if(this.editMode <= 0)
		this.editMode = this.myMessages.length;

	--this.editMode;
	this.startEdit();
};

Chat.prototype.editNext = function()
{
	++this.editMode;

	if(this.editMode >= this.myMessages.length)
	{
		this.stopEdit();
	}
	else
	{
		this.startEdit();
	}
};

Chat.prototype.checkEndEdit = function() 
{
	if(this.$message.val() == "")
	{
		this.editMode = -1;
	}
};

Chat.prototype.init = function(messages)
{
	var that = this;

	// Ajouter messages existants
	for (i = 0, length = messages.length; i < length; i++) {
		this.message(messages[i]);
	}

	// Envoyer message
	this.$chat.on("submit.chat", function(e){
		e.preventDefault();

		var message = that.$message.val();

		if(message != "")
		{
			if (that.editMode >= 0)
			{
				that.room.socket.emit("chat edit", that.myMessages[that.editMode].id, message);
				that.stopEdit();
			}
			else
			{
				that.room.socket.emit("chat", message);
			}

			that.$message.val('');
			that.checkEndEdit();
			that.typingStop();
		}

		return false;
	});

	// Recevoir messages
	this.room.socket.on('chat', function(data){
		that.message(data);
	});

	// Gestion du typing
	this.$message.on("keypress.chat", function(e){
		// e.keyCode : 8 back, 13 entrée
		if(e.keyCode != 8 && e.keyCode != 13)
		{
			that.typingStart();
		}
	});

	// Gestion de l'édition
	this.room.socket.on('chat edit', function(data){
		that.editMessage(data);
	});

	this.$message.on("keydown.chat", function(e){
		// Key up
		if(e.keyCode == 38)
		{
			that.editPrev();
		}
		// Key down
		else if(e.keyCode == 40)
		{
			that.editNext();
		}
		// Key return or suppr
		else if(e.keyCode == 8 || e.keyCode == 46)
		{
			that.checkEndEdit();
		}
	});
};

Chat.prototype.destroy = function()
{
	this.$chat.off(".chat");
	this.$message.off(".chat");
	this.room.socket.removeAllListeners('chat');
	this.room.socket.removeAllListeners('chat edit');
};