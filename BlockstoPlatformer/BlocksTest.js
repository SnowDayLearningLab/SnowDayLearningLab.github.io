(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

var video,
  blockTracker,
  canvas,
  ctx,
  width = 800,
  height = 600,
  offsetx = 100,
  offsety = 35,
  stream = true,
  captureFlag = false,
  playing = false,
  platforms = [],
  player = {
      x : 100,
      y : 0,
      width : 5,
      height : 5,
      speed: 3,
      velX: 0,
      velY: 0,
      jumping: false,
      grounded: false,
      life: true
    },
    keys = [],
    btnLeft = {
      width: 80,
      height: 96,
      frame: 0,
      x: 0,
      y: 0
    },
    leftPressed = false,
    btnRight = {
      width: 80,
      height: 96,
      frame: 1,
      x: 0,
      y: 0
    },
    rightPressed = false,
    btnUp = {
      width: 80,
      height: 96,
      frame: 2,
      x: 0,
      y: 0
    },
    upPressed = false,
    friction = 0.8,
    gravity = 0.2;

initVars = function(){
  //video = document.getElementById('video');
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  canvas.addEventListener("mousedown", mouseDown, false);
  //canvas.addEventListener("mousemove", mouseXY, false);
  canvas.addEventListener("touchstart", touchDown, false);
  //canvas.addEventListener("touchmove", touchXY, true);
  canvas.addEventListener("touchend", touchUp, false);
  document.body.addEventListener("mouseup", mouseUp, false);
  document.body.addEventListener("touchcancel", touchUp, false);



  btnLeft.y = height - btnLeft.height;
  btnRight.x = btnLeft.width;
  btnRight.y = height - btnRight.height;
  btnUp.x = width - btnUp.width;
  btnUp.y = height - btnUp.height;
  //blockTracker = new tracking.ColorTracker(['cyan']);
  var imageLoader = document.getElementById('loadIMG');
    imageLoader.addEventListener('change', handleImage, false);
  document.body.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
  });
  document.body.addEventListener("keyup", function(e) {
    keys[e.keyCode] = false;
  });
  //initRecord();
}

// initRecord = function (){
//     var trackerTask = tracking.track('#video', blockTracker, { camera: true });
//     blockTracker.on('track', function(event) {
//       if (event.data.length == 0) {
//         //nothing detected
//       } else {
//       event.data.forEach(function(rect) {
//         if (!captureFlag){
//           if (rect.color === 'custom') {
//             rect.color = blockTracker.customColor;
//           }
//           context.clearRect(0, 0, canvas.width, canvas.height);
//           context.strokeStyle = rect.color;
//           context.strokeRect(rect.x, rect.y, rect.width, rect.height);
//           context.font = '11px Helvetica';
//           context.fillStyle = "#fff";
//           context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
//           context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
//         } else {
//           var plat = new platform(rect);
//           // context.fillStyle = rect.color;
//           // context.fillRect(rect.x, rect.y, rect.width, rect.height);
//           // context.strokeStyle = "#fff";
//           // context.strokeRect(rect.x, rect.y, rect.width, rect.height);
//           trackerTask.stop();
//           // Modify the code above to just create the objects. Then write a new function that draws those
//           // objects to a second canvas
//         }
//       });
//     }
//   });
//   initGUIControllers(blockTracker);
// }

capture = function(){
  captureFlag = true;
};

platform = function(rect){
  this.x = rect.x;
  this.y = rect.y;
  this.width = rect.width;
  this.height = rect.height;
  this.color = rect.color;
}

function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){
        var img = new Image();
        img.onload = function(){
          img.width = canvas.width
          img.height = canvas.height
            ctx.drawImage(img,0,0, img.width, img.height);
            detectPlatforms(img);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);     
}

detectPlatforms = function(img) {
  registerColors()
  var tracker = new tracking.ColorTracker(['blue', 'red', 'green', 'yellow', 'orange']);
  tracker.setMinGroupSize(1000);
  //registerColors();
  tracker.on('track', function(event) {
    event.data.forEach(function(rect) {
      //console.log('found one!');
      platforms.push(new platform(rect));
    });
  //drawPlatforms(platforms);
  });
  tracking.track(img, tracker);
};

drawPlatforms = function (plat){
  for (i=0; i<plat.length; i++){
    ctx.fillStyle = plat[i].color;
    ctx.fillRect(plat[i].x, plat[i].y, plat[i].width, plat[i].height);
  }
};

registerColors = function(){
  tracking.ColorTracker.registerColor('blue', function(r, g, b) {
    if ( r < 60 && g > 80 && g < 110 && b > 170) {
      return true;
    }
    return false;
  });
  tracking.ColorTracker.registerColor('red', function(r, g, b) {
    if (r > 200 && g < 70 && b < 70 ) {
      return true;
    }
    return false;
  });
  tracking.ColorTracker.registerColor('green', function(r, g, b) {
    if (r < 175 && r > 150 && g > 190 && b < 110 && b > 80) {
      return true;
    }
    return false;
  });
    tracking.ColorTracker.registerColor('yellow', function(r, g, b) {
    if (r > 200 && g > 200 && b < 100) {
      return true;
    }
    return false;
  });
    tracking.ColorTracker.registerColor('orange', function(r, g, b) {
    if (r > 200 && g > 100 && b < 70 ) {
      return true;
    }
    return false;
  });
};

