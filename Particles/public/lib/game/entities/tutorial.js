ig.module(
	'game.entities.tutorial'
	)
.requires(
	'impact.entity'
	)
.defines(function () {
	EntityTutorial = ig.Entity.extend({
		name: "tutorial",
		gravityFactor: 0,
		size: {
			x: 300,
			y: 100
		},
		offsety: 70,
		offsetx: 0,
		zIndex: 15,
		hidden: true,
		tempHide: false,  // flag for hiding just when atomizer gets opened during a tutorial
		tutNum: 0,        // keeps track of which tutorial to show
		tutTimer: false,  // timer for some tutorials
		c: 0,
		tick: 0, //ticker for slowly cycling color
		down: false,
		font: new ig.Font( 'media/andal_small.png' ),
		fontLarge: new ig.Font( 'media/andal_large.png' ),
		fontMed: new ig.Font( 'media/andal_hover.png' ),
		headIMG: new ig.Image( 'media/head2.png' ),
		comeOnSound: new ig.Sound( 'media/sounds/come-on-2.ogg' ),
		comeOnSound: new ig.Sound( 'media/sounds/come-on-2.mp3' ),
		ohYeahSound: new ig.Sound( 'media/sounds/oh-yeah-2.ogg' ),
		ohYeahSound: new ig.Sound( 'media/sounds/oh-yeah-2.mp3' ),
		yes1Sound: new ig.Sound( 'media/sounds/yes-1.ogg' ),
		yes1Sound: new ig.Sound( 'media/sounds/yes-1.mp3' ),
		yes2Sound: new ig.Sound( 'media/sounds/yes-2.ogg' ),
		yes2Sound: new ig.Sound( 'media/sounds/yes-2.mp3' ),
		no3Sound: new ig.Sound( 'media/sounds/no-3.ogg' ),
		no3Sound: new ig.Sound( 'media/sounds/no-3.mp3' ),

		// Flags for each tutorial message
		flag: {
			"0": false, // wall
			"1": false, // portal
			"2": false, // gem see
			"3": false, // atomizer1
			"4": false, // atomizer2
			"5": false, // atomizer early close
			"6": false, // test button
			"7": false, // close
			"8": false, // throw hard
			"9": false, // use breaker
			"10": false, // different block types
			"11": false, // worm
			"12": false, // slippery?
			"13": false, // laser snake
			"98": false, // bouncy block
			"99": false,  // breaker after 12
			"999": false  // trigger to close all possibly open messages in first level
		},
		soundFlag: {
			"0": false, //wall
			"2": false, //gem see
			"4": false, // atomizer 2
			"5": false, // atomizer early close
			"6": false, // test button
			"98": false, // bouncy block
		},
		maxblock: false, // special flag for throwing too many blocks
		wallflag: false, // special flag for first wall (in case player removes wall early)
		lastflag: false,
		closeTip: false,

		//animSheet: new ig.AnimationSheet('media/tutorialBack.png', 500, 400),
		init: function (x, y, settings) {
			// ANIMATION IS JUST A BACKGROUND IMAGE
			// this.addAnim('idle', 1, [0]);
			// this.addAnim('hide', 1, [1]);
			this.player = ig.game.getEntitiesByType( EntityPlayer )[0];
			this.tutDone = [];
			// this.currentAnim = this.anims.hide;
			this.parent(x, y, settings);
		},

		triggeredBy: function( entity, trigger ) {
			var skip = false;
			if (trigger.num === 0 && this.wallflag) {
				skip = true;
			}
			if (!this.flag[trigger.num] && !skip){
				this.tutNum = trigger.num;
				this.flag[trigger.num] = true;
				this.pos.x = this.player.pos.x - this.size.x/2;
				this.pos.y = this.player.pos.y - this.size.y/2 - this.offsety;
				if (this.hidden){
					this.hidden = false;
				}
				if (trigger.timer > 0){
					this.tutTimer = new ig.Timer(trigger.timer);
				}
			}
			if (trigger.num === 6 && ig.game.tip < 3){   // if the player skips the hard block creation
				ig.game.tip = 3; // assume they know whats up and skip atomizer tutorial stuff
				this.flag[1] = false;
				this.flag[2] = false;
				this.flag[3] = false;
				this.flag[4] = false;
				this.flag[5] = false;

			}
			if (trigger.num === 999) { // wipe open tutorials once player reaches this point
				ig.game.tip = 3;
				this.flag[1] = false;
				this.flag[2] = false;
				this.flag[3] = false;
				this.flag[4] = false;
				this.flag[5] = false;
				this.flag[6] = false;
				this.flag[7] = false;
				this.flag[8] = false;
				this.flag[9] = false;
				this.flag[10] = false;
				this.flag[11] = false;
				this.flag[12] = false;
				this.flag[13] = false;
				this.flag[999] = false;
				this.hidden = true;
				this.tutTimer = 0;
				this.tempHide = false;
				this.tutNum = 100;
			}
			if (trigger.num === 998){  // flag for checking to see how deep into the first level the player is (for bounce tut)
				MyGame.midLevel1 = true;
			}
		},

		drawSpeak: function(color, fill, tail){
			var ctx = ig.system.context;
			var xpos = ig.system.getDrawPos(this.pos.x - ig.game.screen.x);
			var ypos = ig.system.getDrawPos(this.pos.y - ig.game.screen.y);
			var pxpos = ig.system.getDrawPos(this.player.pos.x - ig.game.screen.x) + this.player.size.x + 5;
			var pypos = ig.system.getDrawPos(this.player.pos.y - ig.game.screen.y) + 5;

			ctx.fillStyle = color;
			ctx.strokeStyle = color;
			ctx.lineWidth = 5;

			this.roundedRect(ctx, xpos, ypos, this.size.x, this.size.y, 10, fill);
			if (tail){
				if (!this.flip){
					ctx.beginPath();
					ctx.moveTo(pxpos, pypos);
					ctx.lineTo(xpos + this.size.x/1.5, ypos + this.size.y)
					ctx.lineTo(xpos + this.size.x/1.2, ypos + this.size.y)
					ctx.lineTo(pxpos, pypos);
					ctx.closePath();
					ctx.fill();
				} else {
					pxpos = ig.system.getDrawPos(this.player.pos.x - ig.game.screen.x) - 10;
					ctx.beginPath();
					ctx.moveTo(pxpos, pypos);
					ctx.lineTo(xpos + this.size.x/1.5, ypos + this.size.y)
					ctx.lineTo(xpos + this.size.x/1.2, ypos + this.size.y)
					ctx.lineTo(pxpos, pypos);
					ctx.closePath();
					ctx.fill();
				}
			}

		},

		drawText: function(){
			var xs = this.pos.x - ig.game.screen.x + this.size.x/2;
			var ys = this.pos.y - ig.game.screen.y + 15;
			switch (this.tutNum){
				case 0:
					this.size.x = 300;
					this.size.y = 100;
					this.flip = false;
					this.drawSpeak("rgba(0,0,0,0.9)", true, true); // <-playing with color here green: 111, 252, 151
					this.fontMed.draw ('Ack! A Wall!', xs, ys, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("I'll make short work", xs, ys + 20, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("of it with a block!", xs, ys + 40, ig.Font.ALIGN.CENTER);
					if (!this.soundFlag[0]){
						this.ohYeahSound.play();
						this.soundFlag[0] = true;
					}
					break;
				case 1: 
					this.size.x = 350;
					this.size.y = 100;
					this.flip = true;
					this.drawSpeak("rgba(0,0,0,0.9)", true, true);
					this.fontMed.draw ("A save portal!", xs, ys, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("That'll come in handy", xs, ys + 20, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("if I fall into the lava!", xs, ys + 40, ig.Font.ALIGN.CENTER);
					break;
				case 2:
					this.size.x = 400;
					this.size.y = 150;
					this.flip = true;
					this.drawSpeak("rgba(0,0,0,0.9)", true, true);
					this.fontMed.draw ("That gem is just out of reach!", xs, ys-10, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("Maybe a few well placed", xs, ys + 25, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("blocks would help...", xs, ys + 60, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("Open the atomizer", xs-140, ys + 95, ig.Font.ALIGN.LEFT);
					//this.fontMed.draw("to get started.", xs+70, ys + 95, ig.Font.ALIGN.CENTER);
					var atomizer = new ig.Image('media/atombg.png');
					atomizer.draw(xs + 90, ys+80);
					if (!this.soundFlag[2]){
						this.comeOnSound.play();
						this.soundFlag[2] = true;
					}
					break;
				case 3:
					if (ig.game.condition == "build"){
						this.size.x = 636;
						this.size.y = 50;
						this.flip = false;
						this.pos.x = ig.game.atomizer.pos.x;
						this.pos.y = ig.game.atomizer.pos.y - 50;
						xs = this.pos.x - ig.game.screen.x + this.size.x/2;
						ys = this.pos.y - ig.game.screen.y + 15;
						this.drawSpeak("rgba(0,0,0,0.7)", true, false);
						this.drawSpeak("rgba(255,230,0, "+ (1 - this.c) +")", false, false);
						this.colorTick();
						this.fontMed.draw ("The molecule I design here will be one of", xs, ys-10, ig.Font.ALIGN.CENTER);
						this.fontMed.draw("millions that make up each thrown block.", xs, ys + 10, ig.Font.ALIGN.CENTER);
						this.headIMG.draw(xs-380, ys-25);
						break;
					} else {
						this.size.x = 636;
						this.size.y = 50;
						this.flip = false;
						this.pos.x = ig.game.atomizer.pos.x;
						this.pos.y = ig.game.atomizer.pos.y - 50;
						xs = this.pos.x - ig.game.screen.x + this.size.x/2;
						ys = this.pos.y - ig.game.screen.y + 15;
						this.drawSpeak("rgba(0,0,0,0.7)", true, false);
						this.drawSpeak("rgba(255,230,0, "+ (1 - this.c) +")", false, false);
						this.colorTick();
						this.fontMed.draw ("This block breaks easily. I need one that's", xs, ys-10, ig.Font.ALIGN.CENTER);
						this.fontMed.draw("hard! Maybe I'll try the blue block.", xs, ys + 10, ig.Font.ALIGN.CENTER);
						this.headIMG.draw(xs-380, ys-25);

						//highlight properties
						this.size.x = 105;
						this.size.y = 100;
						this.flip = false;
						this.pos.x = ig.game.atomizer.pos.x + 526;
						this.pos.y = ig.game.atomizer.pos.y + 140;
						this.drawSpeak("rgba(255,230,0, "+ (1 - this.c) +")", false, false);
						this.colorTick();

						break;
					}
				case 4:
					this.size.x = 636;
					this.size.y = 50;
					this.flip = false;
					this.pos.x = ig.game.atomizer.pos.x;
					this.pos.y = ig.game.atomizer.pos.y - 50;
					xs = this.pos.x - ig.game.screen.x + this.size.x/2;
					ys = this.pos.y - ig.game.screen.y + 15;
					this.drawSpeak("rgba(0,0,0,0.7)", true, false);
					this.drawSpeak("rgba(255,230,0, "+ (1 - this.c) +")", false, false);
					this.colorTick();
					this.fontMed.draw ("Create a bond between every atom to", xs, ys-10, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("make a block that is very hard.", xs, ys + 10, ig.Font.ALIGN.CENTER);
					this.headIMG.draw(xs-380, ys-25);
					if (!this.soundFlag[4]){
						this.yes1Sound.play();
						this.soundFlag[4] = true;
					}
					break;
				case 5:
					this.size.x = 636;
					this.size.y = 50;
					this.flip = false;
					this.pos.x = ig.game.atomizer.pos.x;
					this.pos.y = ig.game.atomizer.pos.y - 50;
					xs = this.pos.x - ig.game.screen.x + this.size.x/2;
					ys = this.pos.y - ig.game.screen.y + 15;
					this.drawSpeak("rgba(0,0,0,0.7)", true, false);
					this.drawSpeak("rgba(255,230,0, "+ (1 - this.c) +")", false, false);
					this.colorTick();
					this.fontMed.draw ("Connect ALL the atoms before closing", xs, ys-10, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("the atomizer or switching blocks.", xs, ys + 10, ig.Font.ALIGN.CENTER);
					this.headIMG.draw(xs-380, ys-25);
					if (!this.soundFlag[5]){
						this.no3Sound.play();
						this.soundFlag[5] = true;
					}
					break;
					break;
				case 6:
					if (ig.game.condition == "build"){
						this.size.x = 636;
						this.size.y = 50;
						this.flip = false;
						this.pos.x = ig.game.atomizer.pos.x;
						this.pos.y = ig.game.atomizer.pos.y - 50;
						xs = this.pos.x - ig.game.screen.x + this.size.x/2;
						ys = this.pos.y - ig.game.screen.y + 15;
						this.drawSpeak("rgba(0,0,0,0.7)", true, false);
						this.drawSpeak("rgba(255,230,0, "+ (1 - this.c) +")", false, false);
						this.colorTick();
						this.fontMed.draw ("Press TEST to see the properties the", xs, ys-10, ig.Font.ALIGN.CENTER);
						this.fontMed.draw("block will have when I throw it!", xs, ys + 10, ig.Font.ALIGN.CENTER);
						this.headIMG.draw(xs-380, ys-25);
					} else {
						this.size.x = 636;
						this.size.y = 50;
						this.flip = false;
						this.pos.x = ig.game.atomizer.pos.x;
						this.pos.y = ig.game.atomizer.pos.y - 50;
						xs = this.pos.x - ig.game.screen.x + this.size.x/2;
						ys = this.pos.y - ig.game.screen.y + 15;
						this.drawSpeak("rgba(0,0,0,0.7)", true, false);
						this.drawSpeak("rgba(255,230,0, "+ (1 - this.c) +")", false, false);
						this.colorTick();
						this.fontMed.draw ("Look at all the bonds! And the block rates", xs, ys-10, ig.Font.ALIGN.CENTER);
						this.fontMed.draw("high on hardness. I'll close and try it!", xs, ys + 10, ig.Font.ALIGN.CENTER);
						this.headIMG.draw(xs-380, ys-25);
						//highlight properties
						this.size.x = 108;
						this.size.y = 280;
						this.flip = false;
						this.pos.x = ig.game.atomizer.pos.x + 623;
						this.pos.y = ig.game.atomizer.pos.y + 220;
						this.drawSpeak("rgba(255,230,0, "+ (1 - this.c) +")", false, false);
						this.colorTick();
					}

					if (!this.soundFlag[6]){
						this.yes2Sound.play();
						this.soundFlag[6] = true;
					}
					break;
				case 7:
					this.size.x = 636;
					this.size.y = 50;
					this.flip = false;
					this.pos.x = ig.game.atomizer.pos.x;
					this.pos.y = ig.game.atomizer.pos.y - 50;
					xs = this.pos.x - ig.game.screen.x + this.size.x/2;
					ys = this.pos.y - ig.game.screen.y + 15;
					this.drawSpeak("rgba(0,0,0,0.7)", true, false);
					this.drawSpeak("rgba(255,230,0, "+ (1 - this.c) +")", false, false);

					//highlight properties
					this.size.x = 108;
					this.size.y = 280;
					this.flip = false;
					this.pos.x = ig.game.atomizer.pos.x + 623;
					this.pos.y = ig.game.atomizer.pos.y + 220;
					this.drawSpeak("rgba(255,230,0, "+ (1 - this.c) +")", false, false);
					this.colorTick();

					this.fontMed.draw ("Looks like this block WILL be a hard one!", xs, ys-10, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("I'll close the atomizer and try it!", xs, ys + 10, ig.Font.ALIGN.CENTER);
					this.headIMG.draw(xs-380, ys-25);
					break;
				case 8:
					this.size.x = 380;
					this.size.y = 100;
					this.flip = true;
					this.drawSpeak("rgba(0,0,0,0.9)", true, true);
					this.fontMed.draw ("Now if I throw a couple", xs, ys, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("of those new hard blocks", xs, ys + 20, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("near that wall...", xs, ys + 40, ig.Font.ALIGN.CENTER);
					break;
				case 9:
					this.size.x = 400;
					this.size.y = 150;
					this.flip = false;
					this.drawSpeak("rgba(0,0,0,0.9)", true, true);
					this.fontMed.draw ('Huzzah! I can only have', xs, ys-10, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("12 blocks active at a time!", xs, ys + 25, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("Use the", xs - 180, ys + 60, ig.Font.ALIGN.LEFT);
					this.fontMed.draw("to break all", xs-15, ys + 60, ig.Font.ALIGN.LEFT);
					this.fontMed.draw("active blocks at once!", xs, ys + 100, ig.Font.ALIGN.CENTER);
					var breaker = new ig.Image('media/breaker.png');
					breaker.draw(xs-80, ys+50);
					break;
				case 10:
					this.size.x = 470;
					this.size.y = 150;
					this.flip = false;
					this.drawSpeak("rgba(0,0,0,0.9)", true, true);
					this.fontMed.draw ('Blocks can be hard, slippery,', xs, ys-10, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("bouncy, or a combination of", xs, ys + 25, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("these properties. Maybe I'll", xs, ys + 60, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("experiment in the atomizer later...", xs, ys + 95, ig.Font.ALIGN.CENTER);
					break;
				case 11:
					this.size.x = 400;
					this.size.y = 100;
					this.flip = false;
					this.drawSpeak("rgba(0,0,0,0.9)", true, true);
					this.fontMed.draw ('Those worms are a pain!,', xs, ys, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("But a long fall usually", xs, ys + 20, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("keeps them from coming back.", xs, ys + 40, ig.Font.ALIGN.CENTER);
					break;
				case 12:
					this.size.x = 470;
					this.size.y = 150;
					this.flip = false;
					this.drawSpeak("rgba(0,0,0,0.9)", true, true);
					this.fontMed.draw ('A slippery block could loosen up', xs, ys-10, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("platforms to fall on that worm.", xs, ys + 25, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("But what kind of structure makes", xs, ys + 60, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("a slippery block?", xs, ys + 95, ig.Font.ALIGN.CENTER);
					break;
				case 13:
					this.size.x = 470;
					this.size.y = 150;
					this.flip = false;
					this.drawSpeak("rgba(0,0,0,0.9)", true, true);
					this.fontMed.draw ('Holy smokes!  Did that snake', xs, ys-10, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("just pew pew!?", xs, ys + 25, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("Wonder if I could make a block", xs, ys + 60, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("to stop that laser...", xs, ys + 95, ig.Font.ALIGN.CENTER);
					break;
//----------> CREATE A NEW CASE 98 THAT GIVES FIRED OFF IF YOU HAVENT' MADE A BOUNCY BLOCK AFTER A CERTAIN AMOUNT OF TIME
				case 98:
					this.size.x = 500;
					this.size.y = 100;
					this.flip = true;
					this.drawSpeak("rgba(0,0,0,0.9)", true, true);
					this.fontMed.draw ("A bouncy block would be very useful!", xs, ys, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("Maybe I should play in the", xs, ys + 20, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("atomizer more...", xs, ys + 40, ig.Font.ALIGN.CENTER);
					if (!this.soundFlag[98]){
						this.comeOnSound.play();
						this.soundFlag[98] = true;
					}
					break;
				case 99:
					this.size.x = 400;
					this.size.y = 150;
					this.flip = false;
					this.drawSpeak("rgba(0,0,0,0.9)", true, true);
					this.fontMed.draw ('I can only have 12 blocks', xs, ys-10, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("active at a time!", xs, ys + 25, ig.Font.ALIGN.CENTER);
					this.fontMed.draw("Use the", xs - 180, ys + 60, ig.Font.ALIGN.LEFT);
					this.fontMed.draw("to break all", xs-15, ys + 60, ig.Font.ALIGN.LEFT);
					this.fontMed.draw("active blocks at once!", xs, ys + 100, ig.Font.ALIGN.CENTER);
					var breaker = new ig.Image('media/breaker.png');
					breaker.draw(xs-80, ys+50);
					break;
				default:
                			//nothin'
                		}

                	},

                	update: function(){
                		if (!this.hidden){
                			this.offsety = this.size.y - 30;
				// if (this.flip) {
				// 	this.offsetx = 100;
				// } else {
				// 	this.offsetx = 0;
				// }
				this.offsetx = this.flip ? 200 : 0;
				this.pos.x = this.player.pos.x - this.size.x/2 - this.offsetx;
				this.pos.y = this.player.pos.y - this.size.y/2 - this.offsety;
			    	// if (this.flag[tutNum] === false){
			    	// 	this.flag[tutNum] = true;
			    	// }
			    }
			    if (this.tutTimer){
			    	if (this.tutTimer.delta() > 0){
					if (this.flag[9]){  // breaker flag for trigger 6
						this.flag[9] = false;
						//this.tutorial.hidden = true;
						this.flag[10] = true;   // turn on flag about other types of blocks
						this.maxblock = true;
						this.tutNum = 10;
						this.tutTimer = new ig.Timer(5);
					} else {
						this.hidden = true;
						this.flag[this.tutNum] = false;
						this.tutTimer = 0;
					}
				}
			}
			if (this.player._killed){
				if (!this.hidden){
					if (this.flag[this.tutNum] === true){
						this.flag[this.tutNum] = false;
						this.lastflag = this.tutNum;
					}
					var triggers = ig.game.getEntitiesByType( EntityTrigger );
					for (var a=0; a<triggers.length; a++){
						if (triggers[a].num === this.lastflag){
							triggers[a].canFire = true;
						}
					}
				}
				this.hidden = true;
				var players = ig.game.getEntitiesByType( EntityPlayer );
				if (players.length > 0){
					this.player = players[0];
				}
			}
			if (this.hidden === false && ig.game.game_mode === 2 && 
				(!this.flag[2] && !this.flag[3] && !this.flag[4] && !this.flag[5] && !this.flag[6] && !this.flag[7])){
				this.hidden = true;
				this.tempHide = true;
				if (this.tutTimer){
					this.tutTimer.pause();
				}
			} else if (ig.game.game_mode === 1 && this.tempHide){
				this.hidden = false;
				this.tempHide = false;
				if (this.tutTimer){
					this.tutTimer.unpause();
				}
			}

			this.parent()
		},

		colorTick: function() {
			if (this.tick > 4){
				if (this.c < 1 && !this.down){
					this.c += 0.1;
				} else if (!this.down && this.c >= 1) {
					this.down = true;
					this.c = 1;
				}
				if (this.c > 0.1 && this.down){
					this.c -= 0.1;
				} else if (this.down && this.c <= 0.1){
					this.down = false;
					this.c = 0.1;
				}
				this.tick = 0;
			} else {
				this.tick += 1;
			}
		},

		roundedRect: function(ctx, x, y, width, height, radius, fill){
			ctx.beginPath();
			ctx.moveTo(x + radius, y);
			ctx.lineTo(x + width - radius, y);
			ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
			ctx.lineTo(x + width, y + height - radius);
			ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
			ctx.lineTo(x + radius, y + height);
			ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
			ctx.lineTo(x, y + radius);
			ctx.quadraticCurveTo(x, y, x + radius, y);
			ctx.closePath();
			  //ctx.stroke();
			  if (fill) {
			  	ctx.fill();
			  } else {
			  	ctx.stroke();
			  }
			}

		});
});