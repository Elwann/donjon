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

Chat.prototype.isNewBox = function(data)
{
	return !(
		this.messages.length > 0 &&
		this.messages[this.messages.length-1].user.name == data.user.name &&
		!this.messages[this.messages.length-1].command &&
		!this.messages[this.messages.length-1].image &&
		this.messages[this.messages.length-1].prive == data.prive
	);
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
	this.$messages.append($('<li id="msgbox-'+(++this.msgbox)+'" class="message '+data.error+' me">').html(data.message));
	this.addMessage(data, false);
	this.$content.scrollTop(this.$content[0].scrollHeight);
	return;
};

Chat.prototype.showImage = function(data)
{
	var text = '<div id="image-'+data.image+'"><a href="#" data-image="'+data.image+'">Download image '+data.name+'</a></div>';
	if(this.isNewBox(data))
	{
		this.$messages.append(
			'<li id="msgbox-'+(++this.msgbox)+'" class="message mui-panel'+this.getClass(data)+'">'+
				'<div class="user">'+((data.prive) ? data.user.name+' to '+data.prive : data.user.name)+':</div> '+
				'<div class="text">'+text+'</div>'+
			'</li>'
		);
	}
	else
	{
		$('#msgbox-'+this.msgbox).find('.text').append(text);
	}
	
	this.addMessage(data, false);
	this.$content.scrollTop(this.$content[0].scrollHeight);
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

	if(typeof data.image !== "undefined"){
		this.showImage(data);
		return;
	}

	if(this.isNewBox(data))
	{
		// Nouvelle box
		this.$messages.append(
			'<li id="msgbox-'+(++this.msgbox)+'" class="message mui-panel'+this.getClass(data)+'">'+
				'<div class="user">'+((data.prive) ? data.user.name+' to '+data.prive : data.user.name)+':</div> '+
				'<div class="text"><div id="msg-'+data.id+'">'+data.message+'</div></div>'+
			'</li>'
		);
	} 
	else
	{
		// On ne crée pas de nouvelle box
		$('#msgbox-'+this.msgbox).find('.text').append('<div id="msg-'+data.id+'">'+data.message+'</div>');
	}

	this.addMessage(data, true);
	this.$content.scrollTop(this.$content[0].scrollHeight);
};

Chat.prototype.editMessage = function(data)
{
	// Errors, command and images aren't editable
	if(data.error || data.command || data.image) return;

	var index = this.getMessageIndexById(data.id);
	if(index >= 0)
	{
		var myIndex = this.myMessages.indexOf(this.messages[index]);
		if(myIndex >= 0)
			this.myMessages[myIndex] = data;

		this.messages[index] = data;
		$("#msg-"+data.id).html(data.message);
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
		this.$message.focus();
		this.$message.val(this.myMessages[this.editMode].message);
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
				var myMsg = that.myMessages[that.editMode];
				if(myMsg.prive)
					message = "@"+myMsg.prive+" "+message;

				that.room.socket.emit("chat edit", myMsg.id, message);
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
	this.rotation = (((2 * Math.acos(values[3])) * 180 / Math.PI) + 180) % 360;

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
"use strict";

var DicesModels3D = {};

DicesModels3D.d4 = {
	geometry: {
		vertices: [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]],
		faces: [[1, 0, 2, 1], [0, 1, 3, 2], [0, 3, 2, 3], [1, 2, 3, 4]],
		tab: -0.1,
		af: Math.PI * 7 / 6
	},
	mass: 300,
	inertia: 5,
	scale: 1
};

DicesModels3D.d6 = {
	geometry: {
		vertices: [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]],
		faces: [[0, 3, 2, 1, 1], [1, 2, 6, 5, 2], [0, 1, 5, 4, 3], [3, 7, 6, 2, 4], [0, 4, 7, 3, 5], [4, 5, 6, 7, 6]],
		tab: 0.1,
		af: Math.PI / 4
	},
	mass: 300,
	inertia: 13,
	scale: 1.1
};

DicesModels3D.d8 = {
	geometry: {
		vertices: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]],
		faces: [[0, 2, 4, 1], [0, 4, 3, 2], [0, 3, 5, 3], [0, 5, 2, 4], [1, 3, 4, 5], [1, 4, 2, 6], [1, 2, 5, 7], [1, 5, 3, 8]],
		tab: 0,
		af: -Math.PI / 4 / 2
	},
	mass: 340,
	inertia: 10,
	scale: 1.1
};

DicesModels3D.d10 = {
	geometry: {
		vertices: function(){
			var a = Math.PI * 2 / 10, k = Math.cos(a), h = 0.105;
			var vertices = [];
			for (var i = 0, b = 0; i < 10; ++i, b += a)
				vertices.push([Math.cos(b), Math.sin(b), h * (i % 2 ? 1 : -1)]);
			vertices.push([0, 0, -1]); vertices.push([0, 0, 1]);
			return vertices;
		}(),
		faces: [
			[5, 7, 11, 0], [4, 2, 10, 1], [1, 3, 11, 2], [0, 8, 10, 3], [7, 9, 11, 4],
			[8, 6, 10, 5], [9, 1, 11, 6], [2, 0, 10, 7], [3, 5, 11, 8], [6, 4, 10, 9],
			[5, 6, 7, -1], [3, 2, 4, -1], [1, 2, 3, -1], [9, 8, 0, -1], [7, 8, 9, -1],
			[7, 6, 8, -1], [9, 0, 1, -1], [1, 0, 2, -1], [3, 4, 5, -1], [5, 4, 6, -1]
		],
		tab: 0,
		af: Math.PI * 6 / 5
	},
	mass: 350,
	inertia: 9,
	scale: 1
};

