function Dices(room)
{
	this.room = room;
	this.dices = [];

	this.init();
}

// Clear dices
Dices.prototype.unload = function()
{
	this.dices = [];
};

/*
// Load dice for room in param
Dices.prototype.load = function(roomName)
{
	this.unload();
	var cookie = Cookies.get(roomName);
	if(cookie){
		var dices = cookie.split('|');
		for (var i = dices.length - 1; i >= 0; i--) {
			var dice = dices[i].split('#');
			this.dices.push({
				type: dice[0],
				rolls: dice[1]
			});
		};

		this.show(3);
	}
};

// Save dices for room
Dices.prototype.save = function(roomName)
{
	var dices = [];

	for (var i = this.dices.length - 1; i >= 0; i--) {
		dices.push(this.dices[i].type+"#"+this.dices[i].rolls);
	}

	if(dices.length > 0){
		Cookies.set(roomName, dices.join('|'), { expires: 356 });
	} else {
		console.log("No dices to save");
	}
};
*/

// Show dices
Dices.prototype.show = function()
{
	this.sort();
	var number = this.number();
	var htmlDice = $("#dices");
	var length = (this.dices.length > number) ? number : this.dices.length;
	htmlDice.html("");
	htmlDice[0].className = "dices-"+length;
	for(var i = 0; i < length; i++){
		var diceClass = this.dices[i].type.split('d').pop();
		htmlDice.append('<div class="dice d'+diceClass+'">'+this.dices[i].type+'</div>');
	}
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
			++this.dices[i].rolls;
			break;
		}
	}

	if(!exist)
		this.dices.push({type: dice, rolls: 1});

	this.show();
};

Dices.prototype.number = function()
{
	return Math.max(Math.min(Math.round(($(window).width() * 0.15) / 40), 5), 1);
};

Dices.prototype.init = function()
{
	var that = this;

	$(window).on('resize.dices', function(){
		that.show();
	});

	$(document).on("click.dices", ".dice", function(e){
		e.preventDefault();
		var dice = $(this).html();
		that.room.socket.emit('chat', "/roll "+dice);
	});
};

Dices.prototype.destroy = function()
{
	$(window).off('.dices');
	$(document).off('.dices');
};