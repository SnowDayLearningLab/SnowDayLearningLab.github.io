ig.module(
	'game.entities.bond'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityBond = ig.Entity.extend({
	gravityFactor: 0,
	size: {x: 60, y:60},
	offset: {x: 10, y: 10},
	fullsize: {x: 80, y: 80},
	zIndex: 17,
        animSheet: new ig.AnimationSheet( 'media/bond_sheet2.png', 80, 80 ),
	angle:0,
	end1:null,
	end2:null,
	bondName:null,
	bondx:0,
	bondy:0,
	fixed:false,
	state: "solo",
	center: {x: 0, y:0},
	
	//type: ig.Entity.TYPE.A, // Player friendly group
	//checkAgainst: ig.Entity.TYPE.A,
	//collides: ig.Entity.COLLIDES.NEVER,
        
        init: function(x, y, settings) {
			this.parent(x,y,settings);
			//this.addAnim( 'cloud', 1, [0] );
			this.addAnim( 'stick', 1, [1] );
			this.addAnim( 'glow', 1, [2] );
			this.atomizer = ig.game.getEntitiesByType (EntityAtomizer)[0];
			this.angle = settings.heading;
			this.currentAnim.angle = this.angle;
			this.end1 = settings.owner;
			this.end2 = settings.connected;
			this.bondName = settings.id;
			this.currentAnim = this.anims.stick;
			this.zIndex = 17; // put under atom
			ig.game.sortEntitiesDeferred();
			this.updateStructure();
			if(ig.game.bondsPresent == false){
				ig.game.bondsPresent = true;
			}
			this.center.x = this.pos.x + this.size.x / 2;
			this.center.y = this.pos.y + this.size.y / 2;
        },
 
        update: function() {
			var atoms = ig.game.getEntitiesByType (EntityAtom)
			
			// Reset ends after being reloaded
			if (atoms.length == 25 && !this.fixed){
				for (var i=0; i<atoms.length; i++){
					if (atoms[i].atomNumb == this.end1.atomNumb) {
						this.end1 = atoms[i];
					}
					if (atoms[i].atomNumb == this.end2.atomNumb) {
						this.end2 = atoms[i];
					}
				}
				this.fixed = true;
			}
			
			this.checkAngle();
			this.checkBondType(); // maybe still do this?
			this.checkForDeath();
			if (this.state == "structure"){
				this.currentAnim = this.anims.glow;
			} else {
				this.currentAnim = this.anims.stick;
			}
			this.parent();
        },
	
		checkAngle: function() {
			var dist = this.end1.distanceTo (this.end2) - this.end1.fullsize.x/2 - 10;
			var newAngle = this.end1.angleTo (this.end2);
			this.pos.x = this.end1.pos.x + Math.cos(newAngle) * dist;
			this.pos.y = this.end1.pos.y + Math.sin(newAngle) * dist;
			this.angle = newAngle
			this.currentAnim.angle = this.angle;
		},
		
		checkBondType: function() {
			if (this.angle < (-Math.PI/6) && this.angle > (-5*Math.PI/6) ||
			    this.angle > (Math.PI/6) && this.angle < (5*Math.PI/6)) {
				this.bondx = 0;
				this.bondy = 1;
			} else {
				this.bondy = 0;
				this.bondx = 1;
			}
		},
		
		checkForDeath: function(){
			var dead = true;
			for (var i=0; i < this.end1.bonds.length; i++){
				if (this.end1.bonds[i].bondName == this.bondName){
					dead = false;
				}
			}
			
			if (dead){
				this.kill()
			}
		},
		
		updateStructure: function(){
			this.state = "structure";
			this.end1.state = "structure";
			this.end2.state = "structure";
		},
		
		drawStruct: function (atom1, atom2){
			var cvs = document.getElementById("canvasD");
			var ctx = cvs.getContext("2d");
			ctx.fillStyle = "white";  //some color
			var oldPosx = ig.system.getDrawPos( atom1.pos.x - ig.game.screen.x ) - 130 ;
			var newPosx = oldPosx * 0.085;
			var oldPosy = ig.system.getDrawPos( atom1.pos.y - ig.game.screen.y ) -80;
			var newPosy = oldPosy * 0.08;
			if (Math.abs(atom2.atomNumb - atom1.atomNumb) == 1){
				if ((atom2.atomNumb - atom1.atomNumb) < 0){
					var width = -9
				} else {
					var width = 9
				}
				//var width = 20;
				var height = 2;
			} else {
				if ((atom2.atomNumb - atom1.atomNumb) < 0){
					var height = -8
				} else {
					var height = 8
				}
				var width = 2;
				//var height = 20;
			}
			ctx.fillRect(newPosx, newPosy, width, height);
	     },

	    draw: function() {
			this.drawStruct(this.end1, this.end2);
			this.checkAngle();
			this.parent();
	    }
    });
});