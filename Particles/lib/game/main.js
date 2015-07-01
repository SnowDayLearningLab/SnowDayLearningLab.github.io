ig.module( 
	'game.main' 
)
.requires(
	//'impact.debug.debug',
	'impact.game',
	'impact.font',
	'plugins.impact-splash-loader',
	'game.menus',
	
	'game.entities.player',
	'game.entities.grenade',
	'game.entities.spike',
	'game.entities.snake',
	'game.entities.shadow',
	'game.entities.crate',
	'game.entities.atomizer',
	'game.entities.atom',
	'game.entities.blocks',
	'game.entities.bond',
	'game.entities.playerBlock',
	'game.entities.droppedTile',
	'game.entities.portal',
	'game.entities.gate',
	'game.entities.particle',
	'game.entities.deathParticle',
	'game.entities.heart',
	'game.entities.emerald',
	'game.entities.trigger',
	'game.entities.tutorial',
	'game.entities.pokePoint',
	'game.entities.tip',
	'game.entities.structure',
	
	'game.levels.LevelTitle',
	'game.levels.Level1',
	'game.levels.Level2',
	'game.levels.Level3',
	'game.levels.Level4',
	//'game.levels.LevelX',
	
	'game.director.director',
	'game.director.player-controller'
)
.defines(function(){

MyGame = ig.Game.extend({
	
	gravity: 300, // All entities are affected by this
	game_modes: {
	    INTRO: 0,
        PLAYING_LEVEL: 1,
        ATOMIZER: 2,
        END_OF_LEVEL: 3,
        GAME_OVER: 4,
	    INFO: 5,
	    STRUCTURE: 6,
	    TITLE: 7
    },
	game_mode: 0,
	helpOpen: false,
	atomizer: null,
	loaded: false,
	tip: 0,
	menu: null,
	save: null,
	reset: null,
	newBlock: null,
	bondsPresent: false,
	accelx: 0,
	accely: 0,
	deathTimer: 0,
	emeraldTot: [10, 30, 30], // list holding total number of emeralds per level
	titleJump1: false,
	titleJump2: false,
	throwFlag: false,
	
	// Logging variables
	blockInUse: null,
	logArray: [],
	blockLog: {
		id: 0,
		bondEncode: [],
		nbond: 25,
		sbond: 0,
		dbond: 0,
		tbond: 0,
		qbond: 0,
		bounce: 0,
		hardness: 0,
		slip: 0,
		made: 0
	},
	levelLog: {
		finishedLevel: 1,
		tilesRemoved: 0,
		timeToFinish: null
	},
	
	// Load a font
	font: new ig.Font( 'media/andal_small.png' ),
	fontLarge: new ig.Font( 'media/andal_large.png' ),
	fontMed: new ig.Font( 'media/andal_med.png' ),
	crumbSound: new ig.Sound( 'media/sounds/crumble.ogg' ),
	crumbSound: new ig.Sound( 'media/sounds/crumble.mp3' ),
	
	init: function() {
		if (this.isIPad()){
			this.device ="iPad";
			this.showIPadButtons();
			this.verb = "tap";
			this.verb2 = "tapping";
			this.noun = "finger";
		} else {
			this.device = "computer";
			this.verb = "click";
			this.verb2 = "clicking";
			this.noun = "mouse";
		}
		this.checkLocalStorage();
		this.loadAnimations();
		this.playerController = new ig.PlayerController();
		this.myDirector = new ig.Director(this, [LevelLevelTitle, LevelLevel1, LevelLevel2, LevelLevel3]);
		this.setTitle();
		
		// Bind keys
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
		ig.input.bind( ig.KEY.A, 'left');
		ig.input.bindTouch( '#left', 'left')
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
		ig.input.bind( ig.KEY.D, 'right');
		ig.input.bindTouch( '#right', 'right')
		ig.input.bind( ig.KEY.W, 'jump' );
		ig.input.bind( ig.KEY.UP_ARROW, 'jump' );
		ig.input.bind( ig.KEY.DOWN_ARROW, 'down' );
		ig.input.bindTouch( '#up', 'jump')
		ig.input.bind( ig.KEY.MOUSE1, 'click');
		ig.input.bind( ig.KEY.ENTER, 'enter');
		ig.input.bind( ig.KEY.SPACE, 'atom' );
		ig.input.bindTouch( '#atomizer', 'atom')
		ig.input.bind( ig.KEY.SHIFT, 'breaker');
		ig.input.bindTouch( '#breaker', 'breaker');
		ig.input.bind( ig.KEY.N, 'next');
		ig.input.bind( ig.KEY.E, 'shake');
		ig.input.bindTouch( '#shake', 'shake');
		ig.input.bindTouch( '#volume', 'volume');
		ig.input.bindTouch( '#arrow', 'arrow');
	},
	
	startLoad: function (lvl){
		this.atomizer = null,
		this.loaded = false,
		this.menu = null;
		this.save = null;
		// this.loadAnimations();
		// this.playerController = new ig.PlayerController();
		// this.myDirector = new ig.Director(this, [LevelLevelTitle, LevelLevel1, LevelLevel2, LevelLevel3]);
		this.myDirector.loadLevel( lvl );
		this.playerController.reset();
		this.playerController.addPlayerEntity();
		this.loadAtomizer();
		this.cycleBlocks();
		this.closeAtomizer();
		this.playerController.item = 1;
		this.tutorial = this.spawnEntity(EntityTutorial, this.player.pos.x, this.player.pos.y); // create tutorial window
		this.levelTimer = new ig.Timer();
		this.loaded = true;
	},
	
	isIPad: function () {
		return (navigator.userAgent.indexOf("iPad") != -1);
	},

	checkLocalStorage: function(){
		if (localStorage.getItem("levels") === null) {
			localStorage.levels = JSON.stringify([1,0,0]); // save levels unlocked... since it was null, just unlock 1
			localStorage.gems = JSON.stringify([0,0,0]);   // save gems per level data
		}
	},
	checkEnabled: function(i){
		var lvl = JSON.parse(localStorage.levels);
		if (lvl[i] === 1){
			return true;
		} else {
			return false;
		}
	},
	checkGems: function(i){
		return JSON.parse(localStorage.gems)[i];
	},
	
	update: function() {
		if (ig.input.pressed('atom')) {
			this.toggleAtomizer();
		}
		if (ig.input.pressed('volume')){
			this.toggleVolume();
		}
		if (this.menu){
			if (this.game_mode == 7) {
				this.menu.update();
				this.titleAnim();
			} else{
				this.menu.update();
				return;
			}
		}
		// PLAY MODE
		if (this.game_mode == 1) {
			MyGame.shake = false;
			// screen follows the player
			if( this.player ) {
				if (this.player.pos.x > this.screen.x + ig.system.width * 0.6){
					this.screen.x = this.player.pos.x - ig.system.width * 0.6;
				}
				if (this.player.pos.x < this.screen.x + ig.system.width * 0.4){
					this.screen.x = this.player.pos.x - ig.system.width * 0.4;
				}
				if (this.player.pos.y > this.screen.y + ig.system.height * 0.6){
					this.screen.y = this.player.pos.y - ig.system.height * 0.6;
				}
				if (this.player.pos.y < this.screen.y + ig.system.height/2){
					this.screen.y = this.player.pos.y - ig.system.height/2;
				}
				//ADD SCREEN LOCKING MECHANISM... LEAVE Y, BUT ONCE WE REACH HALF OF SCREEN IN X LOCK INTO THE ABOVE
			}
			if (ig.input.pressed('arrow')){
				this.toggleArrow();
			}

			if (ig.input.pressed('click')) {   // Fire grenade if clicking around player
				var mx = ig.input.mouse.x + ig.game.screen.x;
				var my = ig.input.mouse.y + ig.game.screen.y;
				if (mx < (this.player.pos.x + 150) && mx > (this.player.pos.x - 150)
				    && my < (this.player.pos.y + 150) && my > (this.player.pos.y - 150)) {
					if (my < this.player.pos.x) {
						this.playerController.fireGrenade(this.player, mx, my, true);
					} else {
						this.playerController.fireGrenade(this.player, mx, my, false);
					}
					// if the range indicator is showing, after clicking inside the range remove it
					if (this.throwFlag){
						this.player.rangeFlag = false;
					}
				// the first time the player clicks outside the range, show a range indicator
				} else if (!this.throwFlag){
					this.throwFlag = true;
					this.player.rangeFlag = true;
				}
			}
			if (this.player.health <= 0 && this.deathTimer == 0){
				this.deathTimer = new ig.Timer(1.5);
				this.player.kill();
			}
			if (this.deathTimer != 0){
				if (this.deathTimer.delta() > 0){
					this.playerController.respawn();
					this.deathTimer = 0;
				}
			}
			if (ig.input.pressed('breaker')){
				this.breakBlocks();
			}
			if (ig.input.pressed('next')){
				this.player.gate = true;
			}
			if (this.player.gate){
				// LOGGING ACTIVITIES
				this.exportBlockArray("complete");
				// level switching
				this.player.gate = false;
				this.passAtomizer(true);
				MyGame.availableBlocks = 12;
				if (this.myDirector.currentLevel + 1 == this.myDirector.levels.length){
					this.setGameOver();
				} else {
					var lvls = JSON.parse(localStorage.levels);
					var gems = JSON.parse(localStorage.gems);
					// since "currentLevel" starts at 1 rather than 0, we don't need to add 1 to open up the next level
					lvls[this.myDirector.currentLevel] = 1;
					localStorage.levels = JSON.stringify(lvls);
					//since "currentLevel" starts at 1, we need to subtract one to be at the correct item in the array
					if (this.playerController.emerald > gems[this.myDirector.currentLevel - 1]){
						gems[this.myDirector.currentLevel - 1] = this.playerController.emerald;
						localStorage.gems = JSON.stringify(gems);
					}
					this.setNextLevel();
				}
			}
		
		// ATOMIZER MODE
		} else if (this.game_mode == 2){
			// move atoms
			var mx = ig.input.mouse.x + ig.game.screen.x;
			var my = ig.input.mouse.y + ig.game.screen.y;
			if (ig.ua.mobile){
				this.newx = ig.input.accel.x;
				this.newy = ig.input.accel.y;
				if (this.newx < 0){
					deltaX = this.oldx - this.newx;
					deltaY = this.oldy - this.newy;
				} else {
					deltaX = (this.oldx - this.newx) * -1;
					deltaY = (this.oldy - this.newy) * -1;	
				}
				if (Math.abs(deltaX) > 13 || Math.abs(deltaY) > 13){
					this.shakeAtomizer(true, deltaX, deltaY);
				}
			}
			// check to see if we're clicking in the block area and that the tutorial is gone
			if (ig.input.pressed('click') && mx > this.atomizer.pos.x + (this.atomizer.size.x - 100)){
				if (this.tip === 2){
					this.tutorial.flag[2] = false;
					this.tutorial.flag[3] = false;
					this.tutorial.flag[4] = true;
					this.tutorial.tutNum = 4;
				} else if (!this.tutorial.flag[3] && !this.tutorial.flag[4]){
					this.atomizer.selectBlock(mx, my, false);
				}
			} else if (ig.input.state('click') && mx < this.atomizer.pos.x + (this.atomizer.size.x - 100)){
				if (MyGame.shake){
					this.resetAtoms();
					MyGame.shake = false;
				}
				this.atomizer.clickObjects(mx, my);
			// no longer clicking, reset atom states and set selected to zero
			} else if (this.atomizer.atomsSelected.length > 0) {
				for (var i=0; i<this.atomizer.atomsSelected.length; i++){
					this.atomizer.atomsSelected[i].state = "solo";
				}
				this.atomizer.atomsSelected = []; // clear selected atoms if mouse released
			}
			
			if (ig.input.pressed('shake')){
				this.shakeAtomizer(false, 0, 0); // mobile, x, y
			} else if (ig.input.released('shake')){
				this.shakeAtomizer(false, 0, 0); // mobile, x, y
			}
		} else if (this.game_mode == 5){
			if (!this.helpOpen && ig.input.pressed('click')){
				if (this.tutorial.tutNum == 0){
					this.tutorial.tutNum += 1;
				} else if (this.tutorial.tutNum > 1 && this.tutorial.tutNum < 4){
					this.tutorial.tutNum += 1;
				} else {
					this.tutorial.toggle(this.player.pos.x, this.player.pos.y);
				}
			}
		}
		
		// Update all entities and BackgroundMaps
		if (ig.ua.mobile){
			this.oldx = this.newx;
			this.oldy = this.newy;
		}
		if (this.game_mode == 1 || this.game_mode == 0 ||this.game_mode == 2 || this.game_mode == 6 || this.game_mode == 7){
			this.parent();
		}
	},
	
	switchBlock: function (newBlock){
		newBlock.active = true;
		this.atomizer.killAtoms(); // clear out the old atoms
		this.atomizer.loadAtoms(newBlock); // load the atoms from the active block
		this.playerController.changeImage(this.atomizer.lastBlock);
		this.game_mode = this.game_modes.ATOMIZER;
	},
	
	toggleAtomizer: function (){
		if (this.game_mode == 1){
			// Opening the atomizer manually near first gem
			// fires off the tutorial and tip
			if (this.tip === 0 && this.tutorial.flag[1]) {
				this.tip = 1;
				this.tutorial.flag[1] = false;
				this.tutorial.flag[2] = true;
				this.tutorial.tutNum = 2;
			}
			var blocks = this.getEntitiesByType(EntityPlayerBlock)
			for (var i=0;i<blocks.length;i++){
				if (blocks[i].crumbTime != 0){
					blocks[i].crumbTime.pause();
				}
			}
			this.loadAtomizer();
			//if mobile, save current accel input
			if (ig.ua.mobile){
				this.accelx = ig.input.accel.x;
				this.accely = ig.input.accel.y;
			}
			var div = document.getElementById('atomizerText');
			var img = document.getElementById('atomizerImage');
			var shakeDiv = document.getElementById('shake');
			var shakeTxt = document.getElementById('shakeText2');
			div.innerHTML = "Close";
			img.src = "media/atombg-y.png";
			shake.style.display = "block";
			if (this.device == "computer"){
				shakeTxt.innerHTML = "&lt;E&gt;";
			}
		} else if (this.game_mode == 2 ){
			// first time closing the atomizer removes tip
			if (this.tip === 1){    // if only the first tip is up, remove it, and reset it so it loads again.
				this.unloadTip(this.tip);
				this.tip = 0;
				this.tutorial.flag[1] = true;
				this.tutorial.flag[2] = false;
				this.tutorial.tutNum = 1;
			} else if (this.tip <= 2 && this.atomizer.bondArray.length === 40){  // if all blocks are made
				this.unloadTip(this.tip);
				this.tip = 3;
				this.tutorial.flag[2] = false;
				this.tutorial.flag[3] = false;
				this.tutorial.flag[4] = false;
				this.tutorial.flag[5] = true;
				this.tutorial.tutNum = 5;
				this.tip = 3;
			} else if (this.tutorial.flag[2] || this.tutorial.flag[3] || this.tutorial.flag[4]){  // if we're in an atomizer tutorial
				if (ig.game.atomizer.bondArray.length === 40){   // check to see that we made all the bonds
					// sets previous tutorial flag and removes tutorial
					this.tutorial.flag[3] = false;
					this.tutorial.flag[4] = false;
					this.tutorial.flag[5] = true;
					this.tutorial.tutNum = 5;
					this.tip = 3;
				} else {  // if we're not at 40 bonds, throw another message
					this.tutorial.flag[3] = false;
					this.tutorial.flag[4] = true;
					this.tutorial.tutNum = 4;
				}
			}
			if (!this.tutorial.flag[4]){
			var blocks = this.getEntitiesByType(EntityPlayerBlock)
			for (var i=0;i<blocks.length;i++){
				if (blocks[i].crumbTime != 0){
					blocks[i].crumbTime.unpause();
				}
			}
			this.resetAtoms();
			this.closeAtomizer();
			var div = document.getElementById('atomizerText');
			var img = document.getElementById('atomizerImage');
			var shakeDiv = document.getElementById('shake');
			var shakeTxt = document.getElementById('shakeText2');
			div.innerHTML = "Atomizer";
			img.src = "media/atombg.png";
			shakeDiv.style.display = "none";
			if (this.device == "computer"){
				shakeTxt.innerHTML = "";
			}
			}
		}
	},
	
	// loads atomizer
	loadAtomizer: function(){
		var locx = this.screen.x + ig.system.width/2 - 318;
		var locy = this.screen.y + ig.system.height/2 - 230;
		if (!this.atomizer){ // if this if the first time we're loading the atomizer
			this.atomizer = this.spawnEntity(EntityAtomizer, locx, locy); // create atomizer
			if (this.save != null) {
				this.atomizer.loaded = true;
				this.atomizer.blockArray = this.save;
			}
			this.atomizer.loadBlocks(); // load blocks
			this.atomizer.loaded = true; // set the atomizer to loaded
		} else {
			this.atomizer.show(locx, locy);
		}
		this.game_mode = this.game_modes.ATOMIZER;
	},
	
	closeAtomizer: function(){
		if (this.game_mode == 2 || this.game_mode == 6) {
			this.game_mode = this.game_modes.PLAYING_LEVEL;
			this.atomizer.unloadAtomizer(); // unload atomizer
		}
	},
	
	resetAtoms: function (){
		var atoms = this.getEntitiesByType(EntityAtom);
		for (var i=0; i<atoms.length; i++){
			atoms[i].pos.x = atoms[i].initx;
			atoms[i].pos.y = atoms[i].inity;
		}
	},
	
	cycleBlocks: function (){
		this.atomizer.selectBlock(0, 0, true);
	},
	
	breakBlocks: function (){
		var blocks = this.getEntitiesByType(EntityPlayerBlock);
		for (var i=0; i < blocks.length; i++){
			var blk = blocks[i];
			if (blk.thrower === "player") {
				if (blk.slip < 27){
					blk.removeTiles();
				} else {
					blk.dropTile();
				}
				for (var a= 0; a < 10; a++) {
					ig.game.spawnEntity(EntityDeathParticle, blk.pos.x, blk.pos.y);
				}
				blk.crumbSound.play();
				blk.kill();
			}
		}
		MyGame.availableBlocks = 12;
		if (this.tutorial.flag[99]) {      // is the breaker flag up?
			this.tutorial.flag[99] = false;  // set it to false
			this.tutorial.hidden = true;  // hide the tutorial
		} else if (this.tutorial.flag[6]){  // breaker flag for trigger 6
			this.tutorial.flag[6] = false;
			this.tutorial.flag[7] = true;   // turn on flag about other types of blocks
			this.tutorial.maxblock = true;
			this.tutorial.tutNum = 7;
			this.tutorial.tutTimer = new ig.Timer(5);
		}
	},
	
	passAtomizer: function (com){
		if (com){
			this.save = this.atomizer.blockArray
			this.atomizer = null;
		} else {
			this.loadAtomizer();
			//pass info
			this.closeAtomizer();
		}
	},
	
	shakeAtomizer: function(mobile, x, y){
		MyGame.shake = true;
		var atoms = this.getEntitiesByType(EntityAtom);
		for (var i=0; i<atoms.length; i++){
			var mover = atoms[i];
			if (mover.state == "structure"){
				mover.findBondTypes();
				// more bonds means less initial impulse
				var adjust = 1;
				if (mover.partner.length > 2) {
					adjust = 0.05;
				} else if (mover.partner.length == 2){
					adjust = 0.7;
				}
				if (!mobile){
					// random 1 or -1
					var xbonus = 1;
					var ybonus = 1;
					if (mover.bondx > 0){
						ybonus = 0.5;
					}
					if (mover.bondy > 0){
						xbonus = 0.5;
					}
					var plusOrMinus1 = Math.random() < 0.5 ? -1 : 1;
					var plusOrMinus2 = Math.random() < 0.5 ? -1 : 1;
					mover.vel.x = Math.random() * 100 * xbonus * plusOrMinus1 * adjust;
					mover.vel.y = Math.random() * 100 * ybonus * plusOrMinus2 * adjust;
				} else {
					// since the ipad is sideways, y movement is from the accel.x, x movement is from accel.y
					mover.vel.x = Math.random() * 50 * y/3 * adjust;
					mover.vel.y = Math.random() * 50 * x/3 * adjust;
				}
			}
		}
	},
	
	exportBlockArray: function(status) {
		if (this.logArray.length > 0){ // Don't do anything if refreshing without playing
			this.levelLog.timeToFinish = this.levelTimer.delta() // save time to finish level
			
			var playerID = localStorage.getItem("id"); // pulling from local storage id number
			var playerAge = localStorage.getItem("age"); // pulling from local storage age number
			var logJSON = JSON.stringify(this.logArray);
			var levelJSON = JSON.stringify(this.levelLog);
			
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange=function() {
			    // continue if the process is completed
			    if (xmlhttp.readyState == 4) {
				// continue only if HTTP status is "OK"
				if (xmlhttp.status == 200) {
				    tns=xmlhttp.responseText;
				}
			    }
			}
			xmlhttp.open("POST","lib/game/arrayPost.php",false);
			xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xmlhttp.send('player='+playerID+'&age='+playerAge+'&device='+this.device+'&status='+status+'&log='+logJSON+'&level='+levelJSON);
			console.log('logged');
			// Reset log and post the block currently in use to the array
			this.logArray = [];
			var log = ig.copy(ig.game.blockLog);
			log.time = new Date().toLocaleString();
			// Since we incrimented the id# after we created this block, we need to pull it back one
			// so that it matches in the xml log file
			log.id -= 1;
			//log.img = document.getElementById("canvas").toDataURL("image/jpeg", 0.2);
			this.logArray.push(log);
			this.blockInUse = 0;
			
			// As of now, the array only saves the last bomb when finishing a level.
			// This means the block right after a level switch will be a duplicate of the
			// block right before the level switch.  Also, when I open up the atomizer, and
			// select an already created block, this will be written as a new block.  Duplicates
			// should be able to be found easily by matching the bondEncode.
		}
		
	},
	
	loadTip: function (tipNum, x, y){
		var tip = this.spawnEntity(EntityTip, x, y, {frameNum:tipNum});
		this.tip = tipNum;
	},
	
	unloadTip: function (tipNum){
		var tips = this.getEntitiesByType (EntityTip);
		for (var i=0;i<tips.length;i++){
			if (tips[i].frameNum == tipNum){
				tips[i].kill();
			}
		}
		this.tip = tipNum + 1;
	},
	
	showIPadButtons: function (){
		var leftIMG = document.getElementById('left');
		var rightIMG = document.getElementById('right');
		var upIMG = document.getElementById('up');
		leftIMG.innerHTML = '<img src="media/left.png">';
		rightIMG.innerHTML = '<img src="media/right.png">';
		upIMG.innerHTML = '<img src="media/up.png">';
		
		//clear keyboard shortcut text
		var div1 = document.getElementById('atomizerText2');
		var div2 = document.getElementById('breakerText2');
		var div3 = document.getElementById('shakeText2');
		div1.innerHTML = "";
		div2.innerHTML = "";
		div3.innerHTML = "";
		
		//hide volume
		var volumeDiv = document.getElementById('volume');
		volumeDiv.innerHTML = '';
	},
	
	draw: function() {
		this.parent();
		
		// draw HUD
		if (this.game_mode == 1 || this.game_mode == 2 || this.game_mode == 6) {
			this.drawUI();
			if (!this.tutorial.hidden){
				this.tutorial.drawText();
			}
		} else if (this.game_mode == 7) {
			this.drawTitle();
		} else if (this.game_mode == 3) {
			this.drawNextLevel();
		} else if (this.game_mode == 4) {
			this.drawGameOver();
		} 
		if (this.game_mode == 1){
			// draw material around blocks
			var loadedBlocks = ig.game.getEntitiesByType(EntityPlayerBlock);
			for (var i=0; i<loadedBlocks.length; i++){
				loadedBlocks[i].drawStructure();
			}
			for (var i=0; i<loadedBlocks.length; i++){
				loadedBlocks[i].draw();
			}
		}
		if (this.menu) {
			this.menu.draw();
		}
	},
	
	drawUI: function (){
		//HUD stuff
		var heart = new ig.Image('media/heart1.png');
		var heartX = 100; //x location for hearts for hearts
		for (var i=0; i<this.player.health/10; i++){
			heart.draw(heartX, 20);
			heartX += 30;
			if (i==3){
				heartX=320;
			}
		}
		this.font.draw( 'Score: ' + this.playerController.score, 428, 20, ig.Font.ALIGN.CENTER);
		var emeraldIMG = new ig.Image('media/emerald-img.png');
		var emeraldTotal = this.getEntitiesByType(EntityEmerald).length + this.playerController.emerald;
		this.font.draw(this.playerController.emerald+'/'+emeraldTotal, 790, 20, ig.Font.ALIGN.LEFT);
		emeraldIMG.draw(750, 20);
		var availableBlocks = document.getElementById('blockText');
		availableBlocks.innerHTML = "Available Blocks: " + MyGame.availableBlocks;
		
	},
	
	drawTitle: function () {
        var xs = ig.system.width / 2;
        var ys = ig.system.height / 4;
	    //ig.system.context.fillStyle = 'rgba(0,0,0,1)';
		//ig.system.context.fillRect(0, 0, ig.system.width, ig.system.height)
        this.fontLarge.draw('Particles!', xs, ys, ig.Font.ALIGN.CENTER);
        ig.system.context.globalAlpha = 1;
    },
	
	drawGameOver: function () {
		var xs = ig.system.width / 2;
		var ys = ig.system.height / 4;
		var emeraldIMG = new ig.Image('media/emerald-img.png');
		var emeraldTotal = this.getEntitiesByType(EntityEmerald).length + this.playerController.emerald;
		ig.system.context.fillStyle = 'rgba(0,0,0,0.7)';
		ig.system.context.fillRect(0, 0, ig.system.width, ig.system.height)
		this.fontLarge.draw('Congratulations!', xs, ys, ig.Font.ALIGN.CENTER);
		this.fontMed.draw('You finished all the levels!', xs, ys + 70, ig.Font.ALIGN.CENTER);
		this.fontMed.draw('Final Score: ' + this.playerController.score, xs, ys * 2, ig.Font.ALIGN.CENTER);
		this.fontMed.draw(this.playerController.emerald+'/'+emeraldTotal, xs+20, ys * 2 + 30, ig.Font.ALIGN.LEFT);
		emeraldIMG.draw(xs-20, ys * 2 + 35);
		this.fontMed.draw('We hope you enjoyed the game! Please email us with your thoughts.', xs, ys * 3, ig.Font.ALIGN.CENTER);
		this.fontMed.draw('rigd@ccl.northwestern.edu', xs, ys * 3 + 50, ig.Font.ALIGN.CENTER);
    },
	
	drawNextLevel: function () {
		var xs = ig.system.width / 2;
		var ys = ig.system.height / 4;
		var emeraldIMG = new ig.Image('media/emerald-img.png');
		var emeraldTotal = this.getEntitiesByType(EntityEmerald).length + this.playerController.emerald;
		ig.system.context.fillStyle = 'rgba(0,0,0,0.7)';
		ig.system.context.fillRect(0, 0, ig.system.width, ig.system.height)
		this.fontLarge.draw('You completed this level!', xs, ys, ig.Font.ALIGN.CENTER);
		this.fontMed.draw('Score: ' + this.playerController.score, xs, ys + 90, ig.Font.ALIGN.CENTER);
		this.fontMed.draw(this.playerController.emerald+'/'+emeraldTotal, xs+20, ys + 120, ig.Font.ALIGN.LEFT);
		emeraldIMG.draw(xs-20, ys+125);
    },
	
	loadAnimations: function () {
		var animMap = new ig.AnimationSheet( 'media/lava.png', 16, 16 );
		this.backgroundAnims = {
		    'media/lava.png': {
			0: new ig.Animation( animMap, 0.2, [0,1,2,3] ),
			4: new ig.Animation( animMap, 0.2, [4,5,6,7] ),
			2: new ig.Animation( animMap, 0.2, [2,3,0,1] ),
			6: new ig.Animation( animMap, 0.2, [6,7,4,5] )
		    }
		};
	},
	
	loadNextLevel: function (){
		this.menu = null;
		this.game_mode = this.game_modes.PLAYING_LEVEL;
		this.myDirector.nextLevel();
		this.playerController.levelChange();
		this.playerController.addPlayerEntity();
		this.tutorial = this.spawnEntity(EntityTutorial, this.player.pos.x, this.player.pos.y); // create tutorial window
		MyGame.availableBlocks = 12;
		//Reset levelLog values
		this.levelLog.timeToFinish = null;
		this.levelLog.tilesRemoved = 0;
		this.levelLog.finishedLevel += 1;
		this.passAtomizer(false);
	},
	
	setTitle: function () {
		this.entities=[];
		this.myDirector.loadLevel( 0 );
		this.screen.x = 0;
		this.screen.y = 0;
		this.playerController.reset();
		this.playerController.addPlayerEntity();
		this.game_mode = this.game_modes.TITLE;
		this.menu = new TitleMenu();
		this.titleJump1 = false;
		this.titleJump2 = false;
		this.titleTimer = new ig.Timer(20);
    },
	
	setGameOver: function () {
		this.game_mode = this.game_modes.GAME_OVER;
		this.menu = new GameOverMenu();
    },
	
	setNextLevel: function () {
		this.game_mode = this.game_modes.END_OF_LEVEL;
		this.menu = new LevelFinishMenu();
	},
	
	toggleHelp: function () {
		if (this.game_mode == 0 || this.game_mode == 7){
			this.game_mode = this.game_modes.INFO;
			this.menu = new HelpMenu();
			this.player.kill();
		} else if (this.game_mode == 5){
			this.setTitle();
		}
	},

	levelSelect: function () {
		this.game_mode = this.game_modes.INTRO;
		this.menu = new LevelsMenu();
		this.player.kill();
	},
	
	toggleInfo: function () {
		if (this.game_mode == 1){
			this.game_mode = this.game_modes.INFO;
		} else if (this.game_mode == 5){
			this.game_mode = this.game_modes.PLAYING_LEVEL;
		}
	},
	
	toggleVolume: function (){
		var volIMG = document.getElementById('volumeImage');
		if (ig.Sound.enabled){
			ig.Sound.enabled = false;
			volIMG.src = "media/mute.png";
		} else {
			ig.Sound.enabled = true;
			volIMG.src = "media/volume.png";
		}
	},
	
	toggleArrow: function (){
		this.player.arrow = true;
		if (this.player.arrowTimer == 0){
			this.player.arrowTimer = new ig.Timer( 4 );
		}
	},

	titleAnim: function() {
		if (this.player.gate){
			this.player.gate = false;
			this.player.kill();
		}
		if (this.titleTimer.delta() > -18 && this.titleTimer.delta() < -17.8 && !this.titleJump1){
			this.titleJump1 = true;
			this.player.vel.y = -150;
			this.player.jumpSound.play();
		}
		if (this.titleTimer.delta() > -17 && this.titleTimer.delta() < -16.8 && !this.titleJump2){
			this.titleJump2 = true;
			this.player.vel.y = -150;
			this.player.jumpSound.play();
		}
		if (this.titleTimer.delta() > -15 && this.titleTimer.delta() < -13.9){
			this.player.vel.x = 100;
		}
		if (this.titleTimer.delta() > -12 && this.titleTimer.delta() < -11.8){
			var offx = 0;
			var offy = 5;
			for (var i=0; i<21; i++){
				if (i%7 == 0) {
					offx = 0
					if (i > 6 && i < 14){
						offy = 21;
					} else if (i > 13 )
						offy = 37;
				} else {
					offx += 16;
				}
				if (ig.game.backgroundMaps[2].getTile( this.player.pos.x + offx, this.player.pos.y + this.player.size.y + offy) != 0){
					ig.game.backgroundMaps[2].setTile( this.player.pos.x + offx, this.player.pos.y + this.player.size.y + offy, 0);
					ig.game.collisionMap.setTile( this.player.pos.x +offx, this.player.pos.y + this.player.size.y + offy, 0 );
					for (var i = 0; i < 6; i++) {
					    ig.game.spawnEntity(EntityDeathParticle, this.player.pos.x +offx, this.player.pos.y + this.player.size.y + offy);
					}
				}
			}
			this.crumbSound.play();
		}
		if( this.player ) {
			if (this.player.pos.y > this.screen.y + ig.system.height * 0.6){
				this.screen.y = this.player.pos.y - ig.system.height * 0.6;
			}
		}
	}
});
///////////////////
// GLOBALS BELOW //
//////////////////
	
	MyGame.availableBlocks = 12;
	MyGame.snakeDeath = false;
	MyGame.shake = false;
	MyGame.poke = false;
	if( ig.ua.mobile ) {
		ig.Sound.enabled = false;
	}
	
	window.ondevicemotion = function(event) {
		// when ig.input is not ready, just ignore the event
		if( !ig.input ) { return; } 
			ig.input.accel = {
			    x: event.accelerationIncludingGravity.x,
			    y: event.accelerationIncludingGravity.y,
			    z: event.accelerationIncludingGravity.z
			};
	}
	
	// Start the Game with 60fps, a resolution of 855x585
	ig.main('#canvas', MyGame, 60, 855, 585, 1, ig.ImpactSplashLoader);
	
	window.MyGame.checkOrientation = function () {
		var isLandscape = MyGame.isLandscape();
		if (isLandscape === MyGame.wasLandscape) {
		    return;
		}
		MyGame.wasLandscape = isLandscape;
		if (isLandscape) {
		    ig.$('#rotate').style.display = 'none';
		} else {
		    ig.$('#rotate').style.display = 'block';
		}
	};
	    
	window.MyGame.wasLandscape = -1;
	window.MyGame.isLandscape = function () {
	    return (window.innerHeight < window.innerWidth);
	};
	
	window.addEventListener('orientationchange', MyGame.checkOrientation, false);
	window.addEventListener('resize', MyGame.checkOrientation, false);
	
	window.MyGame.checkOrientation();
	
});