DicesModels3D.d12 = {
	geometry: {
		vertices: function(){
			var p = (1 + Math.sqrt(5)) / 2, q = 1 / p;
			return [[0, q, p], [0, q, -p], [0, -q, p], [0, -q, -p], [p, 0, q], [p, 0, -q], [-p, 0, q], [-p, 0, -q], [q, p, 0], [q, -p, 0], [-q, p, 0], [-q, -p, 0], [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1], [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]];
		}(),
		faces: [[2, 14, 4, 12, 0, 1], [15, 9, 11, 19, 3, 2], [16, 10, 17, 7, 6, 3], [6, 7, 19, 11, 18, 4], [6, 18, 2, 0, 16, 5], [18, 11, 9, 14, 2, 6], [1, 17, 10, 8, 13, 7], [1, 13, 5, 15, 3, 8], [13, 8, 12, 4, 5, 9], [5, 4, 14, 9, 15, 10], [0, 12, 8, 10, 16, 11], [3, 19, 7, 17, 1, 12]],
		tab: 0.2,
		af: -Math.PI / 4 / 2
	},
	mass: 380,
	inertia: 8,
	scale: 1
};

DicesModels3D.d20 = {
	geometry: {
		vertices: function(){
			var t = (1 + Math.sqrt(5)) / 2;
			return [[-1, t, 0], [1, t, 0 ], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
		}(),
		faces: [[0, 11, 5, 1], [0, 5, 1, 2], [0, 1, 7, 3], [0, 7, 10, 4], [0, 10, 11, 5], [1, 5, 9, 6], [5, 11, 4, 7], [11, 10, 2, 8], [10, 7, 6, 9], [7, 1, 8, 10], [3, 9, 4, 11], [3, 4, 2, 12], [3, 2, 6, 13], [3, 6, 8, 14], [3, 8, 9, 15], [4, 9, 5, 16], [2, 4, 11, 17], [6, 2, 10, 18], [8, 6, 7, 19], [9, 8, 1, 20]],
		tab: -0.2,
		af: -Math.PI / 4 / 2
	},
	mass: 400,
	inertia: 6,
	scale: 1
};

DicesModels3D.d100 = {
	geometry: DicesModels3D.d10.geometry,
	mass: 350,
	inertia: 9,
	scale: 1
};

function copyto(obj, res) {
	if (obj == null || typeof obj !== 'object') return obj;
	if (obj instanceof Array) {
		for (var i = obj.length - 1; i >= 0; --i)
			res[i] = copy(obj[i]);
	}
	else {
		for (var i in obj) {
			if (obj.hasOwnProperty(i))
				res[i] = copy(obj[i]);
		}
	}
	return res;
}

function copy(obj) {
	if (!obj) return obj;
	return copyto(obj, new obj.constructor());
}

function makeGeometry(vertices, faces, radius, tab, af) {
	var geom = new THREE.Geometry();
	for (var i = 0; i < vertices.length; ++i) {
		var vertex = (new THREE.Vector3).fromArray(vertices[i]).normalize().multiplyScalar(radius);
		vertex.index = geom.vertices.push(vertex) - 1;
	}
	for (var i = 0; i < faces.length; ++i) {
		var ii = faces[i], fl = ii.length - 1;
		var aa = Math.PI * 2 / fl;
		for (var j = 0; j < fl - 2; ++j) {
			geom.faces.push(new THREE.Face3(ii[0], ii[j + 1], ii[j + 2], [geom.vertices[ii[0]],
						geom.vertices[ii[j + 1]], geom.vertices[ii[j + 2]]], 0, ii[fl] + 1));
			geom.faceVertexUvs[0].push([
					new THREE.Vector2((Math.cos(af) + 1 + tab) / 2 / (1 + tab),
						(Math.sin(af) + 1 + tab) / 2 / (1 + tab)),
					new THREE.Vector2((Math.cos(aa * (j + 1) + af) + 1 + tab) / 2 / (1 + tab),
						(Math.sin(aa * (j + 1) + af) + 1 + tab) / 2 / (1 + tab)),
					new THREE.Vector2((Math.cos(aa * (j + 2) + af) + 1 + tab) / 2 / (1 + tab),
						(Math.sin(aa * (j + 2) + af) + 1 + tab) / 2 / (1 + tab))]);
		}
	}
	geom.computeFaceNormals();
	geom.computeVertexNormals();
	geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(), radius);
	return geom;
}

var materialOptions = {
	specular: '#171d1f',
	color: '#ffffff',
	emissive: '#000000',
	shininess: 7,
	shading: THREE.FlatShading,
};

