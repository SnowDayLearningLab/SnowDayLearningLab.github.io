ig.module(
	'game.entities.pokePoint'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityPokePoint = ig.Entity.extend({
	size: {x: 1, y: 1},
	zIndex: 16,
	gravityFactor: 0,
	
	type: ig.Entity.TYPE.A,
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
	},
	
	draw: function(){
		this.parent();
		var ctx = ig.system.context;
		ctx.fillStyle = "rgba(255,255,255,.01)";  //some color
		ctx.beginPath();
		ctx.arc( ig.system.getDrawPos( this.pos.x - ig.game.screen.x ),
                    ig.system.getDrawPos( this.pos.y - ig.game.screen.y ),
                    150,
                    0, Math.PI * 2 );
		ctx.closePath();
		ctx.fill();
	},
	
	update: function() {
		this.parent();
	}
	
});


});