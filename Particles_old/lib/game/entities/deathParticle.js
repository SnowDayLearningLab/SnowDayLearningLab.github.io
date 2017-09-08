ig.module(
	'game.entities.deathParticle'
)
.requires(
	'impact.entity',
	'impact.entity-pool',
        'game.entities.particle'
)
.defines(function(){
    
EntityDeathParticle = EntityParticle.extend({
        lifetime: 1.0,
        fadetime: 1.0,
        vel: {
            x: 60,
            y: 60
        },
        animSheet: new ig.AnimationSheet('media/debris.png', 8, 8),
        init: function (x, y, settings) {
            this.addAnim( 'idle', 5, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14] );
            this.parent(x, y, settings);
        },
        draw: function () {
            //ig.system.context.globalCompositeOperation = 'lighter';
            this.parent();
            //ig.system.context.globalCompositeOperation = 'source-over';
        },
        update: function () {
            this.currentAnim.angle += 0.1 * ig.system.tick;
            this.parent();
        }
    });

});