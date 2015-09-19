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

	this.position = {x: 0, y: 0, z: 0};
	this.rotation = {x: 0, y: 0, z: 0, w: 0};

	this.stoped = false;
	this.timestop = 0;

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

	this.dices = {};

	this.init();
}

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
	//this.renderer.sortObjects = false;

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
	var light = new THREE.SpotLight(0xffffff);
	light.position.set(-mw / 2, mw / 2, mw * 2);
	light.target.position.set(0, 0, 0);
	light.castShadow = true;
	light.shadowCameraNear = mw / 10;
	light.shadowCameraFar = mw * 3;
	light.shadowCameraFov = 50;
	light.shadowBias = 0.001;
	light.shadowDarkness = 0.3;
	light.shadowMapWidth = 1024;
	light.shadowMapHeight = 1024;
	this.scene.add(light);

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

	this.desk = new THREE.Mesh(new THREE.PlaneGeometry(this.w * 2, this.h * 2, 1, 1), planeMaterial);
	this.desk.receiveShadow = true;
	this.scene.add(this.desk);

	this.room.socket.on('dice start', function(data){
		for(var i = 0; i < data.length; i++){
			that.dices[data[i].id] = new Dice3D(data[i].id, data[i].type, data[i].color, that);
		}
	});

	this.room.socket.on('dice update', function(data){
		for(var i in data){
			that.dices[i].update(data[i]);
		}
		that.renderer.render(that.scene, that.camera);
	});

	this.room.socket.on('dice end', function(data){
		for(var i = 0; i < data.length; i++){
			that.dices[data[i]].remove();
		}
		that.renderer.render(that.scene, that.camera);
	});
};

Dices3D.prototype.remove = function() {
	this.room.socket.removeAllListeners('dice start');
	this.room.socket.removeAllListeners('dice update');
	this.room.socket.removeAllListeners('dice end');
};