playGame = function(){
  playing = true;
  update();
}

function update(){
  if (playing){
    //check to see if player has just died and if so, reset position
    if (!player.life) {
      player.x = 100;
      player.y = 0;
      player.life = true;
    }
    //check keys
    if (upPressed || keys[38] || keys[32]) {
        // up arrow or space
      if(!player.jumping && player.grounded){
       player.jumping = true;
       player.grounded = false;
       player.velY = -player.speed*2;
      }
    }
    if (rightPressed || keys[39]) {
        // right arrow
        if (player.velX < player.speed) {             
            player.velX++;         
         }     
    }     
    if (leftPressed || keys[37]) {         
        // left arrow         
        if (player.velX > -player.speed) {
            player.velX--;
        }
    }

    player.velX *= friction;
    player.velY += gravity;

    ctx.clearRect(0,0,width,height);
    player.grounded = false;
    drawPlatforms(platforms);
    drawButtons();
    for (var i = 0; i < platforms.length; i++) { 
        var dir = colCheck(player, platforms[i]);
        if (dir === "l" || dir === "r") {
            player.velX = 0;
            player.jumping = false;
        } else if (dir === "b") {
            player.grounded = true;
            player.jumping = false;
            //if collision on bottom, check to see if we're standing on red.
            if (ctx.getImageData(player.x, player.y+player.height+3,1,1).data[0]>250){
              player.life = false;
            }
        } else if (dir === "t") {
            player.velY *= -1;
        }
    }
    if (player.grounded){
      player.velY = 0;
    }

    if (player.y > height){
      player.life = false;
    }

    player.x += player.velX;
    player.y += player.velY;

    ctx.fillStyle = "red";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    requestAnimationFrame(update);
  }
};

function colCheck(shapeA, shapeB) {
    // get the vectors to check against
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
        vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
        // add the half widths and half heights of the objects
        hWidths = (shapeA.width / 2) + (shapeB.width / 2),
        hHeights = (shapeA.height / 2) + (shapeB.height / 2),
        colDir = null;
 
    // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {         // figures out on which side we are colliding (top, bottom, left, or right)         
      var oX = hWidths - Math.abs(vX),
          oY = hHeights - Math.abs(vY);
      if (oX >= oY) {
            if (vY > 0) {
                colDir = "t";
                shapeA.y += oY;
            } else {
                colDir = "b";
                shapeA.y -= oY;
            }
        } else {
            if (vX > 0) {
                colDir = "l";
                shapeA.x += oX;
            } else {
                colDir = "r";
                shapeA.x -= oX;
            }
        }
    }
    return colDir;
}
 
function drawButtons() {
  var img = new Image();
  img.src = "media/btnImage.png";
  // img.onload = function () {
    ctx.drawImage(img, 0, 0, btnLeft.width, btnLeft.height, btnLeft.x, btnLeft.y, btnLeft.width, btnLeft.height);
    ctx.drawImage(img, 80, 0, btnRight.width, btnRight.height, btnRight.x, btnRight.y, btnRight.width, btnRight.height);
    ctx.drawImage(img, 160, 0, btnUp.width, btnUp.height, btnUp.x, btnUp.y, btnUp.width, btnUp.height);
  // }
  // img.src = "media/btnImage.png";
}

function isPointInsideBtn(pointX,pointY){
    if ((btnLeft.x <= pointX) && (btnLeft.x + btnLeft.width >= pointX) &&
                 (btnLeft.y <= pointY) && (btnLeft.y + btnLeft.height >= pointY)){
      return "left";
    }
    if ((btnRight.x <= pointX) && (btnRight.x + btnRight.width >= pointX) &&
                 (btnRight.y <= pointY) && (btnRight.y + btnRight.height >= pointY)){
      return "right";
    }
    if ((btnUp.x <= pointX) && (btnUp.x + btnUp.width >= pointX) &&
                 (btnUp.y <= pointY) && (btnUp.y + btnUp.height >= pointY)){
      return "up";
    }
}

checkDir = function(clickLoc){
  if (clickLoc == 'left'){
      console.log('left');
      leftPressed = true;
    }
  if (clickLoc == 'right'){
    console.log('right');
    rightPressed = true;
  }
  if (clickLoc == 'up'){
    console.log('up');
    upPressed = true;
  }
}

function mouseDown(event) {
    if (playing){
    // get the mouse location
    var mx = event.pageX - offsetx;
    var my = event.pageY - offsety;
    clickLoc = isPointInsideBtn(mx, my);
    checkDir(clickLoc);
  }
}

function mouseUp(event) {
    leftPressed = false;
    rightPressed = false;
    upPressed = false;
}

function touchDown(event) {
    if (playing){
      // get the mouse location
      event.preventDefault();
      for (var i=0; i<event.changedTouches.length; i++) {
          var t = event.changedTouches[i];
          var tx = t.pageX;
          var ty = t.pageY;
          clickLoc = isPointInsideBtn(tx, ty);
          checkDir(clickLoc);       
      }
    }
}

function touchUp(event) {
    if (playing){
      if (event.touches.length == 0) {
          leftPressed = false;
          rightPressed = false;
          upPressed = false;
      }
    }
}

// window.addEventListener("load",function(){
//     update();
// });