var Duck = function (a,b,c, d){
  
  Phaser.Sprite.call(this, a, b, c, "sduck", 0);  
  this.anchor.setTo(.5, .5); 
  
  d = d || new Util();
  this.util = d;
  
  this.animations.add('flying',[0,1,2,3,4,5,4,3,2,1]);
  this.play('flying', 15, true);      
     
  this.game.physics.arcade.enableBody(this);    
  
  this.speed = 0;
  
  this.target = null;
  this.prev = null;
  this.prev2 = null;
  
  this.odd = true;  
  this.type = null;
  
  this.startX = 0; 
  this.startY = 0;
  this.endX = 0; 
  this.endY = 0;
  this.mX = 0;
  this.mY = 0;
  
  this.minDistance = 7;
  this.velocityX = 0;
  this.velocityY = 0;
  //this.level = 1;
  
  this.checkWorldBounds = !0;
  this.outOfBoundsKill = !0;               
  this.body.allowGravity = false;
  
  this.dPause = false;
  this.events.onRevived.add(this.onRevived, this);
  this.events.onKilled.add(this.onKilled, this);
  
  
};
Duck.prototype = Object.create(Phaser.Sprite.prototype);
Duck.constructor = Duck;

Duck.prototype.update = function(){
  
  if(!this.dPause && this.onZ1 && this.game.math.distance(this.x, this.y, this.mX, this.mY ) < 5 ){     
    this.game.physics.arcade.moveToXY(this, this.endX, this.endY, this.speed);
    this.startX = this.mX;    
    this.startY = this.mY;
    this.Facing();
    //this.rotateDuck();    
    this.onZ1 = false;
    
  }
  
  if(!this.dPause && this.type === 1){
    var distance = this.game.math.distance(this.x, this.y, this.target.x, this.target.y);
    this.startX = this.x;
    this.startY = this.y;
    this.endX = this.target.x;
    this.endY = this.target.y;
    if(distance > this.minDistance){      
      var rotation = this.game.math.angleBetween(this.x, this.y, this.target.x, this.target.y);
      this.body.velocity.x = Math.cos(rotation) * this.speed;
			this.body.velocity.y = Math.sin(rotation) * this.speed;
      this.rotateDuck();
    }
    else{
      if(this.name === 'head') {        
        this.target = this.util.getPoint(this.game.rnd, this.game.width, this.game.height);
        this.endX = this.target.x;
        this.endY = this.target.y;
      }
      
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
    }
  }
  if(!this.dPause && this.type == 2){
    var distance = this.game.math.distance(this.x, this.y, this.target.x, this.target.y); 
    if(this.name != 'head') {
        if(this.odd == true) { 
          distance = this.game.math.distance(this.x, this.y, this.target.x, this.target.y-this.target.height);              
        }
        else {
          distance = this.game.math.distance(this.x, this.y, this.target.x, this.target.y+this.target.height);  
        }
    }
    
    if(distance > this.minDistance){        
        var rotation = this.game.math.angleBetween(this.x, this.y, this.target.x, this.target.y);
        if(this.name != 'head') {
          if(this.odd == true) rotation = this.game.math.angleBetween(this.x, this.y, this.target.x, this.target.y - this.target.height);          
          else rotation = this.game.math.angleBetween(this.x, this.y, this.target.x, this.target.y + this.target.height);          
        }
        this.body.velocity.x = Math.cos(rotation) * this.speed;        
        this.body.velocity.y = Math.sin(rotation) * this.speed;         
        
      if(this.body.velocity.x > 0) {
          this.scale.x= this.defaultFacing();
        }
        else {
          this.scale.x = -this.defaultFacing();            
        }
      
      }
    else{
      if(this.name == 'head') {        
        this.target = this.util.getPoint(this.game.rnd, this.game.width, this.game.height);        
      }     
     this.body.velocity.x =0;
     this.body.velocity.y =0;
    }
    
  }
  
}; 
Duck.prototype.pause = function (){  
  this.animations.paused = true;
  this.velocityX = this.body.velocity.x;
  this.velocityY = this.body.velocity.y;
  this.body.velocity.x = 0;
  this.body.velocity.y = 0;
  this.dPause = true;
};
Duck.prototype.resume = function (){
  this.animations.paused = false;
  this.body.velocity.x = this.velocityX;
  this.body.velocity.y = this.velocityY;
  this.dPause = false;
};
Duck.prototype.defaultFacing = function (){
  return Math.abs(this.scale.x);
};
Duck.prototype.Facing = function (){
  this.scale.x = this.defaultFacing();
  if(this.body.velocity.x < 0 ) this.scale.x = -this.defaultFacing();
};
Duck.prototype.onKilled = function (){
  this.resetDuck();
};
Duck.prototype.resetDuck = function (){
  
  this.target = null;
  this.prev = null;
  this.prev2 = null;
  
  this.odd = true;  
  this.type = 0;
  
  this.startX = 0; 
  this.startY = 0;
  this.endX = 0; 
  this.endY = 0;
  this.mX = 0;
  this.mY = 0;
  
  this.name = null;  
  this.scale.x = this.defaultFacing();
  
  this.rotation = 0;
  this.body.velocity.x = 0;
  this.body.velocity.y = 0;
  this.outOfBoundsKill = !0;
  
};
Duck.prototype.onRevived = function (){  
  
  this.resetDuck();
  this.outOfBoundsKill = !0;
  var route = this.game.rnd.integerInRange(1,4);    
  var startFrom = this.game.rnd.integerInRange(1,4);  
  this.generateStartPoint(startFrom);
  //route  = 4 ;
  switch (route){
    case 3:      
      this.zigzagMove();
      break;
    case 4:      
      this.moveToHero();
      break;  
    case 2:      
      this.askewMove(startFrom);
      break;
    default:      
      this.straightMove(startFrom);         
  }
};
Duck.prototype.zigzagMove = function (){
  var rnd = this.game.rnd, w = this.game.width, h = this.game.height;
  this.mX = this.util.getRnd(rnd,w);
  this.mY = this.util.getRnd(rnd,h);
  this.scale.x = this.defaultFacing() ;
  if(this.startX > this.mX) {
      this.scale.x = -this.defaultFacing();      
    }
  this.reset(this.startX, this.startY); 
  this.game.physics.arcade.moveToXY(this, this.mX, this.mY, this.speed);
  this.onZ1 = true;
  var endTo = this.game.rnd.integerInRange(1,4);
  this.generateEndPoint(endTo);
  
};
Duck.prototype.moveToHero = function (){
  /*this.resetDuck();
  var startFrom = this.game.rnd.integerInRange(1,3);
  this.generateStartPoint(startFrom);*/
  this.reset(this.startX, this.startY);  
  var hero = this.game.state.getCurrentState().hero;
  this.endX = hero.x; this.endY = hero.y;
  
  this.game.physics.arcade.moveToObject(this, hero, this.speed);
  this.rotateDuck();
  
};
Duck.prototype.askewMove = function (startFrom){
  
  
    var endTo = this.game.rnd.integerInRange(1,4);
    if(endTo === startFrom) {
      endTo++;
      if (endTo > 4) endTo = 1;
    }
    
    this.generateEndPoint(endTo);    
    
    this.reset(this.startX, this.startY);  
    
    this.game.physics.arcade.moveToXY(this, this.endX, this.endY, this.speed);
   
    this.rotateDuck();
};
Duck.prototype.straightMove = function (startFrom){  
  
  var velocity = this.speed;
  var velocityX = 0;
  var velocityY = 0;
  
  this.generateStartPoint(startFrom);
  
  switch (startFrom){
    case 1:
      velocityX = velocity;      
      break;
    case 2:      
      velocityY = velocity;
      this.angle = 90;
      break;
    case 3:      
      velocityX = -velocity;
      this.scale.x = -this.defaultFacing();      
      break;
    case 4:      
      velocityY = -velocity;
      this.angle = -70;
      break;        
  }

  this.reset(this.startX, this.startY);  
  
  this.body.velocity.x = velocityX;
  this.body.velocity.y = velocityY;
 
};
Duck.prototype.generateStartPoint = function (startFrom){  
  var rnd = this.game.rnd, w = this.game.width, h = this.game.height;
  var rndH = this.util.getRnd(rnd, h);
  var rndW = this.util.getRnd(rnd, w);
  switch (startFrom){
    case 1:      
      this.startY = rndH;      
      break;
    case 2:      
      this.startX = rndW;      
      break;
    case 3:      
      this.startX = w;
      this.startY = rndH;      
      break;
    case 4:      
      this.startX = rndW;
      this.startY = h;      
      break;        
  }

};
Duck.prototype.generateEndPoint = function (endTo){  
  var rnd = this.game.rnd, w = this.game.width, h = this.game.height;
  var rndH = this.util.getRnd(rnd, h);
  var rndW = this.util.getRnd(rnd, w);

  switch (endTo){
    case 1:      
      this.endY = rndH;      
      break;
    case 2:      
      this.endX = rndW;      
      break;
    case 3:      
      this.endX = w;
      this.endY = rndH;      
      break;
    case 4:      
      this.endX = rndW;
      this.endY = h;      
      break;        
  }
};
Duck.prototype.generatePoint = function (){
  return this.util.getPoint(this.game.rnd, this.game.width, this.game.height);
};
Duck.prototype.rotateDuck = function (){
  var rotation = this.game.math.angleBetween(this.startX, this.startY, this.endX, this.endY);
  this.scale.x = this.defaultFacing();
  if(this.body.velocity.x < 0 ) {
    this.scale.x = -this.defaultFacing();
    rotation = this.game.math.angleBetween(this.endX, this.endY, this.startX, this.startY );
  } 
  this.rotation = rotation;
};