var diceLabels = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
var d10Labels = [' ', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
var d100Labels = [' ', '10', '20', '30', '40', '50', '60', '70', '80', '90', '00'];

function idealTextColor(bgColor) {

   var nThreshold = 105;
   var components = getRGBComponents(bgColor);
   var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);

   return ((255 - bgDelta) < nThreshold) ? "#000000" : "#ffffff";
}

function getRGBComponents(color) {

    var r = color.substring(1, 3);
    var g = color.substring(3, 5);
    var b = color.substring(5, 7);

    return {
       R: parseInt(r, 16),
       G: parseInt(g, 16),
       B: parseInt(b, 16)
    };
}

function makeDiceMaterials(diceColor, faceLabels, size, margin) {
	function createTextTexture(text, color, backColor) {
		if (text == undefined) return null;
		var canvas = document.createElement("canvas");
		var context = canvas.getContext("2d");
		canvas.width = size + margin;
		canvas.height = size + margin;
		context.font = size + "pt Arial";
		context.fillStyle = backColor;
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillStyle = color;
		context.fillText(text, canvas.width / 2, canvas.height / 2);
		if (text == '6' || text == '9') {
			context.fillText('  .', canvas.width / 2, canvas.height / 2);
		}
		var texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;
		return texture;
	}
	var materials = [];
	for (var i = 0; i < faceLabels.length; ++i)
		materials.push(new THREE.MeshPhongMaterial(copyto(materialOptions, { map: createTextTexture(faceLabels[i], idealTextColor(diceColor), diceColor) })));

	return materials;
}

function makeD4Materials(diceColor, size, margin) {
	function createD4Text(text, color, backColor) {
		var canvas = document.createElement("canvas");
		var context = canvas.getContext("2d");
		canvas.width = size + margin;
		canvas.height = size + margin;
		context.font = size + "pt Arial";
		context.fillStyle = backColor;
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillStyle = color;
		context.translate(0, size / 10);
		for (var i in text) {
			context.fillText(text[i], canvas.width / 2,
					canvas.height / 2 - size - margin / 10);
			context.translate(canvas.width / 2, canvas.height / 2);
			context.rotate(Math.PI * 2 / 3);
			context.translate(-canvas.width / 2, -canvas.height / 2);
		}
		var texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;
		return texture;
	}
	var materials = [];
	var labels = [[], [0, 0, 0], [2, 4, 3], [1, 3, 4], [2, 1, 4], [1, 2, 3]];
	for (var i = 0; i < labels.length; ++i)
		materials.push(new THREE.MeshPhongMaterial(copyto(materialOptions, { map: createD4Text(labels[i], idealTextColor(diceColor), diceColor) })));
	return materials;
}

function Dice3D(id, type, color, box)
{
	this.id = id;
	this.type = type;
	this.box = box;
	this.radius = 0.6 * DicesModels3D[this.type].scale * box.scale;
	this.color = color;
	this.transform;

	//this.position = {x: 0, y: 0, z: 0};
	//this.rotation = {x: 0, y: 0, z: 0, w: 0};

	this.createMesh();

	this.box.renderer.render(this.box.scene, this.box.camera);
}

Dice3D.prototype.createMesh = function()
{
	var model = DicesModels3D[this.type];
	var geometry = makeGeometry(model.geometry.vertices, model.geometry.faces, this.radius, model.geometry.tab, model.geometry.af);

	var materials;
	if(this.type == 'd4'){
		materials = makeD4Materials(this.color, this.box.scale / 3, this.box.scale);
	} else if(this.type == 'd100') {
		materials = makeDiceMaterials(this.color, d100Labels, this.box.scale / 3, this.box.scale);
	} else if(this.type == 'd10') {
		materials = makeDiceMaterials(this.color, d10Labels, this.box.scale / 3, this.box.scale);
	} else {
		materials = makeDiceMaterials(this.color, diceLabels, this.box.scale / 3, this.box.scale);
	}

	var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials )  );

	mesh.castShadow = true;
	mesh.receiveShadow = false;

	mesh.position.x = -this.box.w * 2;
	mesh.position.y = -this.box.h * 2;
	mesh.position.z = 0;

	mesh.quaternion.x = 0;
	mesh.quaternion.y = 0;
	mesh.quaternion.z = 0;
	mesh.quaternion.w = 0;

	this.transform = mesh;
	this.box.scene.add(mesh);
};

Dice3D.prototype.update = function(values)
{
	this.transform.position.x = values[0] * this.box.w / 1000;
	this.transform.position.y = values[1] * this.box.h / 1000;
	this.transform.position.z = values[2];

	this.transform.quaternion.x = values[3];
	this.transform.quaternion.y = values[4];
	this.transform.quaternion.z = values[5];
	this.transform.quaternion.w = values[6];
};

Dice3D.prototype.remove = function() {
	this.box.scene.remove(this.transform);
	delete this.box.dices[this.id];
};

function Dices3D(room, width, height)
{
	this.room = room;
	this.w = width;
	this.h = height;
	this.cw;
	this.ch;
	this.scene;
	this.camera;
	this.renderer;
	this.aspect;
	this.scale;
	this.desk;
	this.light;

	this.dices = {};

	this.init();
}

