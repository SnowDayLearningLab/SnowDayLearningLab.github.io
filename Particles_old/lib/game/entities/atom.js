ig.module(
	'game.entities.atom'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityAtom = ig.Entity.extend({
	gravityFactor: 0,
	bounciness: 1,
	atomNumb: null,
	size: {x: 60, y:60},
	offset: {x: 10, y: 10},
	fullsize: {x: 80, y: 80},
	relx: null,
	rely: null,
	zIndex: 18,
	active: false,
	start: false,
	end: false,
	loading: true,
	state: 'solo',
	partner: [],
	bonds: [],
	bondx: 0,
	bondy: 0,
	maxDrift: {x: 20, y: 20 }, // max amount atoms can drift when shaken
	friction: {x: 0, y: 0},
	pulled: false,
	
	type: ig.Entity.TYPE.A, // Player friendly group
	checkAgainst: ig.Entity.TYPE.A,

	animSheet: new ig.AnimationSheet( 'media/atom-sheet.png', 80, 80 ),
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.addAnim( 'idle', 1, [0] ); // "empty" slots for atoms
		this.addAnim( 'ball', 1, [1] ); // for ball and stick rep
		this.addAnim( 'glow', 1, [2] ); // rep for bonded highlighting
		this.atomizer = ig.game.getEntitiesByType (EntityAtomizer)[0];
		this.atomNumb = settings.numb;
		this.state = settings.state;
		this.relx = settings.relx;
		this.rely = settings.rely;
		this.initx = x;
		this.inity = y;
		this.partner = settings.partner;
		this.bonds = settings.bonds;
		
		this.minx = this.atomizer.pos.x;
		this.miny = this.atomizer.pos.y;
		this.maxx = this.atomizer.pos.x + (this.atomizer.size.x - 100 - this.fullsize.x);
		this.maxy = this.atomizer.pos.y + (this.atomizer.size.y - this.fullsize.y);
	},
	
	inBounds: function(){
		var mx = ig.input.mouse.x + ig.game.screen.x;
		var my = ig.input.mouse.y + ig.game.screen.y;
		return( (mx > this.minx && mx < this.maxx) && (my > this.miny && my < this.maxy));
	},
	
	update: function() {
		if (!MyGame.shake){
			this.vel.x = 0;
			this.vel.y = 0;
			this.accel.x = 0;
			this.accel.y = 0;
		}
		// atoms that are currently clicked but not bonded
		if (this.partner.length == 0 && this.state != "clicked"){
			this.state = "solo";
		// bonded atoms are always in a structure staet
		} else if (this.partner.length > 0){
			this.state = "structure";
		}
		if (this.state == "structure"){
			this.currentAnim = this.anims.glow;
		// clicked atoms show up but don't glow
		} else if (this.state =="clicked"){
			this.currentAnim = this.anims.ball;
		// "empty" visualization
		} else {
			this.currentAnim = this.anims.idle;
		}
		if (this.partner.length > 0 && MyGame.shake){
			this.springAction();
		}
		
		if (!(this.pos.x < this.maxx && this.pos.x > this.minx)){
			this.vel.x = this.vel.x * -1;
		}
		if (!(this.pos.y < this.maxy && this.pos.y > this.miny)){
			this.vel.y = this.vel.y * -1;
		}
		
		// restrict movement of atoms
		if (this.pos.x >= this.initx + this.maxDrift.x){
			this.vel.x = this.vel.x * -1;
			this.pos.x = this.initx + this.maxDrift.x - 1;
		}
		if (this.pos.x <= this.initx - this.maxDrift.x){
			this.vel.x = this.vel.x * -1;
			this.pos.x = this.initx - this.maxDrift.x + 1;
		}
		if (this.pos.y >= this.inity + this.maxDrift.y){
			this.vel.y = this.vel.y * -1;
			this.pos.y = this.inity + this.maxDrift.x - 1;
		}
		if (this.pos.y <= this.inity - this.maxDrift.y){
			this.vel.y = this.vel.y * -1;
			this.pos.y = this.inity - this.maxDrift.x + 1;
		}
		this.parent();		
	},
	
	handleMovementTrace: function( res ) {
		// Ignore static collisions
		this.pos.x += this.vel.x * ig.system.tick;
		this.pos.y += this.vel.y * ig.system.tick;
	},
	
	check: function (other) {
		if (other instanceof EntityAtom){
			//var othx = other.vel.x;
			//var othy = other.vel.y
			//other.vel.x = this.vel.x;
			//other.vel.y = this.vel.y;
			//this.vel.x = othx * -1;
			//this.vel.y = othy * -1;
			
			this.vel.x = this.vel.x * -1;
			this.vel.y = this.vel.y * -1;
			
			//if (!((this.vel.x > 0 && other.vel.x > 0) ||
			//    (this.vel.x < 0 && other.vel.x < 0))){
			//	this.vel.x = this.vel.x * -1;
			//}
			//if (!((this.vel.y > 0 && other.vel.y > 0) ||
			//    (this.vel.y < 0 && other.vel.y < 0))){
			//	this.vel.y = this.vel.y * -1;
			//}
			this.pos.x += this.vel.x * ig.system.tick;
			this.pos.y += this.vel.y * ig.system.tick;
		}
	},
	
	springAction: function(){
		for (var i=0; i<this.partner.length; i++){
			var end = this.partner[i];
			var dist1 = this.distanceTo(end);
			var ang1 = this.angleTo(end);
			
			//F = -k(|x|-d)(x/|x|) - bv
			var k = -100; // spring constant
			var b = 5; // dampening
			var d = 100; // ideal distance
			var d2 = d / Math.cos(ang1); // current distance
			var F1 = k * (dist1 - d); // force on end1
			
			end.accel.x = Math.cos(ang1) * F1 - b * end.vel.x;
			end.accel.y = Math.sin(ang1) * F1 - b * end.vel.y;
			
		}
	},
	
	makeBonds: function () {
		//var atoms = ig.game.getEntitiesByType (EntityAtom)
		for (var i=0; i<this.bonds.length; i++){
			var cB = this.bonds[i]
			if (cB.end1.atomNumb == this.atomNumb){
				cB.end1 = this;
				var bondName = (cB.end1.atomNumb + 'and' + cB.end2.atomNumb);
				var newBond = ig.game.spawnEntity(EntityBond, this.pos.x, this.pos.y, {id:bondName, heading:cB.angle, owner:cB.end1, connected:cB.end2})
				this.atomizer.bondArray.push (newBond);
				//this.state = "structure";
			}
		}
	},
	
	// Partner list is made up of killed atoms, so we need to match the atomNumb
	// of the dead atoms to the new living ones and then repopulate the partner list
	// to point to the living atoms
	findPartner: function(allAtoms){
		var newPart = [];
		//var allAtoms = ig.game.getEntitiesByType (EntityAtom)
		for (var i=0; i<this.partner.length; i++){
			var oldNumb = this.partner[i].atomNumb;
			for (var n=0; n<allAtoms.length; n++){
				if (allAtoms[n].atomNumb == oldNumb){
					newPart.push(allAtoms[n]);
					break;
				}
			}
		}
		this.partner = [];
		this.partner = newPart;
	},
	
	findBondTypes: function(){
		this.bondx = 0;
		this.bondy = 0;
		for (var i=0; i<this.bonds.length; i++){
			if (this.bonds[i].bondx == 1){
				this.bondx += 1;
			} else {
				this.bondy += 1;
			}
		}
	},

	draw: function(){
		this.parent();
	}

});

});