/*===============================================================*/
/*
var SDuck = function(a, b, c ) {
  
  Phaser.Sprite.call(this, a, b, c, "sduck", 0);  
  this.anchor.setTo(.5, .5);   
  
  this.target = null;
  this.prev = null;
  this.prev2 = null;
  this.odd = true;
  
  this.type = null;
  
  this.startX = 0;
  this.startY = 0;
  this.endX = 0;
  this.endY = 0;
  this.speed = 0;
  
  //this.maxSpeed = s+150;
  //this.minSpeed = s;
  
  this.velocityX = 0;
  this.velocityY = 0;
  this.level = 1;
  
  this.animations.add('sflying',[1,2,3,4,5,6,5,4,3,2]);
  this.play('sflying', 15, true);      
  
  this.game.physics.arcade.enableBody(this);  
  
  this.onZ1= false;
  this.mX =0, this.mY = 0 ;
  
  this.checkWorldBounds = !0;
  this.outOfBoundsKill = !1;               
  this.body.allowGravity = false;
  
  
  this.events.onRevived.add(this.onRevived, this);
  this.events.onKilled.add(this.onKilled, this);
};
SDuck.prototype = Object.create(Phaser.Sprite.prototype);
SDuck.constructor = SDuck;

SDuck.prototype.defaultFacing = function (){
  return Math.abs(this.scale.x);
};
SDuck.prototype.pause = function (){  
  this.animations.paused = true;
  this.velocityX = this.body.velocity.x;
  this.velocityY = this.body.velocity.y;
  this.body.velocity.x = 0;
  this.body.velocity.y = 0;
};
SDuck.prototype.resume = function (){
  this.animations.paused = false;
  this.body.velocity.x = this.velocityX;
  this.body.velocity.y = this.velocityY;
  
};

SDuck.prototype.onRevived = function (){  
  this.resetS();
  this.outOfBoundsKill = !0;
  var routeType = 4;
  //if(this.level <= 4) routeType = this.level;
  var route = this.game.rnd.integerInRange(1,routeType);  
  var startFrom = this.game.rnd.integerInRange(1,4);
  
  switch (route){
    case 3:      
      this.zigzagMove(startFrom);
      break;
    case 4:      
      this.moveToHero();
      break;  
    case 2:      
      this.askewMove(startFrom);
      break;
    default:      
      this.straightMove(startFrom);         
  } 
  
};
SDuck.prototype.onKilled = function (){
  //this.resetS();
};
SDuck.prototype.moveToHero = function(){  
  var startFrom = this.game.rnd.integerInRange(1,3);
  this.startPoint(startFrom);
  this.reset(this.startX, this.startY);  
  var hero = this.game.state.getCurrentState().hero;
  if(this.startX >= hero.x ) { this.scale.x = -this.scale.x;  }
  this.game.physics.arcade.moveToObject(this, hero, this.speed);
  
} ;
SDuck.prototype.straightMove = function(startFrom){  
  var velocity = this.speed;
  var velocityX = 0;
  var velocityY = 0;
  
  this.startPoint(startFrom);
  
  switch (startFrom){
    case 1:
      velocityX = velocity;      
      break;
    case 2:      
      velocityY = velocity;
      this.angle = 90;
      break;
    case 3:      
      velocityX = -velocity;
      this.scale.x = -this.scale.x;
      break;
    case 4:      
      velocityY = -velocity;
      this.angle = -70;
      break;        
  }
  this.reset(this.startX, this.startY);  
  
  this.body.velocity.x = velocityX;
  this.body.velocity.y = velocityY;
  
  
} ;
SDuck.prototype.askewMove = function(startFrom){
  
    this.startPoint(startFrom);
    
    var endTo = this.game.rnd.integerInRange(1,4);
    if(endTo == startFrom) {
      endTo++;
      if (endTo > 4) endTo = 1;
    }
    
    this.endPoint(endTo);    
       
    this.reset(this.startX, this.startY);  
    
      if(this.startX > this.endX ) {
    
      this.scale.x = -this.scale.x;      
    }
    
    this.game.physics.arcade.moveToXY(this, this.endX, this.endY, this.speed);
    
    
} ;
SDuck.prototype.update = function(){
  if(this.onZ1 && this.game.math.distance(this.x, this.y, this.mX, this.mY )< 2 ){
    
    this.game.physics.arcade.moveToXY(this, this.endX, this.endY, this.speed);
    this.scale.x = this.defaultFacing() ;
    if(this.mX > this.endX) {
      this.scale.x = -this.defaultFacing();      
    }
    this.onZ1 = false;
    
  }
}; 
SDuck.prototype.zigzagMove = function(startFrom){  
  
  this.startPoint(startFrom);
  this.mX = this.rndByX();
  this.mY = this.rndByY();
  this.scale.x = this.defaultFacing() ;
  if(this.startX > this.mX) {
      this.scale.x = -this.defaultFacing();      
    }
  this.reset(this.startX, this.startY); 
  this.game.physics.arcade.moveToXY(this, this.mX, this.mY, this.speed);
  this.onZ1 = true;
  var endTo = this.game.rnd.integerInRange(1,4);
  this.endPoint(endTo);  
  
} ;
SDuck.prototype.rndByY = function(){
  return this.game.rnd.integerInRange(0,this.game.height);
} ;
SDuck.prototype.rndByX = function(){
  return this.game.rnd.integerInRange(0,this.game.width);
} ;
SDuck.prototype.startPoint = function(startFrom){
  switch (startFrom){
    case 1:      
      this.startY = this.rndByY();      
      break;
    case 2:      
      this.startX = this.rndByX();      
      break;
    case 3:      
      this.startX = this.game.width;
      this.startY = this.rndByY();      
      break;
    case 4:      
      this.startX = this.rndByX();
      this.startY = this.game.height;      
      break;        
  }
  
} ;
SDuck.prototype.endPoint = function(endTo){
  switch (endTo){
    case 1:
      //console.log('left');
      this.endY = this.rndByY();      
      break;
    case 2:
      //console.log('top');            
      this.endX = this.rndByX();      
      break;
    case 3:
      //console.log('right');
      this.endX = this.game.width;
      this.endY = this.rndByY();            
      break;
    case 4:
      //console.log('bottom');
      this.endX = this.rndByX();
      this.endY = this.game.height;      
      break;        
  }
  
} ;
SDuck.prototype.resetS = function(){
  this.body.velocity.x = 0;
  this.body.velocity.y = 0;
  
  if(this.scale.x < 0 ) this.scale.x = -this.scale.x ;
  if(this.scale.y < 0 ) this.scale.y = -this.scale.y ;
  
  this.angle = 0;
  this.rotation = 0; 
  
  this.startX = 0;
  this.startY = 0;
  this.endX = 0;
  this.endY = 0;
  
  this.name = null;
  this.target = null;
  this.prev = null;
  this.type = null;
  
  this.outOfBoundsKill = !1; 
};*/

