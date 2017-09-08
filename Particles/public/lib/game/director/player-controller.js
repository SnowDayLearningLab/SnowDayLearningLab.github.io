ig.module(
	'game.director.player-controller'
)
.requires(
	'impact.impact'
)
.defines(function(){

ig.PlayerController = ig.Class.extend({

  //lives: 3,
  score: 0,
  emerald: 0,
  item: 1,
  //itemType: 0,
  portalNum: 0,
  activePortal: null,
  player: null,
  //availableBlocks: 0,

  init: function(){
    this.defaults = {score: this.score};
    //this.addPlayerEntity()
  },
  
  reset: function (){
    this.score = 0;
    this.emerald = 0;
    this.item = 1;
    //this.itemType = 0;
    this.portalNum = 0;
    this.activePortal = null;
    this.player = null;
    //this.availableBlocks = 0;
  },
  
  levelChange: function (){
    this.portalNum = 0;
    this.activePortal = null;
    this.player = null;
    //this.availableBlocks = 0;
    this.emerald = 0;
  },
  
  addPlayerEntity: function(){
    if (this.activePortal == null){
      var portals = ig.game.getEntitiesByType( EntityPortal );
      for (var i=0; i<portals.length; i++){
	if (portals[i].portalNum == this.portalNum){
	  this.activePortal = portals[i];
	  break;
	}
      }
    }
    this.player = ig.game.spawnEntity( EntityPlayer, this.activePortal.pos.x, this.activePortal.pos.y, {portal:this.activePortal, controller:this});
    ig.game.player = this.player;
  },
  
  highlight: function(item, clear1, clear2, clear3){
    document.getElementById(item).style.border="thin solid #FFFFFF"
    document.getElementById(clear1).style.border="";
    document.getElementById(clear2).style.border="";
    document.getElementById(clear3).style.border="";
  },
  
  changeImage: function(block){
    this.item = block;
    var div = document.getElementById('block');
    var img = document.getElementById('blockImage');
    //div.innerHTML = "Close";
    switch (block){
      case 1:
	img.src = "media/green_blocks_thumb.png";
	break;
      case 2:
	img.src = "media/blue_blocks_thumb.png";
	break;
      case 3:
	img.src = "media/red_blocks_thumb.png";
	break;
      case 4:
	img.src = "media/yellow_blocks_thumb.png";
	break;
    }
  },
  
  fireGrenade: function(player, mx, my, flip){
    //var grenadePath;
    //if (this.item == 2){
    //  grenadePath = 'media/blue_grenade2.png';
    //  //this.itemType = 2
    //} else if (this.item == 3){
    //  grenadePath = 'media/red_grenade2.png';
    //  //this.itemType = 3;
    //} else if (this.item == 4){
    //  grenadePath = 'media/yellow_grenade2.png';
    //  //this.itemType = 4;
    //} else {
    //  grenadePath = 'media/green_grenade2.png';
    //  //this.itemType = 1;
    //}
    //this.populateBonds();
    if (MyGame.availableBlocks > 0){
      ig.game.spawnEntity( EntityGrenade, player.pos.x, player.pos.y, {flip:flip, block:this.item, mx:mx, my:my, thrower:"player"} );
    } else if (!ig.game.tutorial.maxblock){  // check to see if we've tossed the tutorial about too many blocks
      ig.game.tutorial.tutNum = 99;         // if not, set the tutorial to 9
      ig.game.tutorial.flag[99] = true;     // set the flag to "on" = true
      ig.game.tutorial.hidden = false;     // show tutorial
      ig.game.tutorial.maxblock = true;    // set the too many blocks flag to true so we don't trip it again
    }
  },
  
  respawn: function (){
    this.addPlayerEntity(EntityPlayer);
    ig.game.atomizer.player = this.player;
    //this.setItem(1);
  },
  
  changePortal: function (other) {
    this.portalNum = other.portalNum;
    this.activePortal.state = false; // turn off active on old portal
    this.activePortal = other; // set active portal to new portal
    this.activePortal.state = true; // turn on active of new portal
  }

  
});

});
