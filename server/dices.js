"use strict";

var CANNON = require('./cannon.js');

var dicesid = 0;
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

function rnd()
{
	return Math.random();
}

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

function makeCollider(vertices, faces, radius) {
	var cv = [], cf = [];
	for (var i = 0; i < vertices.length; ++i) {
		var v = vertices[i];
		var l = radius / Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
		cv.push(new CANNON.Vec3(v[0] * l, v[1] * l, v[2] * l));
	}
	for (var i = 0; i < faces.length; ++i) {
		var f = faces[i];
		cf.push(faces[i].slice(0, faces[i].length - 1));
	}
	return new CANNON.ConvexPolyhedron(cv, cf);
}

function Rolls3D(user, to, rolls, color, box, callbackStart, callbackUpdate, callbackResult, callbackEnd)
{
	this.user = user;
	this.to = to;
	this.box = box;
	this.dices = [];
	this.color = color;
	this.result = null;
	this.endroll;
	this.callbackStart = callbackStart;
	this.callbackUpdate = callbackUpdate;
	this.callbackResult = callbackResult;
	this.callbackEnd = callbackEnd;

	var r = [];
	for(var i = 0, l = rolls.length; i < l; i++)
	{
		r.push({id: this.roll(rolls[i]), type: rolls[i], color: color});
		if(rolls[i] == 'd100')
			r.push({id: this.roll('d10'), type: 'd10', color: color});
	}

	callbackStart(this.to, this.box.room, r);
}

Rolls3D.prototype.update = function()
{
	if(this.result == null)
	{
		var diceUpdate = {};
		for (var i = this.dices.length - 1; i >= 0; i--)
		{
			var dice = this.dices[i];
			if(!dice.check())
			{
				diceUpdate[dice.id] = [
					dice.body.position.x,
					dice.body.position.y,
					dice.body.position.z,
					dice.body.quaternion.x,
					dice.body.quaternion.y,
					dice.body.quaternion.z,
					dice.body.quaternion.w
				];
			}
		}

		if(Object.keys(diceUpdate).length > 0)
		{
			this.callbackUpdate(this.to, this.box.room, diceUpdate);
		} else {
			this.check();
			this.endroll = (new Date).getTime();
		}
	}
	else if((new Date).getTime() - this.endroll > 2000)
	{
		this.remove();
	}
};

Rolls3D.prototype.check = function()
{
	this.result = {
		total: 0,
		details: [],
		dices: {}
	};

	var i = 0;
	var l = this.dices.length;
	while (i < l) {
		var dice = this.dices[i];
		if(dice.type == 'd100')
		{
			var d100 = (dice.result() * 10) % 100;
			var d10 = 0;
			this.result.dices[dice.id] = v;
			if(this.dices[i+1]){
				d10 = this.dices[i+1].result() % 10;
				this.result.dices[this.dices[i+1].id] = v;
			}
			var v = (d100 + d10 == 0) ? 100 : d100 + d10
			this.result.total += v;
			this.result.details.push(v);
			i+=2;
		}
		else
		{
			var v = dice.result()
			this.result.total += v;
			this.result.details.push(v);
			this.result.dices[dice.id] = v;
			i++;
		}
	}

	this.result.details = this.result.details.join(' + ');
	this.callbackResult(this.to, this.box.room, this.user, this.result);
};

Rolls3D.prototype.remove = function()
{
	var r = [];
	for (var i = this.dices.length - 1; i >= 0; i--) {
		r.push(this.dices[i].id);
		this.dices[i].remove();
	}

	this.callbackEnd(this.to, this.box.room, r);
	var index = this.box.rolls.indexOf(this);
	if(index >= 0)
		this.box.rolls.splice(index, 1);
};

Rolls3D.prototype.roll = function(type)
{
	if(DicesModels3D[type])
	{
		var id = dicesid++;
		this.dices.push(new Dice3D(id, type, this.color, this));
		return id;
	}
	else
	{
		console.log("wrong dice type");
		return -1;
	}
};

function Dice3D(id, type, color, rolls)
{
	this.id = id;
	this.type = type;
	this.color = color;
	this.rolls = rolls;
	this.radius = 0.6*DicesModels3D[this.type].scale*this.rolls.box.scale;
	this.body;

	this.top = (this.type == "d4") ? -1 : 1;

	this.stoped = false;
	this.timestop = 0;
	this.timestart = (new Date).getTime();

	var from = Math.floor(rnd() * 4);

	var x = -this.rolls.box.w * 0.9;
	var y = -this.rolls.box.h * 0.9;

	if(from == 0 || from == 1)
	{
		// TOP
		x = (this.rolls.box.w - (rnd() * this.rolls.box.w * 2))*0.9;
		// BOTTOM
		if(from == 1) y = this.rolls.box.h * 0.9;
	}
	else if(from == 2 || from == 3)
	{
		// LEFT
		y = (this.rolls.box.h - (rnd() * this.rolls.box.h * 2))*0.9;
		// RIGHT
		if(from == 3) x = this.rolls.box.w * 0.9;
	}

	this.rotation = {x: rnd() * 180, y: rnd() * 180, z: rnd() * 180, w: rnd() * 180};
	this.position = {
		x: x,
		y: y,
		z: this.rolls.box.scale * 2
	};

	this.createCollider();

	var velocity = new CANNON.Vec3(0-this.position.x, 0-this.position.y, 0);
	velocity.normalize();
	velocity = velocity.mult(30 * rnd() + 30);

	this.body.angularVelocity.set(velocity.x, velocity.y, velocity.z);

	velocity.normalize();
	velocity = velocity.mult(1500 * rnd() + 1000);

	this.body.velocity.set(velocity.x, velocity.y, 0);
}

