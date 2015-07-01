ig.module(
	'game.entities.tip'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityTip = ig.Entity.extend({
	size: {x: 100, y: 100},
	zIndex: 20,
	gravityFactor: 0,
	entID: 0,
	loc: false,
	
	//type: ig.Entity.TYPE.A,
	//checkAgainst: ig.Entity.TYPE.B,
	//collides: ig.Entity.COLLIDES.ACTIVE,
	
	animSheet: new ig.AnimationSheet( 'media/tips.png', 100, 100),
	
	init: function( x, y, settings ) {
		this.addAnim( '0', 1, [0] );
		this.addAnim( '1', 1, [1] );
		this.addAnim( '2', 1, [2] );
		this.addAnim( '3', 1, [3] );
		this.addAnim( '4', 1, [4] );
		this.parent( x, y, settings );
		this.frameNum = settings.frameNum;
		this.EntID = ig.game.entities.length;
		if (this.frameNum == 0){
			this.zIndex = 1;
		}
	},
	
	update: function (){
		this.currentAnim = this.anims[this.frameNum];
		// check to see if the player is in range to throw at the wall before showing the "tap here" tip
		if (this.loc === "wall" && this.frameNum === 4 && this.pos.x <= ig.game.player.pos.x + 150 - this.size.x){
			this.frameNum = 0;
		}
		// when the correct tutorial is active, unhide the tip for throwing the hard blocks
		if (ig.game.tutorial.flag[5] && this.loc === "hard"){
			this.frameNum = 0;
		}
	}
	
	//check: function( other ) {
	//	other.receiveDamage( 10, this );
	//	for (var i = 0; i < 10; i++) {
	//	    ig.game.spawnEntity(EntityDeathParticle, other.pos.x, other.pos.y);
	//	}
	//	//this.kill();
	//}
});


});