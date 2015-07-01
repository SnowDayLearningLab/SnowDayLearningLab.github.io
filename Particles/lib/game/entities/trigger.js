ig.module(
	'game.entities.trigger'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityTrigger = ig.Entity.extend({
	size: {x: 16, y: 16},
	
	_wmScalable: true,
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(196, 255, 0, 0.7)',
	
	target: null,
	wait: -1,
	waitTimer: null,
	canFire: true,
	
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.A,
	collides: ig.Entity.COLLIDES.NEVER,
	
	
	init: function( x, y, settings ) {
		if( settings.checks ) {
			this.checkAgainst = ig.Entity.TYPE[settings.checks.toUpperCase()] || ig.Entity.TYPE.A;
			delete settings.check;
		}
		
		this.parent( x, y, settings );
		this.waitTimer = new ig.Timer();
	},
	
	
	check: function( other ) {
		if (other instanceof EntityPlayer){
			if( this.canFire && this.waitTimer.delta() >= 0 ) {
				if (this.num != 10){  // if not special trigger (dieing from the snake) fire off tutorial
					if( typeof(this.target) == 'object' ) {
						for( var t in this.target ) {
							var ent = ig.game.getEntityByName( this.target[t] );
							if( ent && typeof(ent.triggeredBy) == 'function' ) {
								ent.triggeredBy( other, this );
							}
						}
					}
					
					if( this.wait == -1 ) {
						this.canFire = false;
					}
					else {
						this.waitTimer.set( this.wait );
					}
				} else if (MyGame.snakeDeath){   // if you've died from the snake, fire off number 10
					if( typeof(this.target) == 'object' ) {
						for( var t in this.target ) {
							var ent = ig.game.getEntityByName( this.target[t] );
							if( ent && typeof(ent.triggeredBy) == 'function' ) {
								ent.triggeredBy( other, this );
							}
						}
					}
					
					if( this.wait == -1 ) {
						this.canFire = false;
					}
					else {
						this.waitTimer.set( this.wait );
					}
				}
			}
		}
	},
	
	
	update: function(){}
});

});