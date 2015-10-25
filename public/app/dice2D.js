"use strict";

function Dice2D(id, type, color, box)
{
	this.id = id;
	this.type = type;
	this.value = parseInt(this.type.replace('d', '').split(' ')[0]);
	this.box = box;
	this.radius = 0.25 * this.box.scale;
	this.color = color;
	this.transform;

	this.position = {x: 0, y: 0, z: 0};
	this.rotation = 0;
	this.time = 0;

	this.createMesh();
}

Dice2D.prototype.createMesh = function()
{
	this.transform = $('<div class="dice '+this.type+'"></div>').css({
		position: "absolute",
		top: -this.radius,
		left: -this.radius,
		width: this.radius * 2,
		height: this.radius * 2,
		lineHeight: this.radius * 2 + "px",
		fontSize: this.radius * 0.75 + "px",
		fontWeight: "bold",
		textShadow: "2px 2px 0px #000000, 2px -2px 0px #000000, -2px -2px 0px #000000, -2px 2px 0px #000000"
	});

	this.box.scene.append(this.transform);
};

Dice2D.prototype.update = function(values)
{
	this.position.x = values[0] * this.box.w / 1000 / 2 + this.box.cw;
	this.position.y = this.box.ch - values[1] * this.box.h / 1000 / 2;
	this.position.z = values[2];
	this.rotation = (values[3] + Math.PI) * 180 / Math.PI;

	this.transform.css("transform", "translate3d("+this.position.x+"px, "+this.position.y+"px, "+this.position.z+"px) rotate("+this.rotation+"deg)");
	if(Date.now() - this.time > 166){
		this.transform.html(Math.ceil(Math.random() * this.value));
		this.time = Date.now();
	}
};

Dice2D.prototype.result = function(value)
{
	this.transform.html(value);
};

Dice2D.prototype.remove = function() {
	this.transform.remove();
	delete this.box.dices[this.id];
};

function Dices2D(room, width, height)
{
	this.room = room;
	this.w = width;
	this.h = height;
	this.cw;
	this.ch;
	this.scale;
	this.scene;

	this.dices = {};

	this.init();
}

Dices2D.prototype.init = function()
{
	var that = this;

	this.cw = this.w / 2;
	this.ch = this.h / 2;
	this.scale = Math.sqrt(this.w * this.w + this.h * this.h) / 13;

	this.dices = {};
	this.scene = $("#dice-box");

	this.room.socket.on('dice start', function(data){
		for(var i = 0; i < data.length; i++){
			that.dices[data[i].id] = new Dice2D(data[i].id, data[i].type, data[i].color, that);
		}
	});

	this.room.socket.on('dice update', function(data){
		for(var i in data){
			if(that.dices[i]) that.dices[i].update(data[i]);
		}
	});

	this.room.socket.on('dice result', function(data){
		for(var i in data){
			if(that.dices[i]) that.dices[i].result(data[i]);
		}
	});

	this.room.socket.on('dice end', function(data){
		for(var i = 0; i < data.length; i++){
			if(that.dices[data[i]]) that.dices[data[i]].remove();
		}
	});
};

Dices2D.prototype.remove = function() {
	this.room.socket.removeAllListeners('dice start');
	this.room.socket.removeAllListeners('dice update');
	this.room.socket.removeAllListeners('dice result');
	this.room.socket.removeAllListeners('dice end');
};