/*====================Tutorial===========================================*/
var TDuck = function(a, b, c, s ) {  
  Phaser.Sprite.call(this, a, b, c, "sduck", 0);  
  this.anchor.setTo(.5, .5);   
  this.animations.add('sflying',[1,2,3,4,5,6,5,4,3,2]);
  this.play('sflying', 15, true);  
};
TDuck.prototype = Object.create(Phaser.Sprite.prototype);
TDuck.constructor = TDuck;

/*===============================================================*/
var NFrog = function(a, b, c ) {  
  Phaser.Sprite.call(this, a, b, c, "frog", 8);
  this.anchor.setTo(.5, .5);   
  this.animations.add('right',[0,1,2,3,4,5,6,7], 8, true);
  this.animations.add('ide',[4],1,true);
  this.animations.add('left',[9,10,11,12,13,14,15,16], 8, true);
  this.checkWorldBounds = !0;
  this.outOfBoundsKill = !0;
  this.game.physics.arcade.enableBody(this);  
  this.play('ide');
  
  this.basePoint = new Phaser.Point(0,0);
  this.baseDistance = 0;
  
  this.speed = 0;
  this.startX =0;
  this.startY =0;
  this.endX = 0;
  this.endY = 0;
  this.route = 0;
  
  this.velocityX = 0;
  this.velocityY = 0;
  this.fPause = false;
  
  this.events.onRevived.add(this.onRevived, this);
  this.events.onKilled.add(this.onKilled, this);
  
};
NFrog.prototype = Object.create(Phaser.Sprite.prototype);
NFrog.constructor = NFrog;


