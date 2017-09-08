ig.module(
	'game.entities.droppedTile'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityDroppedTile = ig.Entity.extend({
	zindex:1,
	size: {x: 16, y: 16},
	health: 100,
	//gravityFactor: 0,
	friction: {x: 100, y: 0},
	falling: false,
	tempHold: false,
	
	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.BOTH,
	collides: ig.Entity.COLLIDES.ACTIVE,
	
	crumbSound: new ig.Sound( 'media/sounds/crumble.ogg' ),
	crumbSound: new ig.Sound( 'media/sounds/crumble.mp3' ),
	animSheet: new ig.AnimationSheet( 'media/tiles2.png', 16, 16 ),
	
	init: function( x, y, settings ) {
		this.addAnim( 'one', 1, [0] );
		this.addAnim( 'two', 1, [1] );
		this.addAnim( 'three', 1, [2] );
		this.addAnim( 'four', 1, [3] );
		this.parent( x, y, settings );
		this.tile = settings.tile;
		this.EntID = ig.game.entities.length;
		this.changeImage();
		this.fallTime = new ig.Timer( 2 );
	},
	
	changeImage: function() {
		switch ( this.tile ){ // find index of biggest value in the array
			case 1:
				this.currentAnim = this.anims.one;
				break;
			case 2:
				this.currentAnim = this.anims.two;
				break;
			case 3:
				this.currentAnim = this.anims.three;
				break;
			case 4:
				this.currentAnim = this.anims.four;
				break;
		}
	},
	
	createTile: function () {
		ig.game.backgroundMaps[2].setTile( this.pos.x, this.pos.y, this.tile );
		ig.game.collisionMap.setTile( this.pos.x, this.pos.y, 1 );
	},
	
	update: function() {
		if (this.vel.y > 0){
			this.falling = true;
		}
		if (this.falling && this.vel.y <= 0 && !this.tempHold){
			this.createTile();
			this.kill();
		} else if (this.vel.y <= 0 && !this.tempHold && this.fallTime.delta() > 0){
			this.createTile();
			this.kill();
		}
		this.tempHold = false;
		this.parent();
	},
	
	collideWith: function( other, axis ) {
		if (other instanceof EntityDroppedTile && this.fallTime.delta() < 0){
			this.tempHold = true;
		} else {
			this.tempHold = false;
		}
	},
	
	check: function( other ) {
		if (other instanceof EntitySnake || other instanceof EntitySpike ||
		      other instanceof EntityPlayer){
			if (this.pos.y < other.pos.y - 10){
				other.receiveDamage( 30, this );
				if (other instanceof EntitySnake || other instanceof EntitySpike) {
					ig.game.playerController.score += 50;
				}
				for (var i = 0; i < 10; i++) {
				    ig.game.spawnEntity(EntityDeathParticle, other.pos.x, other.pos.y);
				}
			}
		}
	}

});


});