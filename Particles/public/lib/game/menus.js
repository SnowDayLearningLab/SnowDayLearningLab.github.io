// lib/game/menus.js
ig.module(
          'game.menus'
).requires(
           'impact.font'
).defines(function () {
    
    MenuItem = ig.Class.extend({
        getText: function () {
            return 'none'
        },
        left: function () {},
        right: function () {},
        ok: function () {},
        click: function () {
            this.ok();
            ig.system.canvas.style.cursor = 'auto';
        },
    });
    MenuImg = ig.Class.extend({
        getImg: function() {
            return "ig.Image('media/helpOpen.png')";
        },
        info: {
            gems: 0,
            time: "unknown"
        },
        pos: {
            x: 0,
            y: 0
        },
        width: 200,
        height: 150,
        click: function () {
            this.ok();
            ig.system.canvas.style.cursor = 'auto';
        },
    });
    Menu = ig.Class.extend({
        clearColor: null,
        name: null,
        font: new ig.Font('media/andal_med.png'), // BUILD NEW FONTS AT http://impactjs.com/font-tool/
        fontDisabled: new ig.Font('media/andal_disable.png'),
        fontSelected: new ig.Font('media/andal_hover.png'),
        fontTitle: new ig.Font('media/andal_large.png'),
        current: 0,
        itemClasses: [],
        items: [],
        infoClasses: [],
        infos: [],
        imgClasses: [],
        imgs: [],
        
        init: function () {
            this.y = ig.system.height / 4 + 160;
            for (var i = 0; i < this.itemClasses.length; i++) {
                this.items.push(new this.itemClasses[i]());
            }
            for (var i = 0; i < this.infoClasses.length; i++) {
                this.infos.push(new this.infoClasses[i]());
            }
            for (var i = 0; i < this.imgClasses.length; i++) {
                this.imgs.push(new this.imgClasses[i]());
            }
            var xs = ig.system.width / 2 - 320;
            for (var i = 0; i < this.imgs.length; i++) {
                this.imgs[i].pos.x = xs;
                this.imgs[i].pos.y = ig.system.height / 4 + 60;
                xs += 220;
            }
        },
        update: function () {
            if (ig.input.pressed('jump')) {  // up key mapped as "jump"
                this.current--;
            }
            if (ig.input.pressed('down')) {
                this.current++;
            }
            this.current = this.current.limit(0, this.items.length + this.imgs.length - 1);
            if (ig.input.pressed('enter')) {
                if (this.imgs.length === 0){
                    this.items[this.current].ok();
                } else {
                    if (this.current < this.imgs.length){
                        this.imgs[this.current].ok();
                    } else {
                        this.items[this.current-this.imgs.length].ok();
                    }
                }
            }
            var ys = this.y;
            var xs = ig.system.width / 2;
            var hoverItem = null;
            if (this.imgs.length > 0) {
                for (var i=0; i<this.imgs.length; i++){
                    var img = this.imgs[i];
                    if (ig.input.mouse.x > img.pos.x && ig.input.mouse.x < img.pos.x + img.width && ig.input.mouse.y > img.pos.y && ig.input.mouse.y < img.pos.y + img.height && ig.game.checkEnabled(i)){
                        hoverItem = img;
                        this.current = i;
                    }
                }
                ys += 150;
                for (var i = 0; i < this.items.length; i++) {
                    var item = this.items[i];
                    var w = this.font.widthForString(item.getText()) / 2;
                    if (ig.input.mouse.x > xs - w && ig.input.mouse.x < xs + w && ig.input.mouse.y > ys && ig.input.mouse.y < ys + 24) {
                        hoverItem = item;
                        this.current = i + this.imgs.length;
                    }
                    ys += 30;
                }

            } else {
                for (var i = 0; i < this.items.length; i++) {
                    var item = this.items[i];
                    var w = this.font.widthForString(item.getText()) / 2;
                    if (this.infos.length > 0){
                        var f = this.infos.length * 20;
                        if (ig.input.mouse.x > xs - w && ig.input.mouse.x < xs + w && ig.input.mouse.y > ys + f && ig.input.mouse.y < ys + 24 + f) {
                            hoverItem = item;
                            if (this.imgs.length > 0) {
                                this.current = i + this.imgs.length;
                            } else {
                                this.current = i;
                            }
                        }
                    } else if (ig.input.mouse.x > xs - w && ig.input.mouse.x < xs + w && ig.input.mouse.y > ys && ig.input.mouse.y < ys + 24) {
                        hoverItem = item;
                        if (this.imgs.length > 0) {
                            this.current = i + this.imgs.length;
                        } else {
                            this.current = i;
                        }
                    }
                    ys += 30;
                }
            }
            if (hoverItem) {
                ig.system.canvas.style.cursor = 'pointer';
                if (ig.input.pressed('click')) {
                    hoverItem.click();
                }
            } else {
                ig.system.canvas.style.cursor = 'auto';
            }
        },
        draw: function () {
            if (this.clearColor) {
                ig.system.context.fillStyle = this.clearColor;
                ig.system.context.fillRect(0, 0, ig.system.width, ig.system.height);
            }
            var xs = ig.system.width / 2;
            var ys = this.y;
            if (this.name) {
                this.fontTitle.draw(this.name, xs, ys - 160, ig.Font.ALIGN.CENTER);
            }
            if (this.infos.length > 0) {
                var f = this.infos.length * 20
                var tempY = ys - 70
                for (var i = 0; i < this.infos.length; i++) {
                    var t = this.infos[i].getText();
                    this.font.draw(t, xs, tempY, ig.Font.ALIGN.CENTER);
                    tempY += 30;
                }
                ys += f;
            }
            if (this.imgs.length > 0){
                for (var i = 0; i < this.imgs.length; i++) {
                    var img = this.imgs[i];
                    if (i === this.current){
                        ig.system.context.fillStyle = "#e0b21a";
                        ig.system.context.fillRect(img.pos.x-5, img.pos.y-5, img.width+10, img.height+10);
                    } else {
                        ig.system.context.fillStyle = "#000000";
                        ig.system.context.fillRect(img.pos.x-5, img.pos.y-5, img.width+10, img.height+10);
                    }
                    var thumb = new ig.Image(this.imgs[i].getImg());
                    thumb.draw(this.imgs[i].pos.x, this.imgs[i].pos.y);
                    if (!ig.game.checkEnabled(i)){
                        ig.system.context.fillStyle = "rgba(0,0,0,0.6)";
                        ig.system.context.fillRect(img.pos.x, img.pos.y, img.width, img.height);
                    }
                    var emeraldIMG = new ig.Image('media/emerald-img.png');
                    var t = ig.game.checkGems(i) + ' / ' + ig.game.emeraldTot[i];
                    emeraldIMG.draw(img.pos.x, img.pos.y + img.height + 12);
                    this.font.draw(t, img.pos.x + 40, img.pos.y + img.height + 10, ig.Font.ALIGN.LEFT);

                }
                ys += 150;
                for (var i = 0; i < this.items.length; i++) {
                    var t = this.items[i].getText();
                    if (i + this.imgs.length == this.current) {
                        this.fontSelected.draw(t, xs, ys, ig.Font.ALIGN.CENTER);
                    } else {
                        this.font.draw(t, xs, ys, ig.Font.ALIGN.CENTER);
                    }
                    ys += 30;
                }
            } else {
                for (var i = 0; i < this.items.length; i++) {
                    var t = this.items[i].getText();
                    if (i == this.current) {
                        this.fontSelected.draw(t, xs, ys, ig.Font.ALIGN.CENTER);
                    } else {
                        this.font.draw(t, xs, ys, ig.Font.ALIGN.CENTER);
                    }
                    ys += 30;
                }
            }
        }
    });
    
    MenuItemResume = MenuItem.extend({
        getText: function () {
            return 'Next Level';
        },
        ok: function () {
            ig.game.loadNextLevel();
        }
    });
    MenuItemStart = MenuItem.extend({
        getText: function () {
            return 'Start!';
        },
        ok: function () {
            ig.game.bindkeys();
            ig.game.levelSelect();
        }
    });
    MenuItemHow = MenuItem.extend({
        getText: function () {
            return 'How to play';
        },
        ok: function () {
            ig.game.toggleHelp();
        }
    });
    MenuItemBack = MenuItem.extend({
        getText: function () {
            return 'Back to Title';
        },
        ok: function () {
            ig.game.setTitle();
        }
    });
    MenuItemReturn = MenuItem.extend({
        getText: function (){
            return 'Return to Game';
        },
        ok: function (){
            ig.game.toggleInfo();
        }
    });
    HelpItem1 = Menu.extend({
        getText: function () {
            if (ig.game.device == "iPad"){
                return 'Tap the arrows on the bottom of the screen to move and jump.'
            } else {
                return 'Use the A and D keys to move and W to jump.'
            }
        }
    });
    HelpItem2 = Menu.extend({
        getText: function () {
            if (ig.game.device == "iPad"){
                return 'Tap tiles in-game to throw a new block at them!'
            } else {
                return 'Click tiles in-game to throw a new block at them!'
            }
        }
    });
    HelpItem3 = Menu.extend({
        getText: function () {
            return 'Blocks with different properties can be made by'
        }
    });
    HelpItem4 = Menu.extend({
        getText: function () {
            if (ig.game.condition == "build"){
                return 'adding and removing bonds between atoms in the atomizer.'
            } else {
                return 'selecting the structure in the atomizer.'
            }
        }
    });
    HelpItem5 = Menu.extend({
        getText: function () {
            return 'Blocks can be hard, bouncy, slippery, or a combination of each --'
        }
    });
    HelpItem6 = Menu.extend({
        getText: function () {
            if (ig.game.condition == "build"){
                return "use the Test button to see what kind of block you've made!"
            } else {
                return "block properties can be seen to the right of the atomizer!"
            }
        }
    });
    HelpItem7 = Menu.extend({
        getText: function () {
            return 'Complete each level by finding the green portal!'
        }
    });
    Level1Img = MenuImg.extend({
        getImg: function () {
            return 'media/level1thumb.png';
        },
        ok: function () {
            ig.game.startLoad(1);
        }
    });
    Level2Img = MenuImg.extend({
        getImg: function () {
            return 'media/level2thumb.png';
        },
        ok: function () {
            ig.game.startLoad(2);
        }
    });
    Level3Img = MenuImg.extend({
        getImg: function () {
            return 'media/level3thumb.png';
        },
        ok: function () {
            ig.game.startLoad(3);
        }
    });
    TitleMenu = Menu.extend({
        itemClasses: [MenuItemStart, MenuItemHow]
    });
    HelpMenu = Menu.extend({
        clearColor: 'rgba(0,0,0,1)',
        name: 'How to Play',
        infoClasses: [HelpItem1, HelpItem2, HelpItem3, HelpItem4, HelpItem5, HelpItem6, HelpItem7],
        itemClasses: [MenuItemBack]
    });
    LevelsMenu = Menu.extend({
        clearColor: 'rgba(0,0,0,1)',
        name: 'Select Level',
        infoClasses: [],
        imgClasses: [Level1Img, Level2Img, Level3Img],
        itemClasses: [MenuItemBack]
    });
    GameOverMenu = Menu.extend({
        init: function () {
            this.parent();
            this.y = ig.system.height - 40;
        },
        itemClasses: [MenuItemBack]
    });
    LevelFinishMenu = Menu.extend({
        //clearColor: 'rgba(0,0,0,0.5)',
        init: function () {
            this.parent();
            this.y = ig.system.height / 4 + 240;
        },
        itemClasses: [MenuItemResume]
    });
});