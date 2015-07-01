ig.module(
	'game.entities.snake'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
EntitySnake = ig.Entity.extend({
	size: {x: 40, y: 32},
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
	spitting: false,
	adjust: 0,
	mover: 1,
	face: 0,
	
	animSheet: new ig.AnimationSheet( 'media/coilsnake2.png', 40, 32 ),
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.EntID = ig.game.entities.length;
		if (this.face == 1){this.flip = true};  // face left if face = 1
		this.addAnim( 'crawl', 0.2, [0,1,2,3,2,1] );
		this.addAnim( 'spit', 1, [5])
	},
	
	
	update: function() {
		if (this.checkForPlayer()){
			var beamAngle = this.angleTo(ig.game.player);
			ig.game.spawnEntity( EntityBeam, (this.pos.x + this.adjust), (this.pos.y + 5), {flip:this.flip, angle:beamAngle} );
		}
		if (this.mover == 1){ // only move if mover set to 1
			// near an edge? return!
			if( !ig.game.collisionMap.getTile(
					this.pos.x + (this.flip ? +4 : this.size.x -4),
					this.pos.y + this.size.y+1
				)
			) {
				this.flip = !this.flip;
			}
			
			var xdir = this.flip ? -1 : 1;
			if (!this.spitting){
				this.vel.x = this.speed * xdir;
			}
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
	
	checkForPlayer: function(){
		// Get the x and y distance to the player
		var xd = (ig.game.player.pos.x + ig.game.player.size.x / 2) - (this.pos.x + this.size.x / 2);
		var yd = (ig.game.player.pos.y + ig.game.player.size.y / 2) - (this.pos.y + this.size.y / 2);

		// Calculate the distance
		this.distanceToPlayer = Math.sqrt(xd * xd + yd * yd);

		// Check if the enemy has a line of sight to the player
		if (this.distanceToPlayer < 150) {
		    var tr = ig.game.collisionMap.trace(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, xd, yd, 1, 1);
		
		    if (!tr.collision.x && !tr.collision.y) {
			if ((ig.game.player.pos.x > this.pos.x && this.flip) ||
			    (ig.game.player.pos.x < this.pos.x && !this.flip)){
				this.flip = !this.flip;
			    }
			if (!this.flip){
				this.adjust = 30;
			} else {
				this.adjust = 0;
			}
			this.currentAnim = this.anims.spit;
			this.spitting = true;
			return true;
		    } else {
			this.currentAnim = this.anims.crawl;
			this.spitting = false;
			return false;
		    }
		} else {
			this.currentAnim = this.anims.crawl;
			this.spitting = false;
			return false;
		}
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

EntityBeam = ig.Entity.extend({
	size: {x: 8, y: 8},
	offset: {x: 4, y: 4},
	zIndex: 1,
	maxVel: {x: 500, y: 500},
	gravityFactor: 0,
	
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.A, // Check Against A - the good guys
	collides: ig.Entity.COLLIDES.PASSIVE,
		
	animSheet: new ig.AnimationSheet( 'media/projectile2.png', 16, 16 ),
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.flip = settings.flip;
		this.angle = settings.angle
		var vx = Math.cos(this.angle) * 500
		var vy = Math.sin(this.angle) * 500
		this.vel.x = vx; //(this.flip ? -vx : vx);
		this.vel.y = vy;
		this.addAnim( 'idle', 0.1, [0] );
		this.addAnim( 'collide', 0.1, [1,2,3,4,5,6], true)
	},
	
	stopBeam: function(){
		this.currentAnim = this.anims.collide;
		this.vel.x = 0;
		this.vel.y = 0;
		//if (this.anims.collide.loopCount >= 1){
		//	this.kill();
		//}
	},
	
	update: function() {
		if (this.anims.collide.loopCount >= 1){
			this.kill();
		}
		this.currentAnim.flip.x = this.flip;
		this.currentAnim.angle = this.angle;
		this.parent();
		
	},
	
	handleMovementTrace: function( res ) {
		this.parent( res );
		if ( res.collision.x || res.collision.y ) {
			this.stopBeam();
			//this.currentAnim = this.anims.collide;
		}
	},
	
	// This function is called when this entity overlaps anonther entity of the
	// checkAgainst group. I.e. for this entity, all entities in the B group.
	check: function( other ) {
		if (other instanceof EntityPlayer && !other._killed && !other.recentlyHit){
			other.receiveDamage( 30, this );
			MyGame.snakeDeath = true;
			for (var i = 0; i < 5; i++) {
				ig.game.spawnEntity(EntityDeathParticle, other.pos.x, other.pos.y);
			}
			other.pos.y -= 2;
			other.vel.y = -100;
			other.vel.x = this.flip ? -100 : 100;
			other.hitTimer = new ig.Timer(3);
			other.recentlyHit = true;
			this.stopBeam();
			//this.kill();
		}
		if (other instanceof EntityPlayerBlock){
			if (other.hardness < 0.6){
				other.receiveDamage( 30, this );
				for (var i = 0; i < 5; i++) {
					ig.game.spawnEntity(EntityDeathParticle, other.pos.x, other.pos.y);
				}
				if (other.health <= 0) {
					MyGame.activeBlocks -= 1;
				}
			}
			this.stopBeam()
			//this.kill();
		}
	}	
});

});