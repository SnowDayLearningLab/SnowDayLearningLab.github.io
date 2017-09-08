// openJSON = function (file) {
// 	$.getJSON("particles-test-export.json", function(json) {
//     		//console.log(json); // this will show the info it in firebug console
// 	})
// }

var json = (function() {
        var json = null;
        $.ajax({
            'async': false,
            'global': false,
            'url': "particles-test-export.json",
            'dataType': "json",
            'success': function (data) {
                json = data;
            }
        });
        return json;
    })();

var intvTime;

function loadUser(user, type){
	var userLogs = json.logDatabase.premade[user];
	for (i=0; i<Object.keys(userLogs).length; i++){
		var item = Object.keys(userLogs)[i];
		var levelLogs = userLogs[item].level_event;
		var blockLogs = userLogs[item].block_event;
		for (a=0; a<Object.keys(levelLogs).length; a++){
			var evtLog = Object.keys(levelLogs)[a];
			var evtType = levelLogs[evtLog].eventType;
			var lvlTime = levelLogs[evtLog].levelTimer;
			var xcor = levelLogs[evtLog].xcor;
			var ycor = levelLogs[evtLog].ycor;
			if (evtType == "level_begin" || evtType == "level_end"){
				var color = 'rgba(255, 123, 123, 1)'; //end--pink
			}
			else if (evtType == "level_gem"){
				var color = 'rgba(255, 120, 0, 1)'; //gem--orange
			}
			else {
				var color = 'rgba(255, 0, 0, .5)';	 // dead--red
			}
			heatmap(evtType, lvlTime, xcor, ycor, color);
		}
		for (b=0; b<Object.keys(blockLogs).length; b++){
			var logFlag = false;
			var evtLog = Object.keys(blockLogs)[b];
			var evtType = blockLogs[evtLog].eventType;
			var lvlTime = blockLogs[evtLog].levelTimer;
			var xcor = blockLogs[evtLog].xcor;
			var ycor = blockLogs[evtLog].ycor;
			if (type == "create" || type == "both"){
				if (evtType == "block_throw"){
					var color = 'rgba(255, 255, 0, 0.2)'; // throw--yellow
					logFlag = true;
					if (blockLogs[evtLog].hardnessValue == 10){
						color = 'rgba(255, 0, 255, .2)'; // hard -- purple
					}
					if (blockLogs[evtLog].bouncyValue >= 5){
						color = 'rgba(0, 0, 255, .5)'; // bouncy -- blue
					}
					if (blockLogs[evtLog].slipValue >= 5){
						color = 'rgba(0, 255, 0, .5)'; // slip -- green
					}
				}
				else if (evtType == "block_slip"){
					var color = 'rgba(0, 255, 0, 1)'; //slip--green
					logFlag = true;
				}
			}
			if (type == 'destroy' || type == "both"){
				if (evtType == "block_destroyed") {
					var color = 'rgba(0, 0, 0, 0.2)';  //destroy--black
					logFlag = true;
				}
			}
			if (logFlag) {
				heatmap(evtType, lvlTime, xcor, ycor, color);
			}
		}
	}
}

// function loadUserSlow(user, type) {
// 	var userLogs = json.logDatabase.premade[user];
// 	for (i=0; i<Object.keys(userLogs).length; i++){
// 		var item = Object.keys(userLogs)[i];
// 		var levelLogs = userLogs[item].level_event;
// 		var blockLogs = userLogs[item].block_event;
// 		for (a=0; a<Object.keys(levelLogs).length; a++){
// 			var evtLog = Object.keys(levelLogs)[a];
// 			var evtType = levelLogs[evtLog].eventType;
// 			var lvlTime = levelLogs[evtLog].levelTimer;
// 			var xcor = levelLogs[evtLog].xcor;
// 			var ycor = levelLogs[evtLog].ycor;
// 			if (evtType == "level_begin" || evtType == "level_end"){
// 				var color = 'rgba(255, 123, 123, 1)'; //end--pink
// 			}
// 			else if (evtType == "level_gem"){
// 				var color = 'rgba(255, 120, 0, 1)'; //gem--orange
// 			}
// 			else {
// 				var color = 'rgba(255, 0, 0, .5)';	 // dead--red
// 			}
// 			heatmap(evtType, lvlTime, xcor, ycor, color);
// 		}
// 		for (b=0; b<Object.keys(blockLogs).length; b++){
// 			intvTime = setInterval(crtEvt(blockLogs, type, b), 500);
// 		}
// 	}
// }

// function crtEvt(blockLogs, type, b){
// 		var logFlag = false;
// 		var evtLog = Object.keys(blockLogs)[b];
// 		var evtType = blockLogs[evtLog].eventType;
// 		var lvlTime = blockLogs[evtLog].levelTimer;
// 		var xcor = blockLogs[evtLog].xcor;
// 		var ycor = blockLogs[evtLog].ycor;
// 		if (type == "create" || type == "both"){
// 			if (evtType == "block_throw"){
// 				var color = 'rgba(255, 255, 0, 0.2)'; // throw--yellow
// 				logFlag = true;
// 				if (blockLogs[evtLog].hardnessValue == 10){
// 					color = 'rgba(255, 0, 255, .2)'; // hard -- purple
// 				}
// 				if (blockLogs[evtLog].bouncyValue >= 5){
// 					color = 'rgba(0, 0, 255, .5)'; // bouncy -- blue
// 				}
// 				if (blockLogs[evtLog].slipValue >= 5){
// 					color = 'rgba(0, 255, 0, .5)'; // slip -- green
// 				}
// 			}
// 			else if (evtType == "block_slip"){
// 				var color = 'rgba(0, 255, 0, 1)'; //slip--green
// 				logFlag = true;
// 			}
// 		}
// 		if (type == 'destroy' || type == "both"){
// 			if (evtType == "block_destroyed") {
// 				var color = 'rgba(0, 0, 0, 0.2)';  //destroy--black
// 				logFlag = true;
// 			}
// 		}
// 		if (logFlag) {
// 			heatmap(evtType, lvlTime, xcor, ycor, color);
// 		}
// }

// // heatmap = function (type, time, xcor, ycor){

// // }

function heatmap( type, time, targetX, targetY, color) { //zoom and moving map doesn't work!
		var tileWidth = 16;
		var tileHeight = 16;

		// tileHeight = tileHeight ? tileHeight : tileWidth;
		
		// if( !this.loaded || tileWidth > this.width || tileHeight > this.height ) { return; }
		
		var scale = ig.system.scale;
		var tileWidthScaled = Math.floor(tileWidth * scale);
		var tileHeightScaled = Math.floor(tileHeight * scale);
		
		var scaleX = 1;
		var scaleY = 1;
		
		// if( flipX || flipY ) {
		// 	ig.system.context.save();
		// 	ig.system.context.scale( scaleX, scaleY );
		// }
		ig.system.context.lineWidth = 0;
		//ig.system.context.strokeStyle = wm.config.colors.primary;
		ig.system.context.fillStyle = color;
		ig.system.context.fillRect( 
			ig.system.getDrawPos(targetX), 
			ig.system.getDrawPos(targetY),
			tileWidthScaled,
			tileHeightScaled
		);	

		// if( flipX || flipY ) {
		// 	ig.system.context.restore();
		// }
		
		// ig.Image.drawCount++;
	}