ig.module(
	'game.entities.portal'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityPortal = ig.Entity.extend({
	size: {x: 32, y: 32},
	zIndex: 1,
	gravityFactor: 0,
	//portalNum: 0,
	state: false,
	hidden: false,
	
	type: ig.Entity.TYPE.A,
	
	animSheet: new ig.AnimationSheet( 'media/portalsheet3.png', 32, 32),
	
	init: function( x, y, settings ) {
		this.addAnim( 'idle', 0.1, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23] );
		this.addAnim( 'active', 0.1, [24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47] );
		this.parent( x, y, settings );
	},
	
	update: function() {
		if (this.state){
			this.currentAnim = this.anims.active;
		} else {
			this.currentAnim = this.anims.idle;
		}
		if (!this.hidden){
			this.parent();
		}
	},
	draw: function() {
		if (!this.hidden){
			this.parent();
		}
	}
	
});


});