Dice3D.prototype.createCollider = function()
{
	var model = DicesModels3D[this.type];
	var body = new CANNON.RigidBody(model.mass, makeCollider(model.geometry.vertices, model.geometry.faces, this.radius));

	body.position.set(this.position.x, this.position.y, this.position.z);
	body.quaternion.set(this.rotation.x, this.rotation.y, this.rotation.z, this.rotation.w);
	body.linearDamping = 0.1;
	body.angularDamping = 0.1;

	this.body = body;
	this.rolls.box.world.add(body);
};

Dice3D.prototype.check = function()
{
	if (this.stopped) return true;

	var res = false;
	var e = 10;
	var a = this.body.angularVelocity
	var v = this.body.velocity;
	var time = (new Date()).getTime();

	if(time - this.timestart < 10000)
	{
		if (Math.abs(a.x) < e && Math.abs(a.y) < e && Math.abs(a.z) < e && Math.abs(v.x) < e && Math.abs(v.y) < e && Math.abs(v.z) < e)
		{
			if(this.timestopped != 0){
				if (time - this.timestopped > 100) {
					this.stopped = true;
					res = true;
				}
			} else {
				this.timestopped = (new Date()).getTime();
				res = false;
			}
		}
		else
		{
			this.timestopped = 0;
		}
	}
	else
	{
		this.stopped = true;
		res = true;
	}

	return res;
};

Dice3D.prototype.result = function()
{
	var index = -1;
	var distance = 999999;

	for (var i = 0, length = (this.type == 'd10' || this.type == 'd100') ? 10 : this.body.shape.faceNormals.length ; i < length; i++)
	{
		var dist = new CANNON.Vec3(0, 0, this.top).distanceTo(this.body.quaternion.vmult(this.body.shape.faceNormals[i]));
		if(dist < distance)
		{
			index = i+1;
			distance = dist;
		}
	}

	return index;
};

Dice3D.prototype.remove = function() {
	this.rolls.box.world.remove(this.body);
	var i = this.rolls.dices.indexOf(this);
	if(i >= 0)
		this.rolls.dices.splice(i, 1);
};

function Dices3D(room, width, height)
{
	this.room = room;
	this.w = width;
	this.h = height;
	this.cw;
	this.ch;
	this.scale;
	this.aspect;
	this.dice_body_material;
	this.world;
	this.timer = null;
	this.loop;

	this.rolls = [];

	this.init();
}

Dices3D.prototype.init = function()
{
	var that = this;

	this.cw = this.w / 2;
	this.ch = this.h / 2;

	this.aspect = Math.min(this.cw / this.w, this.ch / this.h);
	this.scale = Math.sqrt(this.w * this.w + this.h * this.h) / 13;

	this.rolls = [];

	this.world = new CANNON.World();

	this.world.gravity.set(0, 0, -9.82 * 400);
	this.world.broadphase = new CANNON.NaiveBroadphase();
	this.world.solver.iterations = 8;

	var wh = Math.min(this.cw, this.ch) / this.aspect / Math.tan(10 * Math.PI / 180);

	this.dice_body_material = new CANNON.Material();
	var desk_body_material = new CANNON.Material();
	var barrier_body_material = new CANNON.Material();

	this.world.addContactMaterial(new CANNON.ContactMaterial(desk_body_material, this.dice_body_material, 0.01, 0.5));
	this.world.addContactMaterial(new CANNON.ContactMaterial(barrier_body_material, this.dice_body_material, 0, 1.0));
	this.world.addContactMaterial(new CANNON.ContactMaterial(this.dice_body_material, this.dice_body_material, 0, 0.5));

	this.world.add(new CANNON.RigidBody(0, new CANNON.Plane()));

	var barrier;
	barrier = new CANNON.RigidBody(0, new CANNON.Plane());
	barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
	barrier.position.set(0, this.h * 0.93, 0);
	this.world.add(barrier);

	barrier = new CANNON.RigidBody(0, new CANNON.Plane());
	barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
	barrier.position.set(0, -this.h * 0.93, 0);
	this.world.add(barrier);

	barrier = new CANNON.RigidBody(0, new CANNON.Plane());
	barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
	barrier.position.set(this.w * 0.93, 0, 0);
	this.world.add(barrier);

	barrier = new CANNON.RigidBody(0, new CANNON.Plane());
	barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
	barrier.position.set(-this.w * 0.93, 0, 0);
	this.world.add(barrier);
};

Dices3D.prototype.loop = function()
{
	var that = this;
	this.world.step(1/30);
	this.update();

	if(this.rolls.length > 0) {
		this.timer = setTimeout(function(){ that.loop(); }, 1000/30);
	} else {
		clearTimeout(this.timer);
		this.timer = null;
	}
};

Dices3D.prototype.roll = function(user, to, dices, color, callbackStart, callbackUpdate, callbackResult, callbackEnd)
{
	var that = this;
	if(dices.length > 20) return false;
	this.rolls.push(new Rolls3D(user, to, dices, color, that, callbackStart, callbackUpdate, callbackResult, callbackEnd));
	if(this.timer == null)
		this.timer = setTimeout(function(){ that.loop(); }, 1000/30);

	return true;
};

Dices3D.prototype.update = function()
{
	for (var i = this.rolls.length - 1; i >= 0; i--)
	{
		this.rolls[i].update();
	}
};

module.exports = {
	Dices3D: Dices3D
};