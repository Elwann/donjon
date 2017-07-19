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
