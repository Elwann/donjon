function Images(room)
{
	this.room = room;
	this.image = "";

	this.$zoom = null;

	this.init();
}

Images.prototype.show = function(data) {
	$("#image-"+data.id).html('<img class="zoomable" src="'+data.url+'" alt="'+data.name+'" title="'+data.name+'">');
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