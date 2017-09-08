ig.module(
	'game.entities.gate'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityGate = ig.Entity.extend({
	size: {x: 32, y: 32},
	zIndex: 1,
	gravityFactor: 0,
	//portalNum: 0,
	state: false,
	
	type: ig.Entity.TYPE.A,
	
	animSheet: new ig.AnimationSheet( 'media/gatesheet.png', 32, 32),
	
	init: function( x, y, settings ) {
		this.addAnim( 'idle', 0.1, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23] );
		this.parent( x, y, settings );
	},
	
	update: function() {
		//if (this.state){
		//	this.currentAnim = this.anims.active;
		//} else {
			this.currentAnim = this.anims.idle;
		//}
		this.parent();
	}
	
});


});