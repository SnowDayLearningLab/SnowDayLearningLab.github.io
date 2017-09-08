ig.module(
	'game.entities.blocks'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityBlocks = ig.Entity.extend({
	gravityFactor: 0,
	size: {x: 75, y:75},
	zIndex: 20,
	relx: null,
	rely: null,
	active: false,
	bomb: 0,
	atomArray: [],
	bondEncode: [],
	bonds: 0,
	bondx: 0,
	bondy: 0,
	nbond: 0, //no bond
	sbond: 0, //single bond - total number of singley bound atoms
	dbond: 0,
	tbond: 0,
	qbond: 0,
	
	//type: ig.Entity.TYPE.A, // Player friendly group
	//checkAgainst: ig.Entity.TYPE.A,
	//collides: ig.Entity.COLLIDES.FIXED,
	
	bound: false,
	bounce: 0,
	slip: 0,
	hardness: 0,
	bounceBar: '',
	slipBar: '',
	hardnessBar: '',

	init: function( x, y, settings ) {
		this.animSheet = new ig.AnimationSheet(settings.path, 75, 75);
		//this.bomb = settings.bomb;
		this.active = settings.active;
		this.atomArray = settings.atomArray;
		this.relx = settings.relx;
		this.rely = settings.rely;
		this.nbond = settings.nbond;
		this.sbond = settings.sbond;
		this.dbond = settings.dbond;
		this.tbond = settings.tbond;
		this.qbond = settings.qbond;
		this.parent( x, y, settings );
		this.addAnim( 'idle', 1, [0] );
		this.addAnim( 'selected', 1, [1] );
	},
	
	setProperties: function(caller){
		this.bonds = ig.game.getEntitiesByType (EntityBond).length;
		var slipprop = 0;
		var bounceprop = 0;
		var hardnessprop = 0;

		if (this.tbond < 16 && this.tbond > 3 && this.bonds > 14) {
			bounceprop = (this.sbond * 0) + (this.dbond * 2) + (this.tbond * 2.5) + (this.qbond * -2);
			if (bounceprop<0){ bounceprop = 0 };
		}
		hardnessprop = (this.sbond * .5) + (this.dbond * 1) + (this.tbond * 2) + (this.qbond * 3);
		if (hardnessprop<0){ hardnessprop = 0 };
		slipprop = (this.sbond * .5) + (this.dbond * 2) + (this.tbond * 0) + (this.qbond * -2);
		if (slipprop<0){ slipprop = 0 };

		var total = slipprop + bounceprop + hardnessprop;
		if (this.bonds > 9){
			this.slip = (slipprop / total)*10;
			this.bounce = (bounceprop / total)*10;
			this.hardness = (hardnessprop / total)*10;
			if (this.hardness >6 && this.bonds > 31){
				this.slip = 0;
				this.bounce = 0;
				this.hardness = 10;
			}
			if (this.slip > 6 && this.bonds >= 20){
				this.slip = 10;
			}
			if (this.bounce > 4 && this.bounce > this.hardness && this.bonds >= 24){
				this.bounce += 3;
			}
		}
		else {
			this.slip = 0;
			this.bounce = 0;
			this.hardness = 0;
		}
		switch (caller) {
			case "test":
				ig.game.logAtomizerEvent("test", this);
				break;
			case "load":
				ig.game.logAtomizerEvent("loadAtoms", this);
				break;
			case "close":
				ig.game.logAtomizerEvent("unloadAtoms", this);
				break;
			// case "clickBlock":
			// 	ig.game.logAtomizerEvent("switchBlock", this);
			// 	break;
			default:
				//do nuthin'
		}
		this.slipBar = this.buildbar(this.slip);
		this.bounceBar = this.buildbar(this.bounce);
		this.hardnessBar = this.buildbar(this.hardness);
		if (this.bounce > 4) {
			MyGame.bounceMade = true;
		}
	},
	
	buildbar: function(perc) {
		var blank ='';
		for (i=0; i< (Math.floor(10-perc)); i++){
			blank = blank.concat(' '+'\n');
		}
		var stringBar = blank;
		for (i = 0; i < (Math.ceil(perc)); i++){
			//stringBar = stringBar.concat("X");
			stringBar = stringBar.concat('X'+'\n');
		}
		return stringBar;
	},

	update: function() {
		if (this.active){
			this.currentAnim = this.anims.selected;
			this.bonds = ig.game.getEntitiesByType (EntityBond).length;
		} else {
			this.currentAnim = this.anims.idle;
		}
		this.parent();
	},
	
	draw: function(){
		this.parent();
		if (!ig.game.atomizer.hidden && this.active){
			//draw the little arrow pointing to active block
			var posx = ig.system.getDrawPos(this.pos.x - ig.game.screen.x - 40);
			var posy = ig.system.getDrawPos(this.pos.y - ig.game.screen.y);
			var arrow = new ig.Image('media/atomizer_arrow'+this.itemType+'.png');
			var iconHard = new ig.Image('media/icon_hard.png');
			var iconBounce = new ig.Image('media/icon_bounce.png');
			var iconSlip = new ig.Image('media/icon_slip.png');
			arrow.draw(posx, posy);

			var letx = 620;
			var lety = 460;
			// Display block property information
			iconHard.draw(letx+120, lety+70);
			ig.game.font.draw(this.hardnessBar, letx+128, lety+70-(ig.game.font.heightForString(this.hardnessBar)), ig.Font.ALIGN.LEFT);
			iconBounce.draw(letx+155, lety+70);
			ig.game.font.draw(this.bounceBar, letx+163, lety+70-(ig.game.font.heightForString(this.bounceBar)), ig.Font.ALIGN.LEFT);
			iconSlip.draw(letx+190, lety+70);
			ig.game.font.draw(this.slipBar, letx+198, lety+70-(ig.game.font.heightForString(this.slipBar)), ig.Font.ALIGN.LEFT);
			// ig.game.font.draw('qbond: '+this.qbond, posx+225, posy-80, ig.Font.ALIGN.RIGHT);
			// ig.game.font.draw('tbond: '+this.tbond, posx+225, posy-60, ig.Font.ALIGN.RIGHT);
			// ig.game.font.draw('dbond: '+this.dbond, posx+225, posy-40, ig.Font.ALIGN.RIGHT);
			// ig.game.font.draw('sbond: '+this.sbond, posx+225, posy-20, ig.Font.ALIGN.RIGHT);

			//draw structure overlay
			var cvs = document.getElementById('canvasD');
			var ctx = cvs.getContext('2d');
			var igctx = ig.system.context;
			var xloc = ig.system.getDrawPos(this.pos.x - ig.game.screen.x);
			var yloc = ig.system.getDrawPos(this.pos.y - ig.game.screen.y);
			var structImage = new ig.Image();
			if (!structImage.failed){
				for (var i=0;i<4;i++){
					var xadjust, yadjust;
					switch (i){
						case 0:
							xadjust = 0;
							yadjust = 0;
							break;
						case 1:
							xadjust = 38;
							yadjust = 0;
							break;
						case 2:
							xadjust = 0;
							yadjust = 38;
							break;
						case 3:
							xadjust = 38;
							yadjust = 38;
							break;
					}
					structImage.draw(xloc + xadjust, yloc + yadjust);
				}
				
			}
			structImage.data.src = cvs.toDataURL("image/png");
		}
	}

});

});