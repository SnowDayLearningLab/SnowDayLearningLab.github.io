ig.module(
	'game.entities.emerald'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityEmerald = ig.Entity.extend({
	size: {x: 32, y: 28},
	offset: {x: 0, y: 4},
	zIndex: 1,
	gravityFactor: 0,
	
	type: ig.Entity.TYPE.A,
	
	animSheet: new ig.AnimationSheet( 'media/emerald.png', 32, 32),
	
	init: function( x, y, settings ) {
		this.addAnim( 'idle', 0.1, [0,1,2,3] );
		this.parent( x, y, settings );
	},
	
	update: function() {
		this.parent();
	}
	
});


});