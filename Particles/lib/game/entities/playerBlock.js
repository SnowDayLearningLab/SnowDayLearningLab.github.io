ig.module(
	'game.entities.playerBlock'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){

EntityPlayerBlock = ig.Entity.extend({
	zindex:1,
	size: {x: 16, y: 16},
	health: 100,
	gravityFactor: 0,
	bondx: 0,
	bondy: 0,
	friction: {x: 50, y: 100},
	crumbTime: 0,
	slip: 0,
	bounce: 0,
	hardness: 0,
	crumble: 0,
	entID: 0,
	nbond: 0, //no bond
	sbond: 0, //single - bound to one other atom
	dbond: 0, //double
	tbond: 0, //triple
	qbond: 0, //quadruple
	
	
	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.A,
	collides: ig.Entity.COLLIDES.FIXED,
	
	crumbSound: new ig.Sound( 'media/sounds/crumble.ogg' ),
	crumbSound: new ig.Sound( 'media/sounds/crumble.mp3' ),
	animSheet: new ig.AnimationSheet( 'media/block_tiles.png', 16, 16 ),
	
	init: function( x, y, settings ) {
		this.addAnim( 'green', 1, [0] );
		this.addAnim( 'blue', 1, [1] );
		this.addAnim( 'red', 1, [2] );
		this.addAnim( 'yellow', 1, [3] );
		this.parent( x, y, settings );
		this.thrower = settings.thrower;
		this.initProps(settings);
		this.EntID = ig.game.entities.length;
		
		//console.log('total: ' + (this.bondx + this.bondy))
		//console.log('quad: ' + this.qp + ' triple: ' + this.tp +
		//	    ' double: ' + this.dp + ' single: ' + this.sp + ' none: ' + this.np)
	},

	initProps: function(settings){
		if (this.thrower === "player") {
			this.bondx = settings.bondx;
			this.bondy = settings.bondy;
			this.nbond = settings.nbond;
			this.sbond = settings.sbond;
			this.dbond = settings.dbond;
			this.tbond = settings.tbond;
			this.qbond = settings.qbond;
			this.bounce = settings.bounce;
			this.slip = settings.slip;
			this.hardness = settings.hardness;
			this.totalBonds = settings.totalBonds;
			this.crumbTime = 0;
			if (this.hardness < 28) {
				this.crumbTime = new ig.Timer( (this.hardness * 2 / 10) + 2);
			}
			this.changeImage();
			MyGame.availableBlocks -= 1;
			if (ig.game.myDirector.currentLevel === 1){
				var tips = ig.game.getEntitiesByType (EntityTip)
				if (tips.length > 0){
					for (var i=0;i<tips.length;i++){
						if (this.touches(tips[i])){
							if (tips[i].loc === "wall"){
								tips[i].kill();
								// hide the tutorial and set flags
								ig.game.tutorial.flag[0] = false;
								ig.game.tutorial.hidden = true;
								ig.game.tutorial.wallflag = true; // set a flag in case this happened early
							} else if (tips[i].loc === "hard" && ig.game.tutorial.flag[5]){
								tips[i].kill();
								ig.game.tutorial.flag[5] = false;
								ig.game.tutorial.hidden = true;
							}

						}
					}
				}
			}
		} else {
			this.crumbTime = new ig.Timer(5);
			this.currentAnim = this.anims.red;
		}
	},
	
	changeImage: function() {
		switch ( ig.game.playerController.item){ // find out which item we're set to
			case 1:
				this.currentAnim = this.anims.green;
				break;
			case 2:
				this.currentAnim = this.anims.blue;
				break;
			case 3:
				this.currentAnim = this.anims.red;
				break;
			case 4:
				this.currentAnim = this.anims.yellow;
				break;
		}
	},
	
	removeTiles: function () {
		if (ig.game.backgroundMaps[2].getTile( this.pos.x, this.pos.y ) != 0 && ig.game.backgroundMaps[2].getTile( this.pos.x, this.pos.y ) != 5){
			ig.game.backgroundMaps[2].setTile( this.pos.x, this.pos.y, 0 );
			ig.game.collisionMap.setTile( this.pos.x, this.pos.y, 0 );
			ig.game.levelLog.tilesRemoved += 1;
		}
	},
	
	dropTile: function () {
		var tileNum = ig.game.backgroundMaps[2].getTile(this.pos.x, this.pos.y);
		if (tileNum != 0){
			ig.game.spawnEntity(EntityDroppedTile, this.pos.x, this.pos.y, {tile:tileNum});
		}
		this.removeTiles();
	},
	
	check: function (other) {
		if (other instanceof EntityPlayerBlock){
			if (this.EntID < other.EntID){
				this.kill();
				if (this.thrower === "player") {
					MyGame.availableBlocks += 1;
				}
			}
		}
	},
	
	drawBounce: function (){
		var ctx = ig.system.context;
		var xpos = ig.system.getDrawPos(this.pos.x - ig.game.screen.x);
		var ypos = ig.system.getDrawPos(this.pos.y - ig.game.screen.y);
		ctx.fillStyle = "#CCC";  //some color
		ctx.beginPath();
		ctx.moveTo(xpos, ypos);
		ctx.arcTo(xpos + this.size.x/2, ypos - 10, xpos + this.size.x, ypos, 10);
		ctx.arcTo(xpos + this.size.x + 10, ypos + this.size.y/2, xpos + this.size.x, ypos + this.size.y, 10);
		ctx.arcTo(xpos + this.size.x/2, ypos + this.size.y + 10, xpos, ypos + this.size.y, 10);
		ctx.arcTo(xpos - 10, ypos + this.size.y/2, xpos, ypos, 10);
		ctx.closePath();
		ctx.fill();
        },
	
	drawHard: function (){
		var ctx = ig.system.context;
		var xpos = ig.system.getDrawPos(this.pos.x - ig.game.screen.x);
		var ypos = ig.system.getDrawPos(this.pos.y - ig.game.screen.y);
		ctx.fillStyle = "#CCC";  //some color
		ctx.fillRect(xpos-2, ypos-2, this.size.x+4, this.size.y+4);	
	},
	drawSlip: function (){
		var ctx = ig.system.context;
		ctx.fillStyle = "#CCC";  //some color
		var xpos = ig.system.getDrawPos(this.pos.x - ig.game.screen.x) + 1;
		var ypos = ig.system.getDrawPos(this.pos.y - ig.game.screen.y) - 6;
		var xadj = 0;
		var yadj = 0;
		var rad = 5;
		for (var i=0; i<9; i++){
			if (i%3==0){
				yadj += rad * 2 - 3;
				xadj = 0;
			}
			ctx.beginPath();
			ctx.arc( xpos+xadj, ypos+yadj, rad * ig.system.scale, 0, Math.PI * 2 );
			ctx.closePath();
			ctx.fill();
			xadj += rad * 2 - 3;
		}
	},
	
	drawStructure: function (){
//		if (this.totalBonds >= 15) {
			if (this.hardness >= 28){
				this.drawHard();
			} else if (this.bounce >= 30){
				this.drawBounce();
			} else if (this.slip >= 27){
				this.drawSlip();
			}
//		}
		
	},
	
	update: function() {
		if (this.crumbTime){
			if (this.crumbTime.delta() > 0){
				this.crumbSound.play();
				if (this.slip < 27){
					this.removeTiles();
				} else {
					this.dropTile();
				}
				for (var i = 0; i < 8; i++) {
				    ig.game.spawnEntity(EntityDeathParticle, this.pos.x, this.pos.y);
				}
				this.kill();
				if (this.thrower === "player") {
					MyGame.availableBlocks += 1;
				}
			}
		}
		this.parent();
	},

	reset: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.thrower = settings.thrower;
		this.initProps(settings);
	}

});

ig.EntityPool.enableFor( EntityPlayerBlock );


});