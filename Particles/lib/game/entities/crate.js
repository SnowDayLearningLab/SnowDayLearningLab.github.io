ig.module(
	'game.entities.crate'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityCrate = ig.Entity.extend({
	size: {x: 16, y: 16},
	zIndex: 1,
	friction: {x: 100, y: 0},
	bounciness: 0.1,
	entID: 0,
	
	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.B,
	collides: ig.Entity.COLLIDES.ACTIVE,
	
	animSheet: new ig.AnimationSheet( 'media/crate2.png', 16, 16),
	
	init: function( x, y, settings ) {
		this.addAnim( 'idle', 1, [0] );
		this.parent( x, y, settings );
		this.EntID = ig.game.entities.length;
	},
	
	check: function( other ) {
		other.receiveDamage( 10, this );
		for (var i = 0; i < 10; i++) {
		    ig.game.spawnEntity(EntityDeathParticle, other.pos.x, other.pos.y);
		}
		//this.kill();
	}
});


});