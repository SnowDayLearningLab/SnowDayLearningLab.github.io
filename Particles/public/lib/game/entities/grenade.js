ig.module(
	'game.entities.grenade'
)
.requires(
	'impact.entity',
    'impact.entity-pool'
)
.defines(function(){
EntityGrenade = ig.Entity.extend({
	size: {x: 8, y: 8},
	offset: {x: 4, y: 4},
	zIndex: 1,
	maxVel: {x: 1000, y: 1000},
	
	itemType: 1,
	armed: false,

	
	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.A,
	collides: ig.Entity.COLLIDES.PASSIVE,
		
	animSheet: new ig.AnimationSheet('media/grenades.png', 16, 16),
	
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.thrower = settings.thrower;
		this.itemType = settings.block;
		this.tx = settings.mx; // target x == mouse x
		this.ty = settings.my; // target y == mouse y
		this.vel.x = (this.tx - this.pos.x);
		this.vel.y = ((this.pos.y - this.ty) + 0.5 * ig.game.gravity) * -1;
		this.addAnim( 'green', 0.2, [0,1] );
		this.addAnim( 'blue', 0.2, [2,3] );
		this.addAnim( 'red', 0.2, [4,5] );
		this.addAnim( 'yellow', 0.2, [6,7] );
		this.setColor();
	},
	
	setColor: function(){
		switch (this.itemType) {
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
			default:
				this.currentAnim = this.anims.red;
				break;
		}
	},
	
	evalTiles: function(aB, x, y, preX, preY, collideAdj){
		var flipvalY = 1;
		var flipvalX = 1;
		var tileSize = 16;
		if (preY < 0){
			flipvalY = -1;
		}
		if (preX < 0){
			flipvalX = -1
		}
		var tileX = Math.floor(x / tileSize) * tileSize;
		var tileY = Math.floor(y / tileSize) * tileSize;
		if (ig.game.backgroundMaps[2].getTile( tileX, tileY) != 5){
			this.createBlocks(aB, tileX, tileY, flipvalX, flipvalY, collideAdj);
		} else {
			tileX -= (tileSize * flipvalX);
			tileY -= (tileSize * flipvalY);
			this.createBlocks(aB, tileX, tileY, flipvalX, flipvalY, collideAdj);
		}
	},
	
	createBlocks: function (aB, tileX, tileY, flipvalX, flipvalY, collideAdj){
		var x = 0;
		var y = 0;
		for (var i=0; i<4; i++){
			if (this.thrower === "player") {
				if (ig.game.backgroundMaps[2].getTile( tileX + x, tileY + y) != 5 && MyGame.availableBlocks > 0){
					ig.game.spawnEntity(EntityPlayerBlock, tileX + x, tileY + y, {nbond:aB.nbond, sbond:aB.sbond, dbond:aB.dbond, tbond:aB.tbond, qbond:aB.qbond, bounce:aB.bounce, slip:aB.slip, hardness:aB.hardness, totalBonds:aB.bonds, thrower: this.thrower})
					//ig.game.logArray[ig.game.blockInUse].made += 1;
					// for removing the first tip in level 1 --kill the tip
				}
			// thrower is "shadow"
			} else {
				// create red playerblock
				//if (ig.game.backgroundMaps[2].getTile( tileX + x, tileY + y) != 5){
				//	ig.game.spawnEntity(EntityPlayerBlock, tileX + x, tileY + y, {thrower: this.thrower})
				//}
				// create grey map block
				if (ig.game.backgroundMaps[2].getTile( tileX + x, tileY + y) != 5){
					ig.game.backgroundMaps[2].setTile( tileX + x, tileY + y, 1);
					ig.game.collisionMap.setTile( tileX + x, tileY + y, 1 );
				}
			}
			if (i == 0) {
				x += 16 * flipvalX;
			} else if (i == 1) {
				y += 16 * flipvalY * collideAdj;
			} else {
				x = 0;
			}
		}
	},
	
	collideWith: function (other, axis){
		if (other instanceof EntityPlayerBlock){
			var preX = this.vel.x;
			var preY = this.vel.y;
			var x = this.pos.x;
			var y = this.pos.y;
			var aB = null;
			if (this.thrower === "player") {
				var atomizer = ig.game.atomizer;
				var blocks = atomizer.blockArray;
				for (var i=0; i<blocks.length; i++){
					aB = blocks[i];
					if (aB.itemType == this.itemType){
						//active block, adjusted positions x & y, current x & y velocity, the tile type to set to
						this.evalTiles(aB, x, y, preX, preY, 1);
					}
				}
			} else {
				this.evalTiles(aB, x, y, preX, preY, 1);
			}
			this.kill();
		}
	},
	
	handleMovementTrace: function( res ) {
		var preX = this.vel.x;
		var preY = this.vel.y;
		this.parent( res );
		if (res.collision.x || res.collision.y) {
			this.beginBlock(preX, preY, 1);
			//if (this.thrower === "player") {
			//	var atomizer = ig.game.atomizer;
			//	var blocks = atomizer.blockArray;
			//	for (var i=0; i<blocks.length; i++){
			//		var aB = blocks[i];
			//		if (aB.itemType == this.itemType){
			//			//active block, current positions x & y, current x & y velocity, the tile type to set to
			//			if (Math.abs(this.pos.x - this.tx) < 20 && Math.abs(this.pos.y - this.ty) < 20 ){  // if close to target, use target location
			//				this.evalTiles(aB, this.tx, this.ty, preX, preY, 0);
			//			} else {
			//				this.evalTiles(aB, this.pos.x, this.pos.y, preX, preY, 0);
			//			}	
			//		}
			//	}
			//} else {
			//	var aB = null;
			//	if (Math.abs(this.pos.x - this.tx) < 20 && Math.abs(this.pos.y - this.ty) < 20 ){  // if close to target, use target location
			//		this.evalTiles(aB, this.tx, this.ty, preX, preY, 0);
			//	} else {
			//		this.evalTiles(aB, this.pos.x, this.pos.y, preX, preY, 0);
			//	}
			//}
			//this.kill();
		}
	},
	
	beginBlock:function(preX, preY, collideAdj){
		if (this.thrower === "player") {
			var atomizer = ig.game.atomizer;
			var blocks = atomizer.blockArray;
			for (var i=0; i<blocks.length; i++){
				var aB = blocks[i];
				if (aB.itemType == this.itemType){
					//active block, current positions x & y, current x & y velocity, adjust for colliding with player
					if (Math.abs(this.pos.x - this.tx) < 20 && Math.abs(this.pos.y - this.ty) < 20 ){  // if close to target, use target location
						this.evalTiles(aB, this.tx, this.ty, preX, preY, collideAdj);
					} else {
						this.evalTiles(aB, this.pos.x, this.pos.y, preX, preY, collideAdj);
					}	
				}
			}
		} else {
			var aB = null;
			this.evalTiles(aB, this.pos.x, this.pos.y, preX, preY, collideAdj);
		}
		this.kill();
	},
        
    reset: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.armed = false;
		this.itemType = settings.block;
		this.tx = settings.mx; // target x == mouse x
		this.ty = settings.my; // target y == mouse y
		this.vel.x = (this.tx - this.pos.x);
		this.vel.y = ((this.pos.y - this.ty) + 0.5 * ig.game.gravity) * -1;
		this.setColor();
	},
	
	update: function() {
		if (ig.game.game_mode == 1) {
			this.parent()
			
			if (!this.armed && this.thrower === "player" && !this.touches(ig.game.player)){
				this.armed = true;
			} else if (this.thrower === "shadow") {
				this.armed = true;
			}
			
		}
	},
	
	check: function(other) {
		if (other instanceof EntityPlayer && this.armed) {
			var preX = this.vel.x;
			var preY = this.vel.y;
			this.beginBlock(preX, preY, -1);
		}
	}
	
});

ig.EntityPool.enableFor( EntityGrenade );


});