NFrog.prototype.pause = function (){  
  this.animations.paused = true;
  this.velocityX = this.body.velocity.x;
  this.velocityY = this.body.velocity.y;
  this.body.velocity.x = 0;
  this.body.velocity.y = 0;
  this.fPause = true;
  if (this.ftween && this.ftween.isRunning) this.ftween.pause();
};
NFrog.prototype.resume = function (){
  this.animations.paused = false;
  this.body.velocity.x = this.velocityX;
  this.body.velocity.y = this.velocityY;
  this.fPause = false;
  if (this.ftween && this.ftween.isPaused) this.ftween.resume();
};
NFrog.prototype.update = function (){
  if(this.alive && this.route === 2 && this.game.math.distance(this.x, this.y, this.endX, this.endY )<=10  ){
   
    var topY = Math.floor(this.basePoint.y - 3*this.baseDistance);
    //var bottomY = Math.floor(this.basePoint.y + 3*this.baseDistance);    
    var bottomY = this.game.height;    
    
    this.endY = this.game.rnd.integerInRange(topY,bottomY);
    this.endX = this.game.rnd.integerInRange(0, this.game.width);    
    
    this.game.physics.arcade.moveToXY(this, this.endX, this.endY, this.speed);    
    
    this.directionTo(this.body.velocity.x);
    
  }
};