Dices3D.prototype.resize = function()
{
	this.w = window.innerWidth;
	this.h = window.innerHeight;
	this.cw = this.w / 2;
	this.ch = this.h / 2;
	this.aspect = Math.min(this.cw / this.w, this.ch / this.h);
	this.scale = Math.sqrt(this.w * this.w + this.h * this.h) / 13;

	var wh = Math.min(this.cw, this.ch) / this.aspect / Math.tan(10 * Math.PI / 180);
	this.camera.aspect = this.cw / this.ch;
	this.camera.far = wh * 1.3;
	this.camera.position.z = wh;
	this.camera.updateProjectionMatrix();

	var mw = Math.max(this.w, this.h);
	this.light.position.set(-mw / 2, mw / 2, mw * 2);
	this.light.target.position.set(0, 0, 0);

	this.renderer.setSize(this.w, this.h);
};

Dices3D.prototype.init = function()
{
	var that = this;

	this.cw = this.w / 2;
	this.ch = this.h / 2;

	this.aspect = Math.min(this.cw / this.w, this.ch / this.h);
	this.scale = Math.sqrt(this.w * this.w + this.h * this.h) / 13;

	this.renderer = window.WebGLRenderingContext
		? new THREE.WebGLRenderer({ antialias: true, alpha: true })
		: new THREE.CanvasRenderer({ antialias: true, alpha: true });
	this.renderer.setSize(this.cw * 2, this.ch * 2);
	this.renderer.shadowMapEnabled = true;
	this.renderer.shadowMapSoft = true;
	this.renderer.setClearColor(0x000000, 0);

	this.dices = {};
	this.scene = new THREE.Scene();
	this.scene.fog = null;

	$("#dice-box").append(this.renderer.domElement);

	var wh = Math.min(this.cw, this.ch) / this.aspect / Math.tan(10 * Math.PI / 180);
	this.camera = new THREE.PerspectiveCamera(20, this.cw / this.ch, 1, wh * 1.3);
	this.camera.position.z = wh;

	var ambientLight = new THREE.AmbientLight(0x666666);
	this.scene.add(ambientLight);

	var mw = Math.max(this.w, this.h);
	this.light = new THREE.SpotLight(0xffffff);
	this.light.position.set(-mw / 2, mw / 2, mw * 2);
	this.light.target.position.set(0, 0, 0);
	this.light.castShadow = true;
	this.light.shadowCameraNear = mw / 10;
	this.light.shadowCameraFar = mw * 3;
	this.light.shadowCameraFov = 50;
	this.light.shadowBias = 0.001;
	this.light.shadowDarkness = 0.3;
	this.light.shadowMapWidth = 1024;
	this.light.shadowMapHeight = 1024;
	this.scene.add(this.light);

	var planeFragmentShader = [

		"uniform vec3 diffuse;",
		"uniform float opacity;",

		THREE.ShaderChunk[ "color_pars_fragment" ],
		THREE.ShaderChunk[ "map_pars_fragment" ],
		THREE.ShaderChunk[ "lightmap_pars_fragment" ],
		THREE.ShaderChunk[ "envmap_pars_fragment" ],
		THREE.ShaderChunk[ "fog_pars_fragment" ],
		THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
		THREE.ShaderChunk[ "specularmap_pars_fragment" ],

		"void main() {",

			"gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 );",

			THREE.ShaderChunk[ "map_fragment" ],
			THREE.ShaderChunk[ "alphatest_fragment" ],
			THREE.ShaderChunk[ "specularmap_fragment" ],
			THREE.ShaderChunk[ "lightmap_fragment" ],
			THREE.ShaderChunk[ "color_fragment" ],
			THREE.ShaderChunk[ "envmap_fragment" ],
			THREE.ShaderChunk[ "shadowmap_fragment" ],
			THREE.ShaderChunk[ "linear_to_gamma_fragment" ],
			THREE.ShaderChunk[ "fog_fragment" ],

			"gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 - shadowColor.x );",

		"}"

	].join("\n");

	var planeMaterial = new THREE.ShaderMaterial({
		uniforms: THREE.ShaderLib['basic'].uniforms,
		vertexShader: THREE.ShaderLib['basic'].vertexShader,
		fragmentShader: planeFragmentShader,
		color: 0x0000FF
	});

	this.desk = new THREE.Mesh(new THREE.PlaneGeometry(this.w*2, this.h*2, 1, 1), planeMaterial);
	this.desk.receiveShadow = true;
	this.scene.add(this.desk);

	window.addEventListener('click', this.resize.bind(this));

	this.room.socket.on('dice start', function(data){
		for(var i = 0; i < data.length; i++){
			that.dices[data[i].id] = new Dice3D(data[i].id, data[i].type, data[i].color, that);
		}
	});

	this.room.socket.on('dice update', function(data){
		for(var i in data){
			if(that.dices[i]) that.dices[i].update(data[i]);
		}
		that.renderer.render(that.scene, that.camera);
	});

	this.room.socket.on('dice end', function(data){
		for(var i = 0; i < data.length; i++){
			if(that.dices[data[i]]) that.dices[data[i]].remove();
		}
		that.renderer.render(that.scene, that.camera);
	});
};

Dices3D.prototype.remove = function() {
	this.room.socket.removeAllListeners('dice start');
	this.room.socket.removeAllListeners('dice update');
	this.room.socket.removeAllListeners('dice end');
};

