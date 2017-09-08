ig.module(
    'game.entities.tutorial'
)
.requires(
    'impact.entity'
)
.defines(function () {
    EntityTutorial = ig.Entity.extend({
        name: "tutorial",
        gravityFactor: 0,
        size: {
            x: 500,
            y: 400
        },
        cushion: {
            x: 20,
            y: 50
        },
        zIndex: 15,
        hidden: true,
        tutNum: 0,
	font: new ig.Font( 'media/andal_small.png' ),
	fontLarge: new ig.Font( 'media/andal_large.png' ),
	fontMed: new ig.Font( 'media/andal_med.png' ),
        
        animSheet: new ig.AnimationSheet('media/tutorialBack.png', 500, 400),
        init: function (x, y, settings) {
            // ANIMATION IS JUST A BACKGROUND IMAGE
            this.addAnim('idle', 1, [0]);
            this.addAnim('hide', 1, [1]);
            this.player = ig.game.getEntitiesByType( EntityPlayer )[0];
            this.currentAnim = this.anims.hide;
            this.parent(x, y, settings);
        },
        
        toggle: function(x, y) {
            //Show hidden background
            if (this.hidden){
                this.currentAnim = this.anims.idle;
                this.pos.x = x;
                this.pos.y = y;
                this.hidden = false;
				ig.game.toggleInfo();
            } else {
                this.currentAnim = this.anims.hide;
                this.pos.x = x;
                this.pos.y = y;
                this.hidden = true;
				ig.game.toggleInfo();
            }
        },
        
        triggeredBy: function( entity, trigger ) {
	    //if (entity instanceof EntityPlayer){
	    this.tutNum = trigger.num;
	    x = ig.game.screen.x + ig.system.width/2 - this.size.x / 2;
	    y = ig.game.screen.y + ig.system.height/2 - this.size.y / 2;
	    this.toggle(x, y);
	    //}
	    //this.loadTut(this.tutNum);
	},
        
        loadTut: function (num){
            // xs = ig.system.width/2;
            // ys = ig.system.height/2;
            xs = this.player.pos.x + this.player.size.x / 2;
            ys = this.player.pos.y - 50;
            switch (num) {
                case 0:
		    this.fontLarge.draw ('Wall in your way?', xs-230, ys-150, ig.Font.ALIGN.LEFT);
                    this.fontMed.draw('Throw a block at it!', xs-100, ys-100, ig.Font.ALIGN.LEFT);
                    this.fontMed.draw('To throw, '+ig.game.verb+' \nthe tile you \nwant removed.', xs-220, ys-60, ig.Font.ALIGN.LEFT);
		    this.fontMed.draw('Plan carefully!\nYou can only have\n12 blocks active\nat a time!', xs-220, ys+40, ig.Font.ALIGN.LEFT);
		    var tut0 = new ig.Image('media/tut1.png');
		    tut0.draw(xs+20, ys - 30);
		    this.font.draw(ig.game.verb+' for more info', xs, ys+155, ig.Font.ALIGN.CENTER);
                    break;

		case 1:
		    this.fontLarge.draw ('In a hurry?', xs-230, ys-150, ig.Font.ALIGN.LEFT);
		    var tut1a = new ig.Image('media/breaker.png');
		    tut1a.draw(xs+175, ys-70);
		    this.fontMed.draw('Soft blocks will crumble on\ntheir own or you can use the\nbreaker button below to break\nblocks immediately!', xs-220, ys-80, ig.Font.ALIGN.LEFT);
		    var tut1b = new ig.Image('media/break.png');
		    tut1b.draw(xs-175, ys+30);
		    this.font.draw(ig.game.verb+' to return to game!', xs, ys+155, ig.Font.ALIGN.CENTER);
                    break;
                case 2:
		    this.fontLarge.draw ('Need a boost?', xs-230, ys-160, ig.Font.ALIGN.LEFT);
                    this.fontMed.draw('Build a new block!', xs-100, ys-110, ig.Font.ALIGN.LEFT);
                    this.fontMed.draw('To modify a block, open\nthe atomizer by '+ig.game.verb2+' the', xs-220, ys - 60, ig.Font.ALIGN.LEFT);
		    this.fontMed.draw('button below.', xs-160, ys - 5, ig.Font.ALIGN.LEFT);
		    var tut2 = new ig.Image('media/atombg.png');
		    tut2.draw(xs-220, ys - 15);
		    this.fontMed.draw('Once open, drag your\n' +ig.game.noun+ ' over the atoms\nto create bonds!', xs-220, ys+50, ig.Font.ALIGN.LEFT);
		    var tut3 = new ig.Image('media/atomizer3.png');
		    tut3.draw(xs+50, ys+5 );
		    this.font.draw(ig.game.verb+' for more info', xs, ys+155, ig.Font.ALIGN.CENTER);
                    break;
		case 3:
		    this.fontLarge.draw ('Block Properties', xs-230, ys-150, ig.Font.ALIGN.LEFT);
		    if (ig.game.device == "iPad"){
			this.fontMed.draw('Blocks can be hard, bouncy,\nslippery, or a combination of each.', xs, ys-80, ig.Font.ALIGN.CENTER);
			this.fontMed.draw('Try shaking your\niPad to see how\nyour new block acts!', xs-220, ys+20, ig.Font.ALIGN.LEFT);
			var tutx = new ig.Image('media/ipadShake.png');
			tutx.draw(xs+50, ys );
		    } else {
			this.fontMed.draw('Blocks can be hard, bouncy,\nslippery, or a combination of each.', xs, ys-80, ig.Font.ALIGN.CENTER);
			this.fontMed.draw('Try shaking the\natomizer by clicking\nthe    button below\nto see how your\nnew block acts!', xs, ys-10, ig.Font.ALIGN.CENTER);
			var tutx = new ig.Image('media/shake_sm.png');
			tutx.draw(xs-80, ys+35 );
			//this.fontMed.draw('button below\nto see how your\nnew block acts', xs-220, ys, ig.Font.ALIGN.LEFT);
		    }
		    //this.fontMed.draw('button below.', xs-160, ys + 55, ig.Font.ALIGN.LEFT);
		    //var tut3 = new ig.Image('media/atomizer.png');
		    //tut3.draw(xs-100, ys-40 );
		    this.font.draw(ig.game.verb+' for more info', xs, ys+155, ig.Font.ALIGN.CENTER);
                    break;
		case 4:
		    this.fontLarge.draw ('Building Blocks', xs-230, ys-150, ig.Font.ALIGN.LEFT);
		    this.fontMed.draw('When lines of connected atoms are \nlinked together, a block with \nsome spring is formed!', xs-220, ys-90, ig.Font.ALIGN.LEFT);
                    var tut4 = new ig.Image('media/cross.png');
		    tut4.draw(xs-100, ys-10);
		    this.fontMed.draw('Try new bond patterns to make \nblocks with different properties!', xs-220, ys+95, ig.Font.ALIGN.LEFT);
		    //this.fontMed.draw('button below.', xs-160, ys + 55, ig.Font.ALIGN.LEFT);
		    this.font.draw(ig.game.verb+' to return to game!', xs, ys+155, ig.Font.ALIGN.CENTER);
                    break;
		case 5:
		    this.fontLarge.draw ('Worm in your way?', xs-230, ys-150, ig.Font.ALIGN.LEFT);
		    var tut5 = new ig.Image('media/spike-img.png');
		    tut5.draw(xs+20, ys-70);
		    this.fontMed.draw('Remove blocks \nto make him fall!', xs-220, ys, ig.Font.ALIGN.LEFT);
		    this.font.draw(ig.game.verb+' to return to game!', xs, ys+155, ig.Font.ALIGN.CENTER);
                    break;
		case 6:
		    this.fontLarge.draw ('Ack! A Worm!', xs-220, ys-160, ig.Font.ALIGN.LEFT);
		    var tut6 = new ig.Image('media/fall.png');
		    tut6.draw(xs-110, ys-100);
		    this.fontMed.draw('Make a block with a slippery\nstructure to lubricate tiles\nand make them fall!', xs, ys+60, ig.Font.ALIGN.CENTER);
		    this.font.draw(ig.game.verb+' to return to game!', xs, ys+155, ig.Font.ALIGN.CENTER);
                    break;
		case 7:
		    this.fontLarge.draw ('Did that snake\njust pew pew?', xs, ys-160, ig.Font.ALIGN.CENTER);
		    var tut6 = new ig.Image('media/snakeIMG.png');
		    tut6.draw(xs-110, ys-60);
		    this.fontMed.draw('Yes he did. Maybe you\ncan make a block to stop it? ', xs, ys+90, ig.Font.ALIGN.CENTER);
		    this.font.draw(ig.game.verb+' to return to game!', xs, ys+155, ig.Font.ALIGN.CENTER);
                    break;
            }
        },
	
	draw: function (){
	    ig.game.sortEntitiesDeferred();
	    this.parent();
	    if (!this.hidden){
		this.loadTut(this.tutNum);
	    }
	}
        
    });
});