NFrog.prototype.onRevived = function (){
    this.route = this.game.rnd.integerInRange(1,2);
    this.route = 2;
    if(this.route == 1 ){this.crossMove();}
    else {this.freeMove();}
};
NFrog.prototype.freeMove = function (){
  var startFrom = this.game.rnd.integerInRange(1,2);
  //var topY = Math.floor(this.basePoint.y - 3*this.baseDistance);
  var topY = Math.floor(this.game.world.centerY);
  //var bottomY = Math.floor(this.basePoint.y + 3*this.baseDistance);
  var bottomY = Math.floor(this.game.height);
  this.startY = this.startY = this.game.rnd.integerInRange(topY,bottomY);
  this.endY = this.game.rnd.integerInRange(topY,bottomY);
  if(startFrom === 2) {
    this.startX = this.game.width;        
  }
  
  this.endX = this.game.rnd.integerInRange(0, this.game.width);
  this.reset(this.startX, this.startY);
  
  this.game.physics.arcade.moveToXY(this, this.endX, this.endY, this.speed);
  
  this.directionTo(this.body.velocity.x);
};
NFrog.prototype.crossMove = function (){
  var velocity = this.speed;
  var topY = Math.floor(this.basePoint.y - 2*this.baseDistance);
  var bottomY = Math.floor(this.basePoint.y + 2*this.baseDistance);
  this.startY = this.game.rnd.integerInRange(topY,bottomY);
  //this.endY = this.game.rnd.integerInRange(topY,bottomY);
  
  var startFrom = this.game.rnd.integerInRange(1,2);
  if(startFrom === 2) {
    this.startX = this.game.width;    
    velocity = -this.speed;
  }
  
  if(velocity <0 ) this.play('left');
  else if(velocity >0 ) this.play('right');
  else this.play('ide');
  
  this.reset(this.startX, this.startY);
  this.body.velocity.x = velocity;
  
  this.ftween = this.game.add.tween(this).to({y: this.y+2*this.baseDistance},2000, null, true, 0,100, true);
};
NFrog.prototype.directionTo = function (x) {
  if(x <0 ) this.play('left');
  else if(x >0 ) this.play('right');
  else this.play('ide');
};
NFrog.prototype.onKilled = function (){
  //remove velocity, stop animaiton
  this.play('ide');
  this.animations.stop('ide', false);
  this.body.velocity.x = 0;
  this.body.velocity.y = 0;
  this.startX =0;
  this.startY =0;
  this.endX = 0;
  this.endY = 0;
  this.route = 0;
  
};

