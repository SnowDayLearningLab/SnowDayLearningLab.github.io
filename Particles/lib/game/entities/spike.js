ig.module(
	'game.entities.spike'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
EntitySpike = ig.Entity.extend({
	size: {x: 28, y: 20},
	offset: {x: 1, y: 4},
	maxVel: {x: 100, y: 100},
	friction: {x: 150, y: 0},
	zIndex: 1,
	entID: 2,
	falling: false,
	
	type: ig.Entity.TYPE.B, // Evil enemy group
	checkAgainst: ig.Entity.TYPE.A, // Check against friendly
	collides: ig.Entity.COLLIDES.PASSIVE,
	
	health: 10,
	entID: 0,
	
	
	speed: 14,
	flip: false,
	
	animSheet: new ig.AnimationSheet( 'media/worm.png', 30, 24 ),
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.EntID = ig.game.entities.length;
		this.addAnim( 'crawl', 0.08, [0,1,2] );
	},
	
	
	update: function() {
		// near an edge? return!
		if (this.blockCheck() != null) {
			this.vel.x = 0;
		} else {
		if( this.standing && !ig.game.collisionMap.getTile(
				this.pos.x + (this.flip ? +4 : this.size.x -4),
				this.pos.y + this.size.y+1
			)
		) {

			this.flip = !this.flip;
		}
		
		var xdir = this.flip ? -1 : 1;
		this.vel.x = this.speed * xdir;
		}
		
		if (this.falling & this.vel.y == 0){
			for (var i = 0; i < 10; i++) {
			    ig.game.spawnEntity(EntityDeathParticle, this.pos.x, this.pos.y);
			}
			this.kill();
			ig.game.playerController.score += 50;
		}
		if (this.vel.y == 100 && !this.falling){
			this.falling = true
		}
		//check to be sure we're in "play mode"
		if (ig.game.game_mode != 2) {
			this.parent();
		}
		this.currentAnim.flip.x = this.flip;
	},
	
	blockCheck: function(){
		var blocks = ig.game.getEntitiesByType(EntityPlayerBlock);
		for (var i=0; i < blocks.length; i++){
			var blk = blocks[i];
			if (blk.pos.y >= this.pos.y + this.size.y && blk.pos.y <= this.pos.y + this.size.y + blk.size.y &&
			    blk.pos.x > this.pos.x - 20 && blk.pos.x < this.pos.x + 20){
				return blk;
			}
		}
		return null;
	},
	
	
	handleMovementTrace: function( res ) {
		this.parent( res );
		
		// collision with a wall? return!
		if( res.collision.x ) {
			this.flip = !this.flip;
		}
	},	
	
	check: function( other ) {
		if (other instanceof EntityPlayer && !other._killed && !other.recentlyHit){
			other.receiveDamage( 10, this );
			for (var i = 0; i < 5; i++) {
			    ig.game.spawnEntity(EntityDeathParticle, other.pos.x, other.pos.y);
			}
			other.pos.y -= 2;
			other.vel.y = -100;
			other.vel.x = this.flip ? -100 : 100;
			other.hitTimer = new ig.Timer(3);
			other.recentlyHit = true;
			//if (other.health <= 0){
			//	for (var i=0; i<5; i++){
			//		ig.game.spawnEntity (EntityParticle, other.x, other.y)
			//	}
			//}
		}
	}

});

});