function Dice(type){
	this.type = type;
	this.rolls = 0;
	this.cooldown = null;
	this.$item = $('<div class="dice d'+type.split('d').pop()+' noselect">'+type+'</div>');
}

Dice.prototype.roll = function() {
	var that = this;
	++this.rolls;
	this.$item.addClass("cooldown");
	clearTimeout(this.cooldown);
	this.cooldown = setTimeout(function(){ that.$item.removeClass("cooldown"); }, 2000);
};

function Dices(room, defaultDices)
{
	this.room = room;
	this.defaultDices = defaultDices || [];
	this.dices = [];

	this.$dices = $("#dices");

	this.reset();
	this.init();
}

// Clear dices
Dices.prototype.reset = function()
{
	var that = this;
	this.dices = [];
	$.each(this.defaultDices, function(i, d){
		that.roll(d);
	});
};

// Show dices
Dices.prototype.show = function()
{
	this.sort();
	var length = this.dices.length;
	this.$dices.children(".dice").detach();
	this.$dices.css({width: 45 * length, height: 45 * length});
	for(var i = 0; i < length; i++)
		this.$dices.append(this.dices[i].$item);
};

// Sort dices by number of rolls
Dices.prototype.sort = function()
{
	this.dices.sort(function(a, b){ return b.rolls - a.rolls; });
};

// Show
Dices.prototype.roll = function(dice)
{
	// Merge 1dX and dX
	dice = dice.split('d');
	if(dice[0] == "1")
		dice[0] = "";
	dice = dice.join('d');

	var exist = false;
	for (var i = this.dices.length - 1; i >= 0; i--) {
		if(this.dices[i].type == dice){
			exist = true;
			this.dices[i].roll();
			break;
		}
	}

	if(!exist) {
		this.dices.push(new Dice(dice));
	}

	this.show();
};

Dices.prototype.init = function()
{
	var that = this;

	$(window).on('resize.dices', function(){
		that.show();
	});

	$(document).on("click.dices", ".dice", function(e){
		e.preventDefault();
		var $this = $(this);
		if(!$this.hasClass("cooldown")){
			$this.addClass("cooldown");
			var dice = $this.html();
			that.room.socket.emit('chat', "/roll "+dice);
		}
	});
};

Dices.prototype.destroy = function()
{
	$(window).off('.dices');
	$(document).off('.dices');
};

function Images(room)
{
	this.room = room;
	this.image = "";

	this.$zoom = null;

	this.init();
}

Images.prototype.show = function(data) {
	$("#image-"+data.id).html('<img class="zoomable link" src="'+data.url+'" alt="'+data.name+'" title="'+data.name+'">');
};

Images.prototype.close = function()
{
	if(this.$zoom)
	{
		this.$zoom.off('.images');
		this.$zoom.remove();
		this.$zoom = null;
	}
};

Images.prototype.zoom = function(src)
{
	if(!this.$zoom)
	{
		var that = this;
		this.$zoom = $('<div class="overlay centerer closable"><div class="image centered"><img class="zoomed" src="'+src+'" alt=""></div></div>')
		$('body').append(this.$zoom);
		this.$zoom.on('click.images', function(){
			that.close();
		});
	}
};

Images.prototype.upload = function(image)
{
	if(image.type.split('/').shift() == 'image')
	{
		var that = this;
		reader = new FileReader();
		reader.onload = function(evt){
			that.room.socket.emit('image upload', image.name, evt.target.result);
		};
		reader.readAsDataURL(image);
	}
};

Images.prototype.download = function(id) {
	this.room.socket.emit('image download', id);
};

Images.prototype.init = function()
{
	var that = this;

	$('body')
		.on('dragover.images', function(e){
			e.preventDefault();
		})
		.on('drop.images', function(e){
			e.preventDefault();
			that.upload(e.originalEvent.dataTransfer.files[0]);
		})
		.on('click.images', '.zoomable', function(e){
			e.preventDefault();
			that.zoom($(this).attr("src"));
		})
		.on('click.images', '[data-image]', function(e){
			e.preventDefault();
			$(this).append(' <i class="fa fa-spin fa-refresh"></i>');
			that.download($(this).attr("data-image"));
		});

	this.room.socket.on('image', function(data){
		that.show(data);
	});
};

Images.prototype.destroy = function()
{
	this.close();
	$('body').off('.images');
};
(function(){

	//
	// Socket connection and login gestion
	//

	var config = Config || {};
	var url = config.url || 'http://localhost:3030';
	var socket = io(url);

	var room;
	var loading = false;

	function loginRoom(item, room, user, action)
	{
		if(room == "" || user == "" || loading)
			return false;

		loading = true;
		item.append('<span id="loading">&nbsp;&nbsp;<i class="fa fa-spin fa-refresh"></i></span>');
		socket.emit(action, { room: room, user: user });
	}

	// Join room
	function joinRoom()
	{
		loginRoom($("#join"), $("#room").val(), $("#user").val(), 'room join');
		return false;
	}

	// Create room
	function createRoom()
	{
		loginRoom($("#create"), $("#room").val(), $("#user").val(), 'room create');
		return false;
	}

	// Init
	function init()
	{
		// Wait for server login event and create Room Object
		socket.on('login', function(data){
			loading = false;
			$("#loading").remove();

			if(!data.succes){
				$("#login-msg").html(data.error).addClass('error');
				return;
			}

			room = new Room(socket, data.room.name, data.user, data.room.users, data.room.messages, data.room.settings);
			Cookies.set('login', data.room.name+'|'+data.user.name, { expires: 356 });

			$(".login-wrapper").fadeOut(300);
		});

		// Handle click events
		$("#login").submit(joinRoom);
		$("#join").click(joinRoom);
		$("#create").click(createRoom);

		// If cookie try to login
		var cookie = Cookies.get('login');
		if(cookie) {
			var ck = cookie.split("|");
			loginRoom($("#join"), ck[0], ck[1], 'room join');
		}
	}

	window.addEventListener('DOMContentLoaded', init);
})();

