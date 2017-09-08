ig.module(
	'game.entities.heart'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityHeart = ig.Entity.extend({
	size: {x: 35, y: 32},
	zIndex: 1,
	gravityFactor: 0,
	
	type: ig.Entity.TYPE.A,
	
	animSheet: new ig.AnimationSheet( 'media/heart1.png', 35, 32),
	
	init: function( x, y, settings ) {
		this.addAnim( 'idle', 0.1, [0] );
		this.parent( x, y, settings );
	},
	
	update: function() {
		this.parent();
	}
	
});


});