var LineTeam = function (g){
  this.game = g;
  this.teamLineNum = [2,3];
 };
LineTeam.prototype = Object.create(LineTeam.prototype);
LineTeam.constructor = LineTeam;
LineTeam.prototype.setGetDuckCallback = function (a, b){
  this.getDuckCallback = a; this.getDuckCallbackContext = b;
};
LineTeam.prototype.getDuck = function (){
  return this.getDuckCallback.call(this.getDuckCallbackContext);
};
LineTeam.prototype.createLine = function (target){    
  head = this.getDuck();
  head.name = 'head';
  head.type = 1;
  head.outOfBoundsKill = !1;
  head.minDistance = head.width/2;

  var startFrom = this.game.rnd.integerInRange(1,4);
  
  head.generateStartPoint(startFrom);
  
  if(!target){
    var endTo = this.game.rnd.integerInRange(1,4);
    if(endTo === startFrom) {
      endTo++;
      if (endTo > 4) endTo = 1;
    }
    head.generateEndPoint(endTo);
    target = new Phaser.Point(head.endX, head.endY);
  }

  head.target = target;
  head.reset(head.startX, head.startY);
  //var ducks = this.teamLineNum[this.game.rnd.integerInRange(0, this.teamLineNum.length-1)];
  var ducks = this.game.rnd.pick(this.teamLineNum)-1;
  //ducks = ducks-1;
  switch (startFrom){
      case 1: this.createLineLeft(ducks, head);        
        break;
      case 2: this.createLineTop(ducks, head);        
        break;
      case 3: this.createLineRight(ducks, head);        
        break;
      case 4: this.createLineBottom(ducks, head);        
        break;
    }  
  
};
LineTeam.prototype.createLineLeft = function (ducks, head){  
  for (var i = 0; i < ducks; i++) {
    var duck = this.getDuck();
    duck.type = 1; 
    duck.outOfBoundsKill = !1;
    duck.minDistance = 1.2*duck.width;    
    duck.reset(head.x - 1.2*head.width, head.y);
    duck.target = head;    
    head.prev = duck;
    head = duck;
    
  }
};
LineTeam.prototype.createLineTop = function (ducks, head){  
  for (var i = 0; i < ducks; i++) {
    var duck = this.getDuck();
    duck.type = 1; 
    duck.outOfBoundsKill = !1;
    duck.minDistance = 1.2*duck.width;              
    duck.reset(head.x, head.y- 1.2*head.height);
    duck.target = head;
    head.prev = duck;
    head = duck;
  }
};
LineTeam.prototype.createLineRight = function (ducks, head){ 
for (var i = 0; i < ducks; i++) {
    var duck = this.getDuck();
    duck.type = 1; 
    duck.outOfBoundsKill = !1;
    duck.minDistance = 1.2*duck.width;         
    duck.reset(head.x + 1.2*head.width, head.y);
    duck.target = head;;
    head.prev = duck;
    head = duck;
  }
};
LineTeam.prototype.createLineBottom = function (ducks, head){  
  for (var i = 0; i < ducks; i++) {
    var duck = this.getDuck();
    duck.type = 1; 
    duck.outOfBoundsKill = !1;
    duck.minDistance = 1.2*duck.width;    
    duck.reset(head.x, head.y + 1.2*head.height);
    duck.target = head;;
    head.prev = duck;
    head = duck;
  }
};