function LocalPlayer(music)
{
	this.music = music;
	this.audio = new Audio();
	this.volet = 0;
	this.init();
}

LocalPlayer.prototype.init = function(){
	var that = this;
	document.body.appendChild(this.audio);
	this.audio.autoplay = true;
	this.audio.loop = true;

	if(that.music.room.user.admin){
		$.post('music/list.php', function(data){
			that.music.$musicPopin.find('.local-contener').append(that.crawlSongs(data));

			$('body').on('click.music', '.song .fa-play', function(e){
				e.preventDefault();
				that.song($(this).parent().parent(), false);
			});

			$('body').on('click.music', '.song .fa-plus', function(e){
				e.preventDefault();
				that.song($(this).parent().parent(), true);
			});

			$('body').on('click.music', '.playlist .fa-play', function(e){
				e.preventDefault();
				that.playlist($(this).parent().parent(), false);
			});

			$('body').on('click.music', '.playlist .fa-plus', function(e){
				e.preventDefault();
				that.playlist($(this).parent().parent(), true);
			});
		});
	}
};

LocalPlayer.prototype.song = function(elem, add){
	var that = this;
	that.music.$musicPopin.fadeOut(300);
	var songs = {
		type: 'local',
		add: add,
		url: [elem.attr('data-song')]
	};
	that.music.room.socket.emit('music', songs);
};

LocalPlayer.prototype.playlist = function(elem, add){
	var that = this;
	var songs = {
		type: 'local',
		add: add,
		url: []
	};
	that.music.$musicPopin.fadeOut(300);
	elem.next('input').next('label').next('ul').find('.song').each(function(){
		songs.url.push($(this).attr('data-song'));
	});

	that.music.room.socket.emit('music', songs);
};

LocalPlayer.prototype.crawlSongs = function(playlist){
	++this.volet;
	var musiclist = '';
	musiclist += '<h4 class="playlist list link">'+playlist.title+'<span class="icon-play"><i class="fa fa-plus"></i><i class="fa fa-play"></i></span></h4>';
	musiclist += '<input id="volet-'+this.volet+'" type="checkbox" '+((this.volet==1)?'checked':'')+' class="volet-checkbox">';
	musiclist += '<label for="volet-'+this.volet+'" class="volet-btn link fa fa-caret-right"></label>';
	musiclist += '<ul class="volet-content">';
	for(var i = 0; i < playlist.songs.length; i++){
		if(playlist.songs[i].type == "playlist"){
			musiclist += '<li>'+this.crawlSongs(playlist.songs[i])+'</li>';
		} else {
			musiclist += '<li class="song list link" data-song="music/'+playlist.songs[i].url+'">'+playlist.songs[i].title+'<span class="icon-play"><i class="fa fa-plus"></i><i class="fa fa-play"></i></span></li>';
		}
	}
	musiclist += '</ul>';

	return musiclist;
};

LocalPlayer.prototype.start = function(track){
	this.audio.src = track.url;
	this.play();
};

LocalPlayer.prototype.pause = function(){
	this.audio.pause();
};

LocalPlayer.prototype.play = function(){
	this.audio.play();
};

LocalPlayer.prototype.volume = function(v){
	this.audio.volume = Math.max(0, Math.min(v, 1));
};

LocalPlayer.prototype.destroy = function(){
	console.log(this.audio);
	this.audio.parentNode.removeChild(this.audio);
};

function YoutubePlayer(music)
{
	this.music = music;
    this.index = 0;
	this.youtube;
    this.$musicUrl;
    this.$playLater;
    this.$playNow;

	this.init();
}

