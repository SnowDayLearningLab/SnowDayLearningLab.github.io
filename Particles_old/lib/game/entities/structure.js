ig.module(
	'game.entities.structure'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityStructure = ig.Entity.extend({
	size: {x: 500, y: 500},
	zIndex: 30,
	gravityFactor: 0,
	entID: 0,
	finSize: {x: 0, y: 0},
	
	//type: ig.Entity.TYPE.A,
	//checkAgainst: ig.Entity.TYPE.B,
	//collides: ig.Entity.COLLIDES.NEVER,
	
	//animSheet: new ig.AnimationSheet( 'media/tips.png', 100, 100),
	animSheet: null,
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.EntID = ig.game.entities.length;
		this.animSheet = new ig.AnimationSheet(settings.animFrame, 500, 500);
		this.addAnim( 'idle', 1, [0] ); // "empty" slots for atoms
		this.targetBlock = settings.Tblock;
		this.theta = this.angleTo(this.targetBlock);
		this.fullDist = this.distanceTo(this.targetBlock);
		this.dist = this.fullDist;
		this.finSize.x = this.targetBlock.size.x / 2;
		this.finSize.y = this.targetBlock.size.y / 2;
	},
	
	update: function (){
		this.parent();
		this.currentAnim = this.anims.idle;
		this.vel.y = Math.sin(this.theta) * 200;
		this.vel.x = Math.cos(this.theta) * 200;
		this.dist = this.distanceTo(this.targetBlock);
		this.size.x = this.size.x * (this.dist / this.fullDist);
		this.size.y = this.size.y * (this.dist / this.fullDist);
		//this.vel.x = 1;
		
	},
	
	handleMovementTrace: function( res ) {
		// This completely ignores the trace result (res) and always
		// moves the entity according to its velocity
		this.pos.x += this.vel.x * ig.system.tick;
		this.pos.y += this.vel.y * ig.system.tick;
	},
	
	draw: function(){
		this.parent()
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