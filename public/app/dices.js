var Dices = {
	dices: [],
	// Clear dices
	unload: function(){
		Dices.dices = [];
	},
	/*
	For now we update this when we load the messages
	// Load dice for room in param
	load: function(roomCookie){
		Dices.unload();
		var cookie = Cookies.get(roomCookie);
		if(cookie){
			var dices = cookie.split('|');
			for (var i = dices.length - 1; i >= 0; i--) {
				var dice = dices[i].split('#');
				Dices.dices.push({
					type: dice[0],
					rolls: dice[1]
				});
			};

			Dices.show(3);
		}
	},
	// Save dices for room
	save: function(roomCookie){
		var dices = [];

		for (var i = Dices.dices.length - 1; i >= 0; i--) {
			dices.push(Dices.dices[i].type+"#"+Dices.dices[i].rolls);
		}

		if(dices.length > 0){
			Cookies.set(roomCookie, dices.join('|'), { expires: 356 });
		} else {
			console.log("No dices to save");
		}
	},
	*/
	// Show dices
	show: function(){
		Dices.sort();
		var number = Dices.number();
		var htmlDice = $("#dices");
		var length = (Dices.dices.length > number) ? number : Dices.dices.length;
		htmlDice.html("");
		htmlDice[0].className = "dices-"+length;
		for(var i = 0; i < length; i++){
			var diceClass = Dices.dices[i].type.split('d').pop();
			htmlDice.append('<div class="dice d'+diceClass+'">'+Dices.dices[i].type+'</div>');
		}
	},
	// Sort dices by number of rolls
	sort: function(){
		Dices.dices.sort(function(a, b){ return b.rolls - a.rolls; });
	},
	// Show 
	roll: function(dice){
		// Merge 1dX and dX
		dice = dice.split('d');
		if(dice[0] == "1")
			dice[0] = "";
		dice = dice.join('d');

		var exist = false;
		for (var i = Dices.dices.length - 1; i >= 0; i--) {
			if(Dices.dices[i].type == dice){
				exist = true;
				++Dices.dices[i].rolls;
				break;
			}
		}

		if(!exist)
			Dices.dices.push({type: dice, rolls: 1});

		Dices.show();
	},
	number: function(){
		return Math.max(Math.min(Math.round(($(window).width() * 0.15) / 40), 5), 1);
	}
}

$(window).resize(function(){
	Dices.show();
});