YoutubePlayer.prototype.init = function(){
	var that = this;

	// Youtube player tag
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	window.onYouTubeIframeAPIReady = function() {
		that.youtube = new YT.Player('yt-player', {
			height: '1',
			width: '1',
			events: {
				'onReady': onPlayerReady,
				'onStateChange': onPlayerStateChange
			}
		});
	}

	// 4. The API will call this function when the video player is ready.
    function onPlayerReady(event) {
        console.log('player ready');

		if(that.music.room.user.admin){
			that.music.$musicPopin.find('.youtube-contener').append(
				'<div class="mui-form-group">'+
					'<input id="music-url" type="text" class="mui-form-control" placeholder="https://www.youtube.com/watch?v=KqeKikpLQ5o">'+
					'<label>Youtube url</label>'+
				'</div>'+
				'<button id="play-later" class="mui-btn mui-btn-flat mui-btn-default mui-pull-left">To playlist</button>'+
				'<button id="play-now" class="mui-btn mui-btn-raised mui-btn-primary mui-pull-right">Play now</button>'
			);

			that.$musicUrl = $("#music-url");
			that.$playLater = $("#play-later");
			that.$playNow = $("#play-now");

			that.$playNow.on('click.music', function(e){
				e.preventDefault();
				var value = that.$musicUrl[0].value;
				var parse = that.parseURL(value);
				parse.add = false;
				that.music.$musicPopin.fadeOut(300);
				that.music.room.socket.emit('music', parse);
				//console.log('play now', parse);
			});

			that.$playLater.on('click.music', function(e){
				e.preventDefault();
				var value = that.$musicUrl[0].value;
				var parse = that.parseURL(value);
				parse.add = true;
				that.music.$musicPopin.fadeOut(300);
				that.music.room.socket.emit('music', parse);
				//console.log('play later', parse);
			});
		}
	}


    function onPlayerStateChange(event) {
        //console.log('event: ' + event.data, 'index: ' + that.currentIndex, 'length: ' + (event.target.getPlaylist().length-1));
        if(event.data == YT.PlayerState.PLAYING)
            that.index = event.target.getPlaylistIndex();
        if(event.data == YT.PlayerState.ENDED && that.index == event.target.getPlaylist().length-1){
            that.music.next();
            //console.log('Fin de la playlist');
        }
    }
};

YoutubePlayer.prototype.parseURL = function(url)
{
    var type = 'video';
    if(url.indexOf('list=') != -1){
        url = url.replace(/(>|<)/gi,'').split(/(vi\/|list=|\/v\/|youtu\.be\/|\/embed\/)/);
        type = 'playlist';
    } else {
        url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    }

    if(url[2] !== undefined)
        url = url[2].split(/[^0-9a-z_\-]/i);

    return {
        url: url[0],
        type: type
    };
};

YoutubePlayer.prototype.start = function(track){
	if(track.type == 'playlist') this.youtube.loadPlaylist({list: track.url});
    else this.youtube.loadPlaylist(track.url);
};

YoutubePlayer.prototype.pause = function(){
	this.youtube.pauseVideo();
};

YoutubePlayer.prototype.play = function(){
	this.youtube.playVideo();
};

YoutubePlayer.prototype.volume = function(v){
	this.youtube.setVolume(Math.max(0, Math.min(v, 1)) * 100);
};

YoutubePlayer.prototype.destroy = function(){
	this.youtube.destroy();
	if(this.music.room.user.admin){
		this.$playNow.off('.music');
		this.$playLater.off('.music');
	}
};

function Music(room)
{
	this.room = room;
	this.playlist = [];
	this.current = 0;
	this.savedVolume = 0;
	this.currentVolume = 0;
	this.localPlayer;
	this.youtubePlayer;
	this.player;

	this.$play = $("#play");
	this.$mute = $("#mute");
	this.$volume = $("#volume");
	this.$bar = this.$volume.find(".audio-volume-bar");
	this.$musicPlayer = $("#music-player");

    this.$musicPopin;

	this.init();
}

Music.prototype.load = function(data)
{
	console.log('data', data);
    if(data.add){
		if(data.type == 'local'){
			for(var i = 0, l = data.url.length; i<l; i++)
				this.playlist.push({type: data.type, add: data.add, url: data.url[i]});
		} else {
			this.playlist.push(data);
		}

        if(this.playlist.length == 1){
            this.current = 0;
            this.start();
        }
    } else {
		this.playlist = [];
		if(data.type == 'local'){
			for(var i = 0, l = data.url.length; i<l; i++)
				this.playlist.push({type: data.type, add: data.add, url: data.url[i]});
		} else {
			this.playlist.push(data);
		}
		this.current = 0;
        this.start();
    }
};

Music.prototype.start = function()
{
	console.log(this.playlist);
    if(this.playlist.length === 0)
        return;
	if(this.playlist[this.current].type == 'local')
		this.player = this.localPlayer;
	else
		this.player = this.youtubePlayer;

    this.player.start(this.playlist[this.current]);
    this.play();
};

Music.prototype.next = function()
{
	if(++this.current >= this.playlist.length)
		this.current = 0;
	this.start();
};

Music.prototype.play = function()
{
	this.$play
		.removeClass("fa-play")
		.addClass("fa-pause");
	this.player.play();
	this.volume(this.currentVolume);
};

Music.prototype.pause = function()
{
	this.$play
		.removeClass("fa-pause")
		.addClass("fa-play");
	this.player.pause();
};

Music.prototype.volume = function(volume)
{
	volume = Math.min(Math.max(volume, 0), 1);

	var c = "fa ";
	if(volume == 0){
		c += "fa-volume-off";
	} else if(volume < 0.4){
		c += "fa-volume-down";
	} else {
		c += "fa-volume-up";
	}

	this.$mute[0].className = c;

	this.$bar.css('width', (volume*100)+'%');

	if(this.player)
		this.player.volume(volume * 0.2);
    this.currentVolume = volume;
};

Music.prototype.mute = function()
{
	this.savedVolume = this.currentVolume;
	this.volume(0);
};

