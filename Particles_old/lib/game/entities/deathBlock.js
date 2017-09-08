ig.module(
	'game.entities.deathBlock'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityDeathBlock = ig.Entity.extend({
	size: {x: 32, y: 32},
	_wmScalable: true,
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(255, 0, 0, 0.7)',
	zIndex: 0,
	gravityFactor: 0,
	
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.BOTH,
	
	update: function (){},
	
	check: function(other){
		if (!(other instanceof EntityAtom || other instanceof EntityBond ||
		      other instanceof EntityAtomizer || other instanceof EntityBlocks ||
		      other instanceof EntityBeam || other instanceof EntityDeathParticle)){
			for (var i = 0; i < 10; i++) {
				    ig.game.spawnEntity(EntityDeathParticle, other.pos.x, other.pos.y);
			}
			other.health = 0;
			other.kill();
			if (other instanceof EntityPlayerBlock){
				MyGame.activeBlocks -= 1;
				other.crumbSound.play();
			}
			if (other instanceof EntityPlayer){
				other.deathSound.play();
			}
		}
	}
	
});


});