var VT = function (g){
  this.game = g;
  this.teamVNum = [2,3];  
};
VT.prototype = Object.create(VT.prototype);
VT.constructor = VT;
VT.prototype.createTeam = function (target){
  
  head = this.getDuck();
  head.name = 'head';
  head.type = 2; /*VTeam*/
  head.outOfBoundsKill = !1;
  head.minDistance = head.width/2;

  var startFrom = this.game.rnd.integerInRange(1,4);
  
  head.generateStartPoint(startFrom);
  
  if(!target){
    var endTo = this.game.rnd.integerInRange(1,4);
    if(endTo === startFrom) {
      endTo++;
      if (endTo > 4) endTo = 1;
    }
    head.generateEndPoint(endTo);
    target = new Phaser.Point(head.endX, head.endY);
  }
  
  head.target = target;
  head.reset(head.startX, head.startY);
  
  var ducks = this.teamVNum[this.game.rnd.integerInRange(0, this.teamVNum.length-1)]-1;
  
  switch (startFrom){
      case 1: this.fromLeft(ducks, head);        
        break;
      case 2: this.fromTop(ducks, head);        
        break;
      case 3: this.fromRight(ducks, head);        
        break;
      case 4: this.fromBottom(ducks, head);        
        break;
    }
};
VT.prototype.setGetDuckCallback = function (a, b){
  this.getDuckCallback = a; this.getDuckCallbackContext = b;
};
VT.prototype.getDuck = function (){
  return this.getDuckCallback.call(this.getDuckCallbackContext);
};
VT.prototype.fromLeft = function (ducks, head){
  var target1= head;
  var target2= head;
  
  for(var i=1; i <= ducks; i++){
    var duck = this.getDuck();    
    duck.outOfBoundsKill = !1; 
    duck.minDistance = 1.2*duck.width;
    duck.type = 2;
    if(this.game.math.isOdd(i)){      
      
      duck.target = target1;
      target1.prev = duck;       
      duck.odd = true;
      duck.reset(target1.x - target1.width, target1.y - target1.height);      
      target1 = duck;
    }
    else{      
      duck.odd = false;
      duck.target = target2;
      if(target2.name === 'head')   target2.prev2 = duck;        
      else target2.prev = duck;
      duck.reset(target2.x - target2.width, target2.y + target2.height);
      target2 = duck;      
    }
  }
  
  
};
VT.prototype.fromTop = function (ducks, head){
  var target1= head;
  var target2= head;
  
  for(var i=0; i < ducks; i++){
    var duck = this.getDuck();
    duck.outOfBoundsKill = !1; 
    duck.minDistance = 1.2*duck.width;
    duck.type = 2;
    if(i%2 !== 0){      
      duck.target = target1;
      target1.prev = duck;
      duck.odd = true;            
      duck.reset(target1.x - target1.width, target1.y - target1.height);      
      target1 = duck;
      
    }
    else{      
      duck.odd = false;
      duck.target = target2;
      if(target2.name === 'head') target2.prev2 = duck;
      else target2.prev = duck;      
      
      duck.reset(target2.x + target2.width, target2.y - target2.height);
      target2 = duck;            
    }
    
  }
};
VT.prototype.fromRight = function (ducks, head){
  var target1= head;
  var target2= head;
  
  for(var i=0; i < ducks; i++){
    var duck = this.getDuck();
    duck.outOfBoundsKill = !1; 
    duck.type = 2;
    duck.minDistance = 1.2*duck.width;
    if(i%2 !== 0){      
      duck.target = target1;
      target1.prev = duck;
      duck.odd = true;      
      duck.reset(target1.x + target1.width, target1.y - target1.height);      
      target1 = duck;
      
    }
    else{      
      duck.odd = false;
      duck.target = target2;
      if(target2.name === 'head') target2.prev2 = duck;
      else target2.prev = duck;    
      duck.reset(target2.x + target2.width, target2.y + target2.height);
      target2 = duck;
            
    }
    
  }
};
VT.prototype.fromBottom = function (ducks, head){
  var target1= head;
  var target2= head;
  
  for(var i=0; i < ducks; i++){
    var duck = this.getDuck();
    duck.outOfBoundsKill = !1; 
    duck.type = 2;
    duck.minDistance = 1.2*duck.width;
    if(i%2 !== 0){      
      duck.target = target1;
      target1.prev = duck;
      duck.odd = true;      
      duck.reset(target1.x - target1.width, target1.y + target1.height);      
      target1 = duck;      
    }
    else{      
      duck.odd = false;
      duck.target = target2;
      if(target2.name === 'head') target2.prev2 = duck;
      else target2.prev = duck;      
      duck.reset(target2.x + target2.width, target2.y + target2.height);
      target2 = duck;            
    }
    
  }
};