ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityPlayer = ig.Entity.extend({
	size: {x: 20, y:30},
	offset: {x: 6, y: 2},
	zIndex: 1,
	maxVel: {x: 200, y: 300},
	lastVel: {x: 0, y: 0},
	friction: {x: 800, y: 0},
	
	type: ig.Entity.TYPE.A, // Player friendly group
	checkAgainst: ig.Entity.TYPE.A,
	collides: ig.Entity.COLLIDES.PASSIVE,
	entID: 0,
	
	animSheet: new ig.AnimationSheet( 'media/player4.png', 32, 32 ),
	playerController: null,
	
	accelGround: 250,
	accelAir: 200,
	jump: 200,
	health: 30,
	flip: false,
	activePortal: 0,
	gate: false,
	recentlyHit: false,
	slip: 0,
	bounced: false,
	arrow: false,
	arrowTimer: 0,
	rangeFlag: false,
	rangeTimer: 0,

	jumpSound: new ig.Sound( 'media/sounds/jump.ogg' ),
	jumpSound: new ig.Sound( 'media/sounds/jump.mp3' ),
	itemSound: new ig.Sound( 'media/sounds/item.ogg' ),
	itemSound: new ig.Sound( 'media/sounds/item.mp3' ),
	collectSound: new ig.Sound( 'media/sounds/emerald.ogg' ),
	collectSound: new ig.Sound( 'media/sounds/emerald.mp3' ),
	deathSound: new ig.Sound( 'media/sounds/death.ogg' ),
	deathSound: new ig.Sound( 'media/sounds/death.mp3' ),

	deathCount:0,
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.entID = 0;
		this.activePortal = settings.portal;
		this.playerController = settings.controller;
		// Add the animations
		this.addAnim( 'idle', 1, [0] );
		this.addAnim( 'run', 0.07, [0,1,2,3,4] );
		this.addAnim( 'jump', 1, [7] );
		this.addAnim( 'fall', 0.4, [5,6] );
	},
	
	
	update: function() {
		if (ig.game.game_mode == 1 || ig.game.game_mode == 7) {

			this.checkTimer();
			if (this.arrowTimer != 0){
				if (this.arrowTimer.delta() > 0){
					this.arrow = false;
					this.arrowTimer = 0;
				}
			}
			// move left or right
			var accel = this.standing ? this.accelGround : this.accelAir;
			if( ig.input.state('left') ) {
				this.accel.x = (-accel + this.slip);
				this.flip = true;
			} else if( ig.input.state('right') ) {
				this.accel.x = (accel - this.slip);
				this.flip = false;
			} else {
				this.accel.x = 0;
			}
			
			// jump
			if( this.standing ){
				this.blockReact(this.blockCheck());
				if ( ig.input.pressed('jump') ) {
					this.jumpSound.play();
					this.vel.y = -this.jump;
				}
			} else {
				this.bounced = false;
			}
			
			// set the current animation, based on the player's speed
			if( this.vel.y < 0 ) {
				this.currentAnim = this.anims.jump;
			}
			else if( this.vel.y > 0 ) {
				this.currentAnim = this.anims.fall;
			}
			else if( this.vel.x != 0 ) {
				this.currentAnim = this.anims.run;
			}
			else {
				this.currentAnim = this.anims.idle;
			}
			
			this.currentAnim.flip.x = this.flip;
			this.lastVel.y = this.vel.y;
			this.parent();
		}
	},
	
	checkTimer: function (){
		if (this.hitTimer){
			if (this.hitTimer.delta() > 0){
				this.recentlyHit = false;
			}
		}
	},
	
	check: function (other){
		if (other instanceof EntityPortal) {
			if (this.activePortal.portalNum != other.portalNum || !this.activePortal.state){
				this.itemSound.play();
				this.playerController.changePortal(other);
				this.activePortal = other;
			}
		}
		if (other instanceof EntityGate) {
			this.gate = true;
		}
		if (other instanceof EntityHeart){
			if (this.health < 30){
				this.itemSound.play();
				this.health += 10;
				other.kill();
			}
		}
		if (other instanceof EntityEmerald){
			this.collectSound.play();
			this.playerController.score += 100;
			this.playerController.emerald += 1;
			if (ig.game.loaded){
				ig.game.logLevelEvent(ig.game.constants.levelConstants.LEVEL_GEM, this.pos);
			}
			other.kill();
		}
	},
	
	blockCheck: function(){
		var blocks = ig.game.getEntitiesByType(EntityPlayerBlock);
		for (var i=0; i < blocks.length; i++){
			var blk = blocks[i];
			if (blk.pos.y >= this.pos.y + 20 && blk.pos.y <= this.pos.y + 40 &&
			    blk.pos.x > this.pos.x - 8 && blk.pos.x < this.pos.x + 8){
				return blk;
			}
		}
		return null;
	},

	
	collideWith: function( other, axis ){
		if( other instanceof EntityPlayerBlock && axis == "y"){
			//deal with standing on block types
			this.blockReact(other);
		}
	},
	
	blockReact: function (other) {
		if (other){
			if (other.bounce >= 4 && this.lastVel.y > 0 && !this.bounced){
				if ( ig.input.state('jump') ) {
					this.bounced = true;
					this.jumpSound.play();
					this.vel.y = -this.jump/2 + ((-this.lastVel.y * (other.bounce / 10)) - this.lastVel.y);
				} else {
					this.bounced = true;
					this.jumpSound.play();
					this.vel.y = (-this.lastVel.y * (other.bounce / 10)) - this.lastVel.y;
				}
			}
			if (other.slip > 0) {
				this.friction.x = 800 - (other.slip * 150); // 800 is default friction
			}
		} else {
			this.friction.x = 800;
		}
	},
	
	drawArrow: function () {
		var startx = ig.system.getDrawPos(this.pos.x + this.size.x/2 - ig.game.screen.x);
		var starty = ig.system.getDrawPos(this.pos.y - 10 - ig.game.screen.y);
		var gate = ig.game.getEntitiesByType(EntityGate)[0];
		var dist = this.distanceTo(gate)/10;
		var ang = this.angleTo(gate);
		var endx = Math.cos(ang) * dist + startx;
		var endy = Math.sin(ang) * dist + starty;
		var headlen = 10;
		var angle = Math.atan2(endy-starty,endx-startx);
		var ctx = ig.system.context;
		ctx.lineWidth = 1;
		ctx.strokeStyle = "white";  //some color
		ctx.beginPath();
		ctx.moveTo(startx, starty);
		ctx.lineTo(endx, endy);
		ctx.lineTo(endx-headlen*Math.cos(angle-Math.PI/6),endy-headlen*Math.sin(angle-Math.PI/6));
		ctx.moveTo(endx, endy);
		ctx.lineTo(endx-headlen*Math.cos(angle+Math.PI/6),endy-headlen*Math.sin(angle+Math.PI/6));
		ctx.stroke();
		
	},

	showRange: function(){
		var rangeIMG = new ig.Image('media/range.png');
		var offsetx = ig.game.screen.x + rangeIMG.width/2;
		var offsety = ig.game.screen.y + rangeIMG.height/2;
		rangeIMG.draw(this.pos.x - offsetx, this.pos.y - offsety);
	},
	
	draw: function (){
		if (this.arrow){
			this.drawArrow();
		}
		if (this.rangeFlag){
			this.showRange();
		}
		this.parent();
	}

});

});