Music.prototype.unmute = function()
{
	this.volume(this.savedVolume);
	this.savedVolume = 0;
};

Music.prototype.init = function()
{
	var that = this;

	that.youtubePlayer = new YoutubePlayer(that);
	that.localPlayer = new LocalPlayer(that);

    that.volume(0.5);

    that.$volume.on('mousedown.music', function(e){
        e.preventDefault();
        that.volume(Math.round(e.offsetX/$(this).width()*100)/100);
        $(window).on('mousemove.music', function(e){
            var offset = e.clientX - that.$volume.offset().left;
            that.volume(Math.round(offset/that.$volume.width()*100)/100);
        });
    });

    that.$mute.on('click.music', function(){
        if(that.savedVolume == 0){
            that.mute();
        } else {
            that.unmute();
        }
    });

    $(window).on('mouseup.music', function(){
        $(window).off('mousemove.music');
    });

    that.room.socket.on('music', function(data){
        that.load(data);
    });

    that.room.socket.on('music pause', function(){
        that.pause();
    });

    that.room.socket.on('music play', function(){
        that.play();
    });

    that.room.socket.on('music volume', function(data){
        that.volume(data);
    });

    if(that.room.user.admin)
    {
        $('.room-wrapper').append('<div id="music-player"><div class="music-title">Click to choose song</div></div>');

        $('.room-wrapper').append('<div class="music-selector overlay centerer" style="display:none;">'+
            '<div class="popin mui-panel centered">'+
                '<i class="music-selector-close fa fa-times link"></i>'+
				'<div class="youtube-contener"></div>'+
				'<div class="local-contener" style="position:relative;clear:both;"></div>'+
            '</div>'+
        '</div>');

        that.$musicPlayer = $("#music-player");
        that.$musicPopin = $(".music-selector");

        that.$musicPlayer.on("click.music", function(e){
            e.preventDefault();
            if(that.room.user.admin){
                that.$musicPopin.fadeIn(300);
            }
        });

        that.$play.on("click.music", function(e){
            e.preventDefault();
            if(that.room.user.admin)
            {
                var $this = $(this);
                if($this.hasClass('fa-play')){
                    if(that.player){
                        that.room.socket.emit('music play');
                    } else {
                        that.$musicPopin.fadeIn(300);
                    }
                } else {
                    that.room.socket.emit('music pause');
                }
            }
        });

		$('body').on("click.music", ".music-selector-close", function(){
	        that.$musicPopin.fadeOut(300);
	    });
    }
};

Music.prototype.destroy = function()
{
	this.youtubePlayer.destroy();
	this.localPlayer.destroy();

	this.$volume.off('.music');
	this.$mute.off('.music');
	this.$play.off('.music');
	$('body').off('.music');
	$(window).off('.music');

	this.room.socket.removeAllListeners('music');
	this.room.socket.removeAllListeners('music play');
	this.room.socket.removeAllListeners('music pause');
	this.room.socket.removeAllListeners('music volume');

	if(this.room.user.admin){
		this.$musicPlayer.remove();
		this.$musicPopin.remove();
	}
};

/*!
 * JavaScript Cookie v2.0.2
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		var _OldCookies = window.Cookies;
		var api = window.Cookies = factory(window.jQuery);
		api.noConflict = function () {
			window.Cookies = _OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				value = encodeURIComponent(String(value));
				value = value.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				return (document.cookie = [
					key, '=', value,
					attributes.expires && '; expires=' + attributes.expires.toUTCString(), // use expires attribute, max-age is not supported by IE
					attributes.path    && '; path=' + attributes.path,
					attributes.domain  && '; domain=' + attributes.domain,
					attributes.secure ? '; secure' : ''
				].join(''));
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var name = parts[0].replace(rdecode, decodeURIComponent);
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					cookie = converter && converter(cookie, name) || cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.get = api.set = api;
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init();
}));

jQuery.fn.putCursorAtEnd = function() {

  return this.each(function() {

    $(this).focus()

    // If this function exists...
    if (this.setSelectionRange) {
      // ... then use it (Doesn't work in IE)

      // Double the length because Opera is inconsistent about whether a carriage return is one character or two. Sigh.
      var len = $(this).val().length * 2;

      this.setSelectionRange(len, len);
    
    } else {
    // ... otherwise replace the contents with itself
    // (Doesn't work in Google Chrome)

      $(this).val($(this).val());
      
    }

    // Scroll to the bottom, in case we're in a tall textarea
    // (Necessary for Firefox and Google Chrome)
    this.scrollTop = 999999;

  });

};

var hasWebGLSupport = (function(){
	var support = false;
	var tested = false;
	return function(){
		if(!tested){
			var gl = null;
			var canvas = document.createElement('canvas');
			try { gl = canvas.getContext("webgl"); }
			catch (x) { gl = null; }

			if (gl == null) {
				try { gl = canvas.getContext("experimental-webgl"); experimental = true; }
				catch (x) { gl = null; }
			}

			if(gl == null || !window.WebGLRenderingContext){
				support = false;
			} else {
				support = true;
			}

			canvas = null;
			tested = true;
		}

		return support;
	}
})();
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

	this.socket.on('disconnect', function(){
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
