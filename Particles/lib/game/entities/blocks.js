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
	
	setProperties: function(){
		this.slip = (this.dbond * 3) + (this.tbond * -2) + (this.qbond * -3);
		this.bounce = (this.dbond * 1) + (this.tbond * 3) + (this.qbond * 1);
		this.hardness = (this.dbond * 1) + (this.tbond * 1) + (this.qbond * 3);
		
		if (this.hardness >= 28) { // hard blocks have no bounce
			this.bounce = 0;
		}
		
	},
	
	update: function() {
		if (this.active){
			this.currentAnim = this.anims.selected;
			var bonds = ig.game.getEntitiesByType (EntityBond);
			this.bonds = bonds.length;
		} else {
			this.currentAnim = this.anims.idle;
		}
		this.parent();
	},
	
	draw: function(){
		this.parent();
		if (!ig.game.atomizer.hidden && this.active){
			var posx = ig.system.getDrawPos(this.pos.x - ig.game.screen.x - 40);
			var posy = ig.system.getDrawPos(this.pos.y - ig.game.screen.y);
			var arrow = new ig.Image('media/atomizer_arrow'+this.itemType+'.png');
			arrow.draw(posx, posy);

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