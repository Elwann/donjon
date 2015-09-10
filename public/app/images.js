function Images(room)
{
	this.room = room;
	this.image = "";

	this.$zoom = null;

	this.init();
}

/*
Images.prototype.show = function(data) {
	
};
*/

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
			//TODO: affichage correcte des images, pour l'instant on passe par le chat
			that.room.socket.emit('chat', '<img class="zoomable link" src="'+evt.target.result+'" alt="">')
			//that.room.socket.emit('image', evt.target.result);
		};
		reader.readAsDataURL(image);
	}
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
		});

/*
	this.room.socket.on('image', function(data){
		that.show(data);
	});
*/
};

Images.prototype.destroy = function()
{
	this.close();
	$('body').off('.images');
};