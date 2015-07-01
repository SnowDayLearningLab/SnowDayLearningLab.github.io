ig.module(
    'game.entities.atomizer'
)
.requires(
    'impact.entity'
    //'game.entities.inventoryitem'
)
.defines(function () {
    left: 0,
    EntityAtomizer = ig.Entity.extend({
        gravityFactor: 0,
        size: {
            x: 636,
            y: 516
        },
        zIndex: 15,
        lastBlock: 1,
        hidden: false,
        loaded: false,
        blockArray: [],
        bondArray: [],
        bondCounter: 0,
        atomsLoaded: false,
        visualizeStructure: false,
        //justLoaded: true,
        
        atomsSelected: [],
        
        animSheet: new ig.AnimationSheet('media/atomizer_sheet.png', 636, 516),
        init: function (x, y, settings) {
            // ANIMATION IS JUST A BACKGROUND IMAGE
            this.addAnim('block1', 1, [0]);
            this.addAnim('block2', 1, [1]);
            this.addAnim('block3', 1, [2]);
            this.addAnim('block4', 1, [3]);
            this.addAnim('hide', 1, [4]);
            this.player = ig.game.getEntitiesByType( EntityPlayer )[0];
            this.parent(x, y, settings);
            ig.game.sortEntitiesDeferred();
        },
        
        // If I've already been created, show me and load in the blocks
        show: function(x, y) {
            this.pos.x = x;
            this.pos.y = y;
            this.hidden = false;
            this.loadBlocks();
            this.selectAnim();
            //console.log(ig.game.getEntitiesByType( EntityAtomizer ));
            ig.game.sortEntitiesDeferred();
        },
        
        selectAnim: function(){
            var loadedBlocks = ig.game.getEntitiesByType (EntityBlocks);
            for (var i=0; i<loadedBlocks.length; i++){
                var lB = loadedBlocks[i];
                if (lB.active == true){
                    var posx = lB.pos.x - 50;
                    var posy = lB.pos.y;
                }
            }
            switch (this.lastBlock){
                case 1:
                    this.currentAnim = this.anims.block1;
                    var arrow = new ig.Image('media/atomizer_arrow1.png');
                    arrow.draw(posx, posy);
                    break;
                case 2:
                    this.currentAnim = this.anims.block2;
                    var arrow = new ig.Image('media/atomizer_arrow2.png');
                    arrow.draw(posx, posy);
                    break;
                case 3:
                    this.currentAnim = this.anims.block3;
                    var arrow = new ig.Image('media/atomizer_arrow3.png');
                    arrow.draw(posx, posy);
                    break;
                case 4:
                    this.currentAnim = this.anims.block4;
                    var arrow = new ig.Image('media/atomizer_arrow4.png');
                    arrow.draw(posx, posy);
                    break;
            }
        },
        
        // Called by the active block... loads the atoms
        // Atoms are killed and created each time we select a new block or close the atomizer
        // If we've arranged the atoms for a block previously, a block's atomArray is used to
        // clone those previous atoms.
        loadAtoms: function(lB) {
            this.atomsLoaded = false;
            if (lB.atomArray.length == 0){ // if this is the first time being loaded, create new atoms
                var x = this.pos.x + 30;
                var y = this.pos.y + 30;
                for (var i=1; i<26; i++) {
                    var relx = x - this.pos.x;
                    var rely = y - this.pos.y;
                    var newAtom = ig.game.spawnEntity ( EntityAtom, x, y, {numb: i, state:'solo', partner:[], bonds:[], relx:relx, rely:rely});
                    // if first time loading manually, fire off first tip
                    if (ig.game.tip == 1 && i == 1){
                        ig.game.loadTip(1, x + 10, y + 5);
                    }
                    if (i % 5 == 0) {  // check to see if we need to go to a new row
                        x = this.pos.x + 30;
                        y += 100;
                    } else {
                        x += 100;
                    }
                    lB.atomArray.push(newAtom); // add new atom to the block's atomarray
                }
            } else { // if we're already built these atoms, recall them using the atomArray
                if (ig.game.tip == 1){  // if the game tip got reset (closed before followed, show it again)
                        ig.game.loadTip(1, this.pos.x + 40, this.pos.y + 35);
                    }
                for (var i=0; i<lB.atomArray.length; i++){
                    var lA = lB.atomArray[i]; //lA = loadedAtom
                    // create a new atom using the array's position and state information
                    ig.game.spawnEntity (EntityAtom, lA.relx + this.pos.x, lA.rely + this.pos.y, {numb: lA.atomNumb, state:lA.state, partner:lA.partner, bonds:lA.bonds, relx:lA.relx, rely:lA.rely})
                }
            }
            this.atomsLoaded = true;
            // Repopulate the partner list and make bonds
            var atoms = ig.game.getEntitiesByType (EntityAtom)
            for (var i=0; i<atoms.length; i++){
                if (atoms[i].partner.length > 0){
                    atoms[i].findPartner(atoms);
                    atoms[i].makeBonds();
                }
            }
        },
        
        // Called by the Atomizer
        // Blocks are removed each time we close the atomizier. If this is the first time we're
        // loading the atomizer, we need to create the blocks.  Otherwise, we use the atomizer's
        // blockArray to clone the old blocks and their atomArrays
        loadBlocks: function() {
            if (!this.loaded){ // if this is the first time the atomizer is loaded
                var x = this.pos.x + this.size.x - 95;
                var y = this.pos.y + 25;
                var path; // this will be set to the appropriate block image
                var aB = false; // this will keep track of the active block
                for (var i=1; i<5; i++){  // build each of the four blocks
                    switch (i){
                        case 1:
                            path = 'media/green_blocks.png'
                            if (i == this.lastBlock){aB=true} else {aB=false} // check to see what the last block was, set to active if that's me!
                            ig.game.spawnEntity( EntityBlocks, x, y, {path:path, itemType:1, active:aB, atomArray:[], relx:x - this.pos.x, rely:y - this.pos.y} );
                            break;
                        case 2:
                            path = 'media/blue_blocks.png';
                            if (i == this.lastBlock){aB=true} else {aB=false}
                            y += 128;
                            ig.game.spawnEntity( EntityBlocks, x, y, {path:path, itemType:2, active:aB, atomArray:[], relx:x - this.pos.x, rely:y - this.pos.y} );
                            break;
                        case 3:
                            path = 'media/red_blocks.png';
                            if (i == this.lastBlock){aB=true} else {aB=false}
                            y += 128;
                            ig.game.spawnEntity( EntityBlocks, x, y, {path:path, itemType:3, active:aB, atomArray:[], relx:x - this.pos.x, rely:y - this.pos.y} );
                            break;
                        case 4:
                            path = 'media/yellow_blocks.png';
                            if (i == this.lastBlock){aB=true} else {aB=false}
                            y += 128;
                            ig.game.spawnEntity( EntityBlocks, x, y, {path:path, itemType:4, active:aB, atomArray:[], relx:x - this.pos.x, rely:y - this.pos.y} );
                            break;
                    }
                }
            } else {  // if we've been built before, use the blockArray to clone the blocks
                for (var i=0; i<this.blockArray.length; i++){
                    var cBA = this.blockArray[i];
                    // create the block using the blockArray's info...position, picture, item, active, and saved atomArray
                    ig.game.spawnEntity(EntityBlocks, cBA.relx + this.pos.x, cBA.rely +this.pos.y, {path:cBA.path, itemType:cBA.itemType, active:cBA.active, atomArray:cBA.atomArray, relx:cBA.relx, rely:cBA.rely, nbond:cBA.nbond, sbond:cBA.sbond, dbond:cBA.dbond, tbond:cBA.tbond, qbond:cBA.qbond});
                }
            }
            // after we've created the blocks, lets rebuild the blockArray
            var loadedBlocks = ig.game.getEntitiesByType (EntityBlocks);
            for (var i=0; i<loadedBlocks.length; i++){
                var lB = loadedBlocks[i];
                if (!this.loaded){ // if this is the first time we're loading, create the blockArray
                    this.blockArray.push(lB);
                }
                if (lB.active == true){ // load the atoms of the active block
                    this.loadAtoms(lB);
                }
            }
        },
        
        // keep the atomizer alive, but remove all blocks and atoms and set the animation to transparent
        unloadAtomizer: function() {
            this.saveAtomConfig(this.findActiveBlock(), 0); // save the current atom config
            this.saveBlockConfig(); // saves the block config
            this.killAtoms();
            this.killBlocks();
            this.currentAnim = this.anims.hide; // set the animation to hidden
            this.hidden = true;
        },
        
        // check to see which atom I'm selecting
        clickObjects: function (mx, my) {
            var loadedAtoms = ig.game.getEntitiesByType (EntityAtom);
            var full = false; // a flag to make sure we only select one atom
            for (var i=0; i<loadedAtoms.length; i++){
                cA = loadedAtoms[i]; // cA = currentAtom
                cA.active = false;
                if (full) break; // break if we already have one atom
                if (
                    (cA.pos.x <= mx) && (mx <= (cA.pos.x + cA.size.x)) &&
                    (cA.pos.y <= my) && (my <= (cA.pos.y + cA.size.y))
                    ){ // are we clicking on this atom?
                    cA.active = true;  // set it to active
                    cA.state = "clicked"; // show the atom
                    this.pushAtoms(cA)
                    full = true; // set the flag to true so we stop looking
                }
                //else {
                //    cA.active = false; // otherwise, set me to false
                //}
            }
            if (!full) {
                var loadedBonds = ig.game.getEntitiesByType (EntityBond);
                for (var i=0; i<loadedBonds.length; i++){
                    cB = loadedBonds[i];
                    if (
                        (cB.pos.x <= mx) && (mx <= (cB.pos.x + cB.size.x)) &&
                        (cB.pos.y <= my) && (my <= (cB.pos.y + cB.size.y))
                        ){ // are we clicking on this bond?
                        this.pullBond(cB);
                    }
                }
            }
        },
        
        // Allows selection of two atoms for bond creation in stick mode
        pushAtoms: function ( cA ) {
            var sameAtom = false; // flag in case we're still clicking on the same atom
            var dist = 1000; // big number as default since we'll look for close atoms
            var match = false; // flag in case this bond already exists
            // check to make sure we're selecting a new atom
            for (var i=0; i<this.atomsSelected.length; i++){
                if (cA.id == this.atomsSelected[i].id) {
                    sameAtom = true;
                    break;
                }
            }
            //check to make sure this bond doesn't already exist
            if (!sameAtom) {
                this.atomsSelected.push(cA); // add the atom to our two atom list for bonding
                // if we've got two atoms, make sure the bond doesn't already exist
                if (this.atomsSelected.length == 2) {
                    for (var i=0; i<this.bondArray.length; i++){
                        if (this.bondArray[i].end1.id == this.atomsSelected[0].id && this.bondArray[i].end2.id == this.atomsSelected[1].id ||
                            this.bondArray[i].end1.id == this.atomsSelected[1].id && this.bondArray[i].end2.id == this.atomsSelected[0].id) {
                            this.atomsSelected = [];
                            match = true;
                            break;
                        }
                    }
                    dist = cA.distanceTo(this.atomsSelected[0]); // find distance to new atom
                    // if this is a new bond and the new atom is in the same x or y coord (no diagonal bonds)
                    if (!match && dist < 101 && (cA.pos.x == this.atomsSelected[0].pos.x || cA.pos.y == this.atomsSelected[0].pos.y)){
                        var angle = this.atomsSelected[0].angleTo (this.atomsSelected[1]);
                        // update each atom's partner list
                        this.atomsSelected[0].partner.push(this.atomsSelected[1]);
                        this.atomsSelected[1].partner.push(this.atomsSelected[0]);
                        var bondName = (this.atomsSelected[0].atomNumb + 'and' + this.atomsSelected[1].atomNumb)
                        // create the new bond and add it to the atomizer's bond array
                        var newBond = ig.game.spawnEntity(EntityBond, this.atomsSelected[0].pos.x, this.atomsSelected[0].pos.y, {id:bondName, heading:angle, owner:this.atomsSelected[0], connected:this.atomsSelected[1]});
                        this.bondArray.push (newBond);
                        // update each atom's bond list
                        this.atomsSelected[0].bonds.push (newBond);
                        this.atomsSelected[1].bonds.push (newBond);
                        // if tip showing how to add bonds is up, remove it and
                        // load tip showing how to remove bonds
                        if (ig.game.tip == 1){
                            ig.game.unloadTip(ig.game.tip);
                            ig.game.tip = 2;
                            if (cA.pos.y == this.atomsSelected[0].pos.y) {
                                ig.game.loadTip(2, this.atomsSelected[0].pos.x + ((cA.pos.x - this.atomsSelected[0].pos.x) / 2), newBond.pos.y + 5)
                            } else {
                                ig.game.loadTip(2, newBond.pos.x + 5, this.atomsSelected[0].pos.y + ((cA.pos.y - this.atomsSelected[0].pos.y) / 2))
                            }
                        }
                        // clear atomsSelected array
                        this.atomsSelected = [];
                    } else {
                        this.atomsSelected[0].state = "solo";
                        this.atomsSelected.splice(0,1);
                    }
                }
            }
        },
        
        //Removes bond from all the various lists and then kill it
        pullBond: function (cB){
            // remove from block array
            for (var i=0; i<this.bondArray.length; i++){
                if (cB.bondName == this.bondArray[i].bondName){
                    this.bondArray.splice(i, 1);
                }
            }
            var end1 = cB.end1;
            var end2 = cB.end2;
            for (var i=0; i<end1.partner.length; i++) {
                if (end1.partner[i].atomNumb == end2.atomNumb){
                    end1.partner.splice(i, 1);
                }
            }
            for (var i=0; i<end2.partner.length; i++) {
                if (end2.partner[i].atomNumb == end1.atomNumb){
                    end2.partner.splice(i, 1);
                }
            }
            for (var i=0; i<end1.bonds.length; i++) {
                if (end1.bonds[i].bondName == cB.bondName){
                    end1.bonds.splice(i, 1);
                }
            }
            for (var i=0; i<end2.bonds.length; i++) {
                if (end2.bonds[i].bondName == cB.bondName){
                    end2.bonds.splice(i, 1);
                }
            }
            
            // remove from list of both atom's partners
            // remove from list of both atom's bonds
            this.clearStructure();
            cB.kill()
            if (ig.game.tip ==2){ //if tip to remove bond up, remove it
                ig.game.unloadTip(2);
                // trigger next tutorial (and set flag for previous one)
                ig.game.tutorial.flag[2] = false;
                ig.game.tutorial.flag[3] = true;
                ig.game.tutorial.tutNum = 3;
            }
            //this.bondCounter -= 1;
        },
        
        // checks for which block is being clicked/touched
        selectBlock: function(mx, my, cycle){
            var found = false; // a flag in case the click is out of bounds
            var loadedBlocks = ig.game.getEntitiesByType (EntityBlocks);
            
            if (cycle){
                for (var i=0; i<4; i++){
                        this.killAtoms();
                        loadedBlocks[i].active = true; // go through each block loading and killing atoms
                        this.lastBlock = loadedBlocks[i].itemType;
                        this.loadAtoms(loadedBlocks[i]);
                        this.saveAtomConfig(this.findActiveBlock(), 2); // save the current block first
                        //this.killAtoms();
                        loadedBlocks[i].active = false;
                        if (i == 3){
                            loadedBlocks[0].active = true;
                            this.lastBlock = loadedBlocks[0].itemType;
                            this.killAtoms();
                        }
                    //}
                }
            } else {
                this.saveAtomConfig(this.findActiveBlock(), 1); // save the current block first
                for (var i=0; i<loadedBlocks.length; i++){
                    var cB = loadedBlocks[i]; // cB=currentBlock
                    if ( // look to see if the mouse is over each block
                        (cB.pos.x <= mx) && (mx <= (cB.pos.x + cB.size.x)) &&
                        (cB.pos.y <= my) && (my <= (cB.pos.y + cB.size.y))
                        ){
                        //cB.active = true;  // whichever block we're over set to active
                        this.lastBlock = cB.itemType; // set this one as the "last block"
                        found = true;
                        ig.game.switchBlock(cB);
                        this.clearStructure(); // wipe the canvas drawn structure;
                        this.selectAnim();
                        //ig.game.timedSwitch(false, true);
                        //this.killAtoms(); // clear out the old atoms
                        //this.loadAtoms(cB); // load the atoms from the active block
                        //ig.game.playerController.changeImage(this.lastBlock);
                    } else {
                        cB.active = false; // if it's not this block, make sure it isn't active
                    }
                }
            }
            if (!found && !cycle) {
                this.findLastBlock();
            }
        },
        
        // Saves the atom configuration for the given block, call: 0 = close & 1 = block switch & 2 = cycle
        saveAtomConfig: function(block, call){
            var loadedAtoms = ig.game.getEntitiesByType (EntityAtom);
            block.atomArray = []; // reset the block's atom array
            for (var i=0; i<loadedAtoms.length; i++){ // load in the atom data
                block.atomArray.push(loadedAtoms[i]);
            }
            this.calcBonds(block);
            
            //LOGGING CODE
            // Turns the bond arranement into an array, and then converts the array into a string.
            // The string is created by entering a "1" each time a horizontal bond is present
            // from left to right (entire structure), then returning to the top to enter
            // vertical bonds from left to right
            ig.game.blockLog.bondEncode = this.encodeBonds().toString();
            // if call == 0, then the atomizer was closed
            if (call == 0){
                // did we make a new structure, or did we just close it with the one we had?
                if (!this.matchCheck(block, ig.game.blockLog)){
                    // id == 0 for title screen block?
                    if (ig.game.blockLog.id > 0){
                        // set the log equal to the newly created block
                        this.setEqual(ig.game.blockLog, block);
                    }
                    // makes a deep copy of the blockLog
                    var log = ig.copy(ig.game.blockLog);
                    // add time stamp and img data
                    log.time = new Date().toLocaleString();
                    //log.img = document.getElementById("canvas").toDataURL("image/jpeg", 0.2);
                    // push this block to the array
                    ig.game.logArray.push(log);
                    // incriment variables
                    ig.game.blockInUse = ig.game.logArray.length - 1;
                    ig.game.blockLog.id += 1;
                    ig.game.blockLog.made = 0;
                    
                }
            }
            //if (ig.game.loaded && call==0 || call==1){
            //    // Structure drawing
            //    var img = new Image();
            //    img.src = ig.system.canvas.toDataURL("image/png");
            //    this.structureDraw(block, img);
            //}
        },
        
        // Saves the current blockArray to the atomizer
        saveBlockConfig: function(){
            var loadedBlocks = ig.game.getEntitiesByType (EntityBlocks);
            this.blockArray = [];
            for (var i=0; i<loadedBlocks.length; i++){
                this.blockArray.push(loadedBlocks[i]);
            }
        },
        
        // Update bond information
        calcBonds: function(block){
            var atomArray = block.atomArray;
            block.nbond = 0;
            block.sbond = 0;
            block.dbond = 0;
            block.tbond = 0;
            block.qbond = 0;
            for (var i=0; i<atomArray.length; i++){
                if (atomArray[i].bonds.length == 1){
                    block.sbond += 1;
                } else if (atomArray[i].bonds.length == 2){
                    block.dbond += 1;
                } else if (atomArray[i].bonds.length == 3){
                    block.tbond += 1;
                } else if (atomArray[i].bonds.length == 4){
                    block.qbond += 1;
                } else {
                    block.nbond += 1;
                }
            }
            block.setProperties(); //use bond info to update properties of block
            
        },
        
        // Is do all the bond types match between item1 and item 2?
        matchCheck: function(i1, i2){
            if (i1.nbond == i2.nbond && i1.sbond == i2.sbond &&
                i1.dbond == i2.dbond && i1.tbond == i2.tbond &&
                i1.qbond == i2.qbond){
                return true;
            } else {
                return false;
            }
        },
        
        // Set item1 bond character equal to item2 bond character
        setEqual: function(i1, i2){
            i1.nbond = i2.nbond;
            i1.sbond = i2.sbond;
            i1.dbond = i2.dbond;
            i1.tbond = i2.tbond;
            i1.qbond = i2.qbond;
            i1.bounce = i2.bounce;
            i1.slip = i2.slip;
            i1.hardness = i2.hardness;
        },
        
        encodeBonds: function () {
            var bonds = ig.game.getEntitiesByType(EntityBond);
            var bondEncode=[];
            for (var i=1; i<25; i++){
                var match = false;
                if (i%5 == 0){
                    continue;
                }
                for (var n=0; n<bonds.length; n++){
                    if (bonds[n].bondName == (i)+'and'+(i+1)){
                        bondEncode.push(1);
                        match = true;
                        break;
                    }
                }
                if (!match){
                    bondEncode.push(0);
                }
            }
            for (var i=1; i<21; i++){
                var match = false;
                for (var n=0; n<bonds.length; n++){
                    if (bonds[n].bondName == (i)+'and'+(i+5)){
                        bondEncode.push(1);
                        match = true;
                        break;
                    }
                }
                if (!match){
                    bondEncode.push(0);
                }
            }
            return bondEncode;
        },
        
        decodeArray: function (bondEncode) {
            this.killAtoms(); // clear out the old atoms
            //find active block in bondArray and set that as "clone"
            for (var i=0;i<this.blockArray.length;i++){
                if (this.blockArray[i].itemType == this.lastBlock){
                    var clone = this.blockArray[i];
                }
            }
            //wipe the bond and partner arrays for all atoms
            for (var i=0;i<clone.atomArray.length;i++){
                var cA = clone.atomArray[i];
                cA.bonds = [];
                cA.partner = [];
            }
            //rebuild atoms
            this.loadAtoms(clone);
            //begin going through bondEncode
            for (var i=0;i<20;i++){ // first 20 in bondEncode are horiz bonds
                var n = bondEncode[i]; // n is value in bondEncode
                // if 1, then we have a bond
                if (n == 1){
                    // there is only four bonds per row for horiz bonds (first 20)
                    // for this reason the atomNumb of the two ends shifts up one after
                    // we complete each row (there's no 5and6 bond as 6 begins a new row)
                    if (i<4){a=i}
                    if (i>3 && i<8){a=(i+1)}
                    if (i>7 && i<12){a=(i+2)}
                    if (i>11 && i<16){a=(i+3)}
                    if (i>15 && i<20){a=(i+4)}
                    // set bondName, angle, and the two ends of the bond
                    var bondName = (a+1) + 'and' + (a+2);
                    var angle = 0
                    for (var x=0; x<clone.atomArray.length; x++){
                        var atom = clone.atomArray[x];
                        if (atom.atomNumb == (a+1)){
                            var end1 = atom;
                        } else if (atom.atomNumb == (a+2)){
                            var end2 = atom;
                        }
                    }
                    // create this bond and add it to the appropriate lists
                    var newBond = ig.game.spawnEntity(EntityBond, end1.pos.x, end1.pos.y, {id:bondName, heading:angle, owner:end1, connected:end2})
                    this.bondArray.push(newBond);
                    end1.bonds.push(newBond);
                    end1.partner.push(end2);
                    end2.bonds.push(newBond);
                    end2.partner.push(end1);
                }
            }
            // do the same for the vertical bonds which are the last 20 of that list
            for (var i=20;i<41;i++){
                var n = bondEncode[i]; // n is value in bondEncode
                if (n == 1){
                    // because these bonds are verticle, the bonds are between an atom in
                    // two different rows, so 1and6, 6and11, 11and16, etc
                    var bondName = (i-19) + 'and' + (i-14);
                    var angle = (Math.PI/2);
                    for (var x=0; x<clone.atomArray.length; x++){
                        var atom = clone.atomArray[x];
                        if (atom.atomNumb == (i-19)){
                            var end1 = atom;
                        } else if (atom.atomNumb == (i-14)){
                            var end2 = atom;
                        }
                    }
                    var newBond = ig.game.spawnEntity(EntityBond, end1.pos.x, end1.pos.y, {id:bondName, heading:angle, owner:end1, connected:end2})
                    this.bondArray.push(newBond);
                    end1.bonds.push(newBond);
                    end1.partner.push(end2);
                    end2.bonds.push(newBond);
                    end2.partner.push(end1);
                }
            }
            
            console.log(clone);
        },
        
        findLastBlock: function(){
            var loadedBlocks = ig.game.getEntitiesByType (EntityBlocks);
            for (var i=0; i<loadedBlocks.length; i++){
                if (this.lastBlock == loadedBlocks[i].itemType){
                    loadedBlocks[i].active = true;
                }
            }
        },
        
        // Removes all loaded atoms & bonds
        killAtoms: function(){
            var loadedAtoms = ig.game.getEntitiesByType (EntityAtom);
            var bonds = ig.game.getEntitiesByType (EntityBond);
            for (var i=0; i<loadedAtoms.length; i++){
                loadedAtoms[i].kill();
            }
            for (var i=0; i<bonds.length; i++){
                bonds[i].kill();
            }
            this.bondArray = [];
            //this.bondCounter = 0;
        },
        
        // Removes all loaded blocks
        killBlocks: function(){
            var loadedBlocks = ig.game.getEntitiesByType (EntityBlocks);
            for (var i=0; i<loadedBlocks.length; i++){
                loadedBlocks[i].kill();
            }
        },
        
        //Returns whichever block is currently set to active
        findActiveBlock: function(){
            var loadedBlocks = ig.game.getEntitiesByType (EntityBlocks);
            var active = null;
            for (var i=0; i<loadedBlocks.length; i++){
                var cB = loadedBlocks[i];
                if (cB.active) {
                    active = cB;
                    break;
                }
            }
            return active;
        },
        
        clearStructure: function(){
    	    var cvs = document.getElementById("canvasD");
    	    var ctx = cvs.getContext("2d");
    	    ctx.clearRect(0, 0, cvs.width, cvs.height);
    	}
        
        // structureDraw: function (block){
        //     var temp_canvas = document.createElement('canvas');
        //     var temp_ctx = temp_canvas.getContext('2d');
        //     temp_canvas.width = 500;
        //     temp_canvas.height = 500;
        //     var img = new Image();
        //     img.onload = function(){
        //         temp_ctx.drawImage(img, 130, 80, 500, 500, 0, 0, 500, 500);
        //         var cropImg = temp_canvas.toDataURL("image/png");
        //         var struct = ig.game.spawnEntity ( EntityStructure, ig.game.atomizer.pos.x + 20, ig.game.atomizer.pos.y + 16, {animFrame:cropImg, Tblock:this.block});
        //     }
        //     img.src = document.getElementById("canvas").toDataURL("image/png");
        //     img.block = block;
            
        // }
        

    });
});