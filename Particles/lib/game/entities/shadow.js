ig.module(
	'game.entities.shadow'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
EntityShadow = ig.Entity.extend({
	size: {x: 20, y:30},
	offset: {x: 6, y: 2},
	zIndex: 1,
	maxVel: {x: 200, y: 300},
	target: false,
	lastLoc: {x: 0, y: 0},
	friction: {x: 800, y: 0},
	falling: false,
	
	type: ig.Entity.TYPE.B, // Evil enemy group
	checkAgainst: ig.Entity.TYPE.A, // Check against friendly
	collides: ig.Entity.COLLIDES.PASSIVE,
	
	health: 30,
	state: 0, // 0=inactive, 1=active, 2=looking
	
	accelGround: 250,
	accelAir: 200,
	speed: 100,
	jump: 200,
	flip: false,
	
	animSheet: new ig.AnimationSheet( 'media/shadow.png', 32, 32 ),
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.EntID = ig.game.entities.length;
		this.addAnim( 'idle', 1, [0] );
		this.addAnim( 'run', 0.07, [0,1,2,3,4] );
		this.addAnim( 'jump', 1, [7] );
		this.addAnim( 'fall', 0.4, [5,6] );
	},
	
	
	update: function() {
		if (this.checkForPlayer() && this.state === 0) {
			this.target = ig.game.player;
			this.state = 1;
			this.lastLoc.x = this.target.pos.x;
			this.lastLoc.y = this.target.pos.y;
			this.closeDist();
		} else if (this.state === 0) {
			// near an edge? return!
			if( this.standing && !ig.game.collisionMap.getTile(
					this.pos.x + (this.flip ? +4 : this.size.x -4),
					this.pos.y + this.size.y+1
				)
			) {
	
				this.flip = !this.flip;
			}
			
			var xdir = this.flip ? -1 : 1;
			this.vel.x = this.speed * xdir;
		} else {
			this.state = 0;
			this.speed = 100;
		}
		
		if( this.state === 1 && this.standing &&
			
				(
				 ig.game.collisionMap.getTile(
					this.pos.x + (this.flip ? -4 : this.size.x +4),
					this.pos.y + 1) != 0 ||
				 ig.game.collisionMap.getTile(
					this.pos.x + (this.flip ? -4 : this.size.x +4),
					this.pos.y + this.size.y - 1) != 0
				)
			) {
			this.vel.y = -this.jump;
		}
		
		this.currentAnim.flip.x = this.flip;
		// set the current animation, based on the player's speed
		if( this.vel.y < 0 ) {
			this.currentAnim = this.anims.jump;
		}
		else if( this.vel.y > 0 ) {
			this.currentAnim = this.anims.fall;
		}
		else if( this.vel.x != 0 ) {
			this.currentAnim = this.anims.run;
		}
		else {
			this.currentAnim = this.anims.idle;
		}
		
		//check to be sure we're in "play mode"
		if (ig.game.game_mode != 2) {
			this.parent();
		}
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
	
	getDist: function(){
		// Get the x and y distance to the player
		var xd = (ig.game.player.pos.x + ig.game.player.size.x / 2) - (this.pos.x + this.size.x / 2);
		var yd = (ig.game.player.pos.y + ig.game.player.size.y / 2) - (this.pos.y + this.size.y / 2);
		
		// Calculate the distance
		this.distanceToPlayer = Math.sqrt(xd * xd + yd * yd);
		
		return [xd, yd];
	},
	
	checkForPlayer: function(){
		// Get the x and y distance to the player
		var dists = this.getDist();
		var xd = dists[0];
		var yd = dists[1];
		
		// Calculate the distance
		//this.distanceToPlayer = Math.sqrt(xd * xd + yd * yd);

		// Check if the enemy has a line of sight to the player
		if (this.distanceToPlayer < 200) {
		    var tr = ig.game.collisionMap.trace(this.pos.x, this.pos.y + this.size.y / 2 - 2, xd, yd, 1, 1);
		
		    if (!tr.collision.x && !tr.collision.y) {
			if ((ig.game.player.pos.x > this.pos.x && this.flip) ||
			    (ig.game.player.pos.x < this.pos.x && !this.flip)){
				this.flip = !this.flip;
			    }
				return true;
		    } else {
				return false;
		    }
		} else {
			return false;
		}
	},
	
	closeDist: function() {
		var dists = this.getDist();
		var xd = dists[0];
		var yd = dists[1];
		
		var xdir = this.flip ? -1 : 1;
		
		if (this.distanceToPlayer > 100) {
			this.speed = 170;
			this.vel.x = this.speed * xdir;
			if (!this.throwTime) {
				this.throwTime = new ig.Timer( 0.4 );
			}
			this.throwBlocks();
		} else if (this.distanceToPlayer < 90){
			this.vel.x = this.speed * -xdir;
			if (!this.throwTime) {
				this.throwTime = new ig.Timer( 0.4 );
			}
			this.throwBlocks();
		} else {
			this.vel.x = 0
			if (!this.throwTime) {
				this.throwTime = new ig.Timer( 0.4 );
			}
			this.throwBlocks();
		}
	},
	
	throwBlocks: function(){
		if (this.throwTime.delta() > 0){
			var mx = this.target.pos.x;
			var my = this.target.pos.y;
			if (my < this.pos.x) {
				ig.game.spawnEntity( EntityGrenade, this.pos.x, this.pos.y, {flip:true, block:5, mx:mx, my:my, thrower:"shadow"} );
			} else {
				ig.game.spawnEntity( EntityGrenade, this.pos.x, this.pos.y, {flip:false, block:5, mx:mx, my:my, thrower:"shadow"} );
			}
			delete this.throwTime;
		}
	},
	
	collideWith: function( other, axis ){
		if( other instanceof EntityPlayerBlock && axis == "y"){
			this.standing = true;
			this.vel.y = 0;
		}
	},
	
	
	handleMovementTrace: function( res ) {
		this.parent( res );
		
		// collision with a wall? return!
		if( res.collision.x ) {
			this.flip = !this.flip;
		}
		if (res.collision.y) {
			this.vel.y = 0;
			//code
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
		}
		if (other instanceof EntityPlayerBlock){
			if (this.state === 1) {
				this.vel.y = -this.jump;
			} else {
				this.flip = !this.flip;
			}
		}
	}

});

});