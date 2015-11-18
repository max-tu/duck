
var DucksRoasting = DucksRoasting || {};  

DucksRoasting.Game = function () {

	//	When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;		//	a reference to the currently running game
    this.add;		//	used to add sprites, text, groups, etc
    this.camera;	//	a reference to the game camera
    this.cache;		//	the game cache
    this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    this.load;		//	for preloading assets
    this.math;		//	lots of useful common math operations
    this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
    this.stage;		//	the game stage
    this.time;		//	the clock
    this.tweens;	//	the tween manager
    this.world;		//	the game world
    this.particles;	//	the particle manager
    this.physics;	//	the physics manager
    this.rnd;		//	the repeatable random number generator

    
    
  this.fireRate = 400;
  this.bulletSpeed = 800;
  this.missileSpeed = 500;
  this.nextFire = 0;
  this.scoreText = null;
  this.score = 0;
  this.scoreChangeLevel = 50 ;   
  this.playerHelth = 5;
  this.canFire = false;
  this.scoreKilledSnake = 3;
  this.scoreKilledFrog = 2;
  this.scoreKilledDuck = 1;
  this.killedSnake = 0;
  this.killedDuck = 0;
  this.killedFrog = 0;
  this.level = 1;
  this.scale = 1;
  this.fontSize = 28;
  this.speed = 250;
  this.coinSpeed = 350;
  this.speedOffset = 30;
  this.snakeSpeed = 150;
  this.snakeSpeedOffset = 20;
  this.gPaused = false;
  this.lastIncrease = 0;

  this._invulnerable = !1; 
  this.invulnerableTime = 2500;

  this.activeRocket = false;
  this.activeRocketTime = 5000;
  this.bonus_rate = 0.2;
  
};

DucksRoasting.Game.prototype = {
  
  init: function (level){  
    this.util = new Util();  

    if(level)this.level = level;
    else {
      this.level = 1;
      this.speed = 250;
      this.snakeSpeed = 150;
      this.bulletSpeed = 800;
      this.missileSpeed =500;     
      
      this.scaleSpeed = this.game.width/1600;
      this.speed = Math.floor(this.speed*this.scaleSpeed);
      this.snakeSpeed = Math.floor(this.snakeSpeed*this.scaleSpeed);
      this.bulletSpeed = Math.floor(this.bulletSpeed*this.scaleSpeed);
      this.missileSpeed = Math.floor(this.missileSpeed*this.scaleSpeed);   
            
    }
    this.fontSize = 28;
    this.scale = 1;
    if(this.game.width <1024) {      
        this.scale = this.game.width/1024;
        if(this.scale < 0.6) this.scale = 0.6;            
        this.fontSize = Math.round(this.fontSize*this.scale);
        if(this.fontSize < 15) this.fontSize = 15;      
        this.scale.toPrecision(3);
    }
    
  },

	create: function () {
    
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.stage.disableVisibilityChange = false;    
    this.stateTransition = this.game.plugins.add(new StateTransition(this.game, this));

		this.add.sprite(0, 0, 'bg');
    
    this.addSounds();    
    
    //this.hero = new BasicGame.Hero(this.game, this.world.centerX, this.game.height); 
    //this.add.existing(this.hero);
  
    //groups
    this.addPools();
    
    this.featherEmitters = this.add.group();    
    this.heros = this.add.group();
    
    this.hero_leg = this.add.sprite(this.world.centerX, this.game.height  , "hero",'bottom_body');        
    this.hero_leg.y = this.game.height-(this.game.height/3);
    this.hero_leg.anchor.set(0.5, 0);    
    this.heros.add(this.hero_leg);
    
    this.game.physics.enable(this.hero_leg, Phaser.Physics.ARCADE);
    this.hero_leg.body.bounce.set(0.5);
    
    
    this.hero_stomach = this.add.sprite(this.hero_leg.x, this.hero_leg.y , "hero",'slice2');
    this.hero_stomach.y = this.hero_stomach.y-this.hero_stomach.height;
    this.hero_stomach.anchor.set(0.5, 0);
    this.heros.add(this.hero_stomach);
    
    this.hero = new DucksRoasting.Hero(this.game, this.hero_stomach.x, this.hero_stomach.y, true); 
    this.heros.add(this.hero);
    
    var herosX = this.hero.x;
    var herosY = this.hero.y;
    this.heros.pivot.x = herosX;
    this.heros.pivot.y = herosY;
      
    this.heros.scale.x = this.scale;
    this.heros.scale.y = this.scale;
   
    this.heros.x = herosX;
    this.heros.y = herosY;
    
    this.canFire = false;
    
    /*this.levelText = this.game.add.bitmapText(this.world.centerX, -10, "minecraftia", 'LEVEL '+ this.level,  this.fontSize+10); */
    this.levelText = this.game.add.bitmapText(this.world.centerX, -10, "font", 'Start ... ',  this.fontSize+10); 
    this.levelText.x -= this.levelText.textWidth/2;
    this.levelText.alpha = 0;
    this.game.add.tween(this.levelText).to({alpha: 1, y:this.world.centerY},1000, Phaser.Easing.Elastic.InOut, true)
            .onComplete.addOnce(function (){ 
              this.levelText.destroy(); this.initGame();      
    } ,this);
    
    /* Quadratic, Back, Bounce, Circular, Cubic, Elastic, Exponential, Linear, Quadratic, Quartic, Quintic, Sinusoidal */
    
    this.scoreBoard = new ScoreBoard(this.game, this.fontSize+10);
    /*this.game.add.existing(this.scoreBoard);*/
    this.scoreBoard.continueSignal.add(function(){
      this.stateTransition.changeState('Game', this.level);
    },this );
    
     this.scoreBoard.resetSignal.add(function(){
      this.stateTransition.changeState('Game');
    },this );
    
    this.addEmitter();

    if(this.game.device.touch){      
      this.joy = new JoyTicks(this.game);

      this.joy.fireSignal.add(function (starPos, movePos){ 

      if(starPos.x === movePos.x && starPos.y === movePos.y){        
        this.hero.facingToPoint(this.game.input);      
      }
      else{
        this.hero.joyFacing(starPos, movePos);
      } 
      },this);

      this.hero.joyFireSignal.add(function(angle){          
        this.joyFire(angle,this.touchClosely());
      },this);

    }
   

    this.hero._fireSignal.add(function (){
      this.fire(this.touchClosely());
    },this);

    this.game.onBlur.add(function(){
      /*console.log('blur: ' + this.game.paused);      */
    },this);
    
    this.game.onFocus.add(function(){
      /*console.log('forcus: ' + this.game.paused);*/
      if(this.gPaused) {       
        this.game.time.events.pause();
       ;              
      }
    },this);
    this.game.onPause.add(function(){
      /*console.log('pause: ' + this.game.paused);      */
      
    },this);
    this.game.onResume.add(function(){
      /*console.log('resume: ' + this.game.paused);      */
      if(this.gPaused) {
        /*console.log('gPause: ' + this.gPaused);*/
        this.game.time.events.pause();        
      }
    },this);
    
    this.gui = new RDGUI(this.game);
    this.gui.pauseSignal.add(function(state){
      this.pauseGame(state);
    },this);
    
    this.gui.heartLabel.updateText(this.playerHelth);
    this.pauseBoard = new PauseBoard(this.game);
    
    this.lineTeam = new LineTeam(this.game);
    this.lineTeam.setGetDuckCallback(this.getDuck, this);
    //this.createLine();
    this.VTeam = new VT(this.game);
    this.VTeam.setGetDuckCallback(this.getDuck, this);
    //this.VTeam.createTeam();

    
    

	},

  touchClosely: function(){
    var isNear = false;      
    if((this.physics.arcade.distanceBetween(this.hero, this.hero.guntip)+1) >= this.physics.arcade.distanceToPointer(this.hero)) isNear = true;
    return isNear;

  },

	update: function () {		
    if(!this.gPaused){
        //if(this.game.input.activePointer.isMouse&&this.game.input.activePointer.isDown&&!this.game.input.activePointer.targetObject){              
        if(!this.game.device.touch&&this.game.input.activePointer.isDown&&!this.game.input.activePointer.targetObject){              
          this.hero.facingToPoint(this.game.input);  
        }
      /*
      this.bullets.forEachExists(function (b){
        //this.game.physics.arcade.overlap(this.ducks, b, this.bulletHitDuck, null, this);      
        this.game.physics.arcade.overlap(b, this.ducks, this.duckHit, null, this);      
      },this);*/
      
     
      this.game.physics.arcade.overlap(this.bullets, this.ducks, this.duckHit, null, this);
      this.game.physics.arcade.overlap(this.rocket_emitter, this.ducks, this.duckHit, null, this);
      //this.game.physics.arcade.collide(this.bullets, this.ducks, this.duckHit, null, this);
      
      this.game.physics.arcade.overlap(this.bullets, this.snakes, this.bulletHitSnake, null, this);
      this.game.physics.arcade.overlap(this.rocket_emitter, this.snakes, this.bulletHitSnake, null, this);
      
      this.game.physics.arcade.overlap(this.bullets, this.frogs, this.bulletHitFrog, null, this);
      this.game.physics.arcade.overlap(this.rocket_emitter, this.frogs, this.bulletHitFrog, null, this);

      if(!this._invulnerable){
        this.game.physics.arcade.overlap(this.hero, this.ducks, this.duckHitHero, null, this);
        this.game.physics.arcade.overlap(this.hero_leg, this.ducks, this.duckHitHero, null, this);
        this.game.physics.arcade.overlap(this.hero_leg, this.snakes, this.snakeHit, null, this);
        this.game.physics.arcade.overlap(this.hero_leg, this.frogs, this.frogHit, null, this);
      }
      
    }
    
    
	},
  
  render: function(){
		/*//this.game.debug.spriteBounds(this.hero.guntip);		
		
		//this.game.debug.spriteCorners(this.hero_head_open, true, true);
    this.ducks.forEachExists(function(d){
      this.game.debug.bodyInfo(d, 100,100);
    },this);*/
/*
    this.ducks.forEachExists(function(d){
      this.game.debug.spriteBounds(d);		      
    },this);*/
	},

  heroInvulnerable: function (){
    this._invulnerable = !0;
    this.herolegTween = this.game.add.tween(this.hero_leg).to( { alpha: 0}, 100, Phaser.Easing.Cubic.InOut, true,0,50,true);
    this.heroTween = this.game.add.tween(this.hero).to( { alpha: 0}, 100, Phaser.Easing.Cubic.InOut, true,0,50,true);
    this.herostomachTween = this.game.add.tween(this.hero_stomach).to( { alpha: 0}, 100, Phaser.Easing.Cubic.InOut, true,0,50,true);

    this.game.time.events.add(this.invulnerableTime, function(){
      this._invulnerable = !1;
      this.heroTween.stop(true);
      this.herolegTween.stop(true);
      this.herostomachTween.stop(true);
      this.hero.alpha = 1;
      this.hero_leg.alpha = 1;
      this.hero_stomach.alpha = 1;
    }, this);
  },

  duckBonus: function(){

    if(this.bonus_rate>= this.rnd.frac() && !this.activeRocket){
      this.activeRocket = true;
      //play sound
      this.bonusSound.play('', 0, 0.5); 
      this.game.time.events.add(this.activeRocketTime, function(){
        this.activeRocket = false;
      }, this);
    }  

  },

  levelGenerator: function (){
    var levelChange = this.level;
    var increase = this.lastIncrease;
    if(this.level < 4 && (this.killedDuck%10 === 0)) levelChange = this.killedDuck/10;
    else {      
      if((this.score-40)%this.scoreChangeLevel === 0) increase++ ;//= Math.floor((this.score-12)/this.scoreChangeLevel);    
      if(increase > this.lastIncrease) {
        levelChange++;
        this.lastIncrease = increase;
      }
    }
    
   if(levelChange > this.level) {
      this.level = levelChange;
      if(this.level <= 4) {this.speed += (this.speedOffset/2); /*this.snakeSpeed += (this.snakeSpeedOffset/2); */}    
      else {
        this.speed += this.speedOffset; 
        this.snakeSpeed += this.snakeSpeedOffset; 
      }     
      /*console.log(this.level);*/
      return 1;
    }
    return 0;
  },
  addSounds: function (){
    this.gun_fire = this.add.audio('gun_fire');
    this.explosionSound = this.add.audio('duck_explosion');
    this.duckSound = this.add.audio('duck_sound');
    this.heroHurtSound = this.add.audio('hero_hurt');
    this.scoreBoardSound = this.add.audio('scoreboardSound');
    this.scoreSound = this.add.audio('scoreSound');
    this.fallSound = this.add.audio('fallSound');
    this.popSound = this.add.audio('pop');
    this.coinSound = this.add.audio('coin');
    this.bonusSound = this.add.audio('bonus');
    this.rocketSound = this.add.audio('rocket');
    this.rocketExplosionSound = this.add.audio('explosion');
    
  },
  addPools: function (){
    this.bullets = this.add.group();
    this.ducks = this.add.group();
    this.explosions = this.add.group();
    this.roastedducks = this.add.group();
    this.snakes = this.add.group();
    this.coins = this.add.group();
    this.frogs = this.add.group();
  },
  pauseGame: function (state){
    if(state===1){      
      this.game.time.events.pause();   
      if(this.heroTween && this.heroTween.isRunning) this.heroTween.pause();      
      if(this.herolegTween &&this.herolegTween.isRunning) this.herolegTween.pause();      
      if(this.herostomachTween && this.herostomachTween.isRunning) this.herostomachTween.pause();      
      this.game.sound.pauseAll();      
      this.ducks.forEachExists(function(d){
        d.pause();
      },this);
      this.snakes.forEach(function(s){
        s.pause();
      },this,true);

      this.frogs.forEach(function(f){
        f.pause();
      },this,true);

      this.gPaused = true;
      this.hero.paused = true;
      
      this.pauseBoard.visible = !0;
      
         
    }
    else{
      
      this.gPaused = false;      
      this.game.time.events.resume();
      if(this.heroTween && this.heroTween.isPaused) this.heroTween.resume();      
      if(this.herolegTween && this.herolegTween.isPaused) this.herolegTween.resume();      
      if(this.herostomachTween && this.herostomachTween.isPaused) this.herostomachTween.resume(); 

      this.game.sound.resumeAll();
      this.ducks.forEachExists(function(d){        
        d.resume();
      },this);
      this.frogs.forEach(function(f){
        f.resume();
      },this,true);
      this.snakes.forEach(function(s){
        s.resume();
      },this,true);
      this.hero.paused = false;      
      this.pauseBoard.visible = !1;
      

    }   
    
  },
  initGame: function (){
    this.canFire = true;
    
    this.duckGenerator = this.game.time.events.add(Phaser.Timer.SECOND*1, this.generateDucks, this);    
    this.snakeGenerator = this.game.time.events.add(Phaser.Timer.SECOND*10, this.generateSnakes, this);      
    this.teamGenerator = this.game.time.events.add(Phaser.Timer.SECOND*5, this.generateTeam, this);
    //this.duckWack = this.game.time.events.add(Phaser.Timer.SECOND*this.rnd.integerInRange(15,20), this.ducWackWack, this);    
    this.game.time.events.resume();
  },

	quitGame: function (pointer) {
    console.log('quit');
	},
  shutdown: function (){
    console.log('shutdown');
    this.canFire = true;
    this.gPaused = false;
    this.activeRocket = false;

    this.score = 0;
    this.killedDuck = 0;
    this.killedSnake = 0;
    this.killedFrog = 0;
    this.playerHelth = 5;
    
    this.hero_leg.destroy();
    this.hero.destroy();
    this.hero_stomach.destroy();
    this.heros.destroy();

    this.scoreBoard.destroy();
    this.gui.destroy();
    this.lineTeam = null;
    this.VTeam = null;

    this.snakes.destroy();
    this.ducks.destroy();
    this.explosions.destroy();
    this.roastedducks.destroy();
    this.bullets.destroy();
    this.coins.destroy();
    this.frogs.destroy();

    if(this.game.device.touch){ this.joy.destroy();this.joy = null;}
    
    this.emitter.destroy();
    this.explosion_emitter.destroy();
    this.emitterHeart.destroy();
    this.rocket_emitter.destroy();
    //this.emitterCoin.destroy();
  },

  addEmitter: function (){
    this.emitter = this.add.emitter(0, 0, 50);
    this.emitter.makeParticles('misc',['feather1', 'feather2', 'feather3', 'feather4']);    
    this.emitter.setRotation(-180,180);
    this.emitter.minParticleScale = 0.7 * this.scale ;
    this.emitter.maxParticleScale  = 1 * this.scale;
    
    this.emitterHeart = this.add.emitter(0, 0);
    this.emitterHeart.makeParticles('misc','heart-burst');
    this.emitterHeart.minParticleScale = 0.8 * this.scale ;
    this.emitterHeart.maxParticleScale  = 1 * this.scale;
    
    this.explosion_emitter = this.add.emitter(0,0,15);        
    this.explosion_emitter.particleClass = EE;    
    this.explosion_emitter.makeParticles('explosion');           
    //this.explosion_emitter.minParticleScale = 0.7 * this.scale ;
    //this.explosion_emitter.maxParticleScale  = 1 * this.scale;
    this.explosion_emitter.minParticleScale = 0.4 ;
    this.explosion_emitter.maxParticleScale  = 0.7 ;
    this.explosion_emitter.gravaty = -200;

    this.rocket_emitter = this.add.emitter(0,0,150);        
    this.rocket_emitter.particleClass = Blast;    
    this.rocket_emitter.makeParticles('expl');       
    //this.rocket_emitter.minParticleScale = 0.7  ;
    //this.rocket_emitter.maxParticleScale  = 1 ;
    this.rocket_emitter.gravaty = -100;
/*
    this.emitterCoin = this.add.emitter(0, 0,150);
    this.emitterCoin.makeParticles('star');
    this.emitterCoin.minParticleScale = 0.1*this.scale;
    this.emitterCoin.maxParticleScale = 0.4*this.scale;
    this.emitterCoin.gravaty = 0;*/
    
  },
  joyFire: function(angle, near) {
    
    if (this.game.time.now > this.nextFire && this.canFire)
    {
        this.nextFire = this.game.time.now + this.fireRate;

        var bullet = null;
        var speed = null;

        //this.activeRocket = true;

        if(this.activeRocket) {
          bullet = this.getRocket(); 
          this.playSound(this.rocketSound,0,0.2);
          //if(!this.rocketSound.isPlaying){this.rocketSound.play('', 0, 0.1);}
          
          speed = this.missileSpeed;
          //bullet.eTime = this.scale;
          bullet.eTime = this.scaleSpeed;
        }
        else{
          bullet = this.getBullet();
          speed = this.bulletSpeed;
          this.playSound(this.gun_fire,0,0.1);
          //if(!this.gun_fire.isPlaying) {this.gun_fire.play('', 0, 0.1); }
          
        }
                 
        if(near)  {          
          bullet.reset(this.rounded(this.hero.x), this.rounded(this.hero.y) );
          bullet.alpha = 0;
          this.game.add.tween(bullet).to( { alpha: 1 }, 50, Phaser.Easing.Linear.None, true, 60);
        }
        else{
          bullet.reset(this.rounded(this.hero.guntip.getBounds().x), this.rounded(this.hero.guntip.getBounds().y) );
        }        
        
        bullet.rotation = angle;
        //bullet.rotation = this.game.physics.arcade.moveToPointer(bullet, speed);   
        bullet.body.velocity.x = Math.cos(bullet.rotation) *speed;
        bullet.body.velocity.y = Math.sin(bullet.rotation) *speed;

        if(bullet instanceof Missile) bullet.wob();


        //this.game.add.tween(this.hero).to( { x: this.hero.ttip.x, y :this.hero.ttipY }, 50, Phaser.Easing.Linear.None, true, 0,0, true);
        
        
    }

  },
  fire: function(near) {
    
    if (this.game.time.now > this.nextFire && this.canFire)
    {
        this.nextFire = this.game.time.now + this.fireRate;

        var bullet = null;
        var speed = null;

        //this.activeRocket = true;

        if(this.activeRocket) {
          bullet = this.getRocket(); 
          this.playSound(this.rocketSound,0,0.2);
          //if(!this.rocketSound.isPlaying){this.rocketSound.play('', 0, 0.1);}          
          speed = this.missileSpeed;
          //bullet.eTime = this.scale;
          bullet.eTime = this.scaleSpeed;
        }
        else{
          bullet = this.getBullet();
          speed = this.bulletSpeed;
          this.playSound(this.gun_fire,0,0.1);
          //if(!this.gun_fire.isPlaying) {this.gun_fire.play('', 0, 0.1); }
          
        }
                 
        if(near)  {          
          bullet.reset(this.rounded(this.hero.x), this.rounded(this.hero.y));
          
          bullet.alpha = 0;
          this.game.add.tween(bullet).to( { alpha: 1 }, 50, Phaser.Easing.Linear.None, true, 60);
        }
        else{
          bullet.reset(this.rounded(this.hero.guntip.getBounds().x), this.rounded(this.hero.guntip.getBounds().y));
          
        }        
        
        bullet.rotation = this.game.physics.arcade.moveToPointer(bullet, speed);   
        if(bullet instanceof Missile) bullet.wob();


        //this.game.add.tween(this.hero).to( { x: this.hero.ttip.x, y :this.hero.ttipY }, 50, Phaser.Easing.Linear.None, true, 0,0, true);
        
        
    }

  },

  getBullet: function(){
    var bullet = null;
    var len = this.bullets.length;
    
    if(len=== 0) {
      bullet = new Bullet(this.game, 0, 0 );
      this.bullets.add(bullet); 
      return bullet; 
    }
    
    for(var i = 0; i < len; i++){
      bullet = this.bullets.getAt(i);
      if(bullet instanceof Bullet && bullet.exists === false ) return bullet;      
    }
    
    bullet = new Bullet(this.game, 0, 0);
    this.bullets.add(bullet); 

    return bullet;
  },
  getRocket: function(){

    var rocket = null;
    var len = this.bullets.length;
    
    if(len=== 0) {
      rocket = new Missile(this.game, 0, 0); 
      this.bullets.add(rocket);
      return rocket; 
    }
    
    for(var i = 0; i < len; i++){
      rocket = this.bullets.getAt(i);
      if(rocket instanceof Missile && rocket.exists === false) return rocket;      
    }
    
    rocket = new Missile(this.game, 0, 0); 
    this.bullets.add(rocket);
    return rocket;
  },
  scaleOject:function (ob){
    ob.scale.setTo(this.scale);
  },
  
  generateDucks: function (){  
    var duck = this.getDuck();    
    duck.revive();        
    this.duckGenerator = this.game.time.events.add(Phaser.Timer.SECOND*this.rnd.realInRange(3,5), this.generateDucks, this);
    //this.duckGenerator = this.game.time.events.add(Phaser.Timer.SECOND*1, this.generateDucks, this);
    
  },
  getDuck: function(){

    
    var q = this.game.rnd.frac();
    if(q < 0.1){this.duckSound.play();}

    var duck = this.ducks.getFirstExists(false);
    if(!duck){
      duck = new Duck(this.game, 0, 0, this.util);
      /*if(this.scale < 1) this.scaleOject(duck);*/
      this.ducks.add(duck); 
    }    
    duck.speed = this.speed; 
    duck.name = '';      
    return duck;
  },
  
  collectCoin: function (limitCY){
    this.playSound(this.scoreSound);
    
    //if(!this.scoreSound.isPlaying){this.scoreSound.play();}    
    
    /*
    this.score++;
    this.gui.coinLabel.updateText(this.score);    
    */
    /*
    this.emitterCoin.y = limitCY;
    this.emitterCoin.x = this.gui.coinLabel.image.getBounds().x + this.gui.coinLabel.image.width/2;       
    this.emitterCoin.start(true, 700, null, 25); */
  },
  getCoin: function (){
  
    var coin = this.coins.getFirstExists(false);
    if(!coin){
      coin = new Coin(this.game, 0, 0, 'coin',1, this.rounded(this.gui.coinLabel.image.getBounds().y + this.gui.heartLabel.image.height/2) ) ;

      coin.setCallback(this.collectCoin, this);
      this.coins.add(coin); 
    }
    return coin;   
  },
  showCoin: function (w){
    /*
    var coin = this.getCoin();
    coin.reset(w.x, w.y);*/
    this.score++;
    this.gui.coinLabel.updateText(this.score); 
    /*
    this.game.time.events.add(500, function(){      
      this.game.physics.arcade.moveToXY(coin, 
      this.gui.coinLabel.image.getBounds().x + this.gui.heartLabel.image.width/2,
      this.gui.coinLabel.image.getBounds().y + this.gui.heartLabel.image.height/2, this.coinSpeed);
    }, this);*/
  },
  
  bulletHitDuck: function (duck, bullet){  
    
    bullet.kill();   
    
    this.showExplosion(duck.x, duck.y)    ;
    this.emmitFeather(duck,1500);

    this.KillDuckinTeam(duck);

    duck.kill();    
    
    this.showCoin(duck);
    this.playSound(this.popSound);
    //if(!this.popSound.isPlaying){this.popSound.play();}
    
    var rDuck = this.roastedducks.getFirstExists(false);
    
    if (!rDuck) {
      rDuck = new RoastedDuck(this.game, 0, 0);
      this.scaleOject(rDuck);
      this.roastedducks.add(rDuck);
    
    } 
    else rDuck.angle = 90;
    
    rDuck.reset(this.rounded(duck.x), this.rounded(duck.y));
    this.game.add.tween(rDuck).to({angle: -90},1000,Phaser.Easing.Linear.NONE, true);
    
    this.killedDuck++;
    this.gui.duckLabel.updateText(this.killedDuck);
    
    this.levelGenerator();
    
  },
  rocketBoom: function(obj, num){
    if(!num) num = 7;
    this.rocket_emitter.x = this.rounded(obj.x);
    this.rocket_emitter.y = this.rounded(obj.y);
    this.rocket_emitter.height = obj.height;
    this.rocket_emitter.width = obj.width;
    this.rocket_emitter.start(true, 2000, null, num);
    this.playSound(this.rocketExplosionSound,0,0.2);
    //if(!this.rocketExplosionSound.isPlaying){this.rocketExplosionSound.play('', 0, 0.3);}
    
  },
  duckHit: function (bullet,duck){  

    this.duckBonus();
    bullet.kill();  

    if(bullet instanceof Missile){      
      this.rocketBoom(duck);      
    }
    else{
      this.showExplosion(duck.x, duck.y)    ;

    }
    
    this.emmitFeather(duck,1500);
    this.KillDuckinTeam(duck);
    
    duck.kill();    
    
    this.showCoin(duck);
    /*this.popSound.play();*/
    var rDuck = this.roastedducks.getFirstExists(false);
    
    if (!rDuck) {
      rDuck = new RoastedDuck(this.game, 0, 0);
      this.scaleOject(rDuck);
      this.roastedducks.add(rDuck);
    
    } 
    else rDuck.angle = 90;
    
    rDuck.reset(this.rounded(duck.x), this.rounded(duck.y));
    this.game.add.tween(rDuck).to({angle: -90},1000,Phaser.Easing.Linear.NONE, true);
    
    
    //this.scoreSound.play();
    
    this.killedDuck++;
    this.gui.duckLabel.updateText(this.killedDuck);
    //this.killedDuckText.text = this.killedDuck ;
    this.levelGenerator();
    
  },
  ducWackWack: function (){
    this.duckSound.play();
    this.duckWack = this.game.time.events.add(Phaser.Timer.SECOND*this.rnd.integerInRange(15,20), this.ducWackWack, this);
  },
  
  generateSnakes: function (){
    /*var Etype = this.game.rnd.integerInRange(1,4);*/
    //this.duckSound.play();
    var Etype = this.game.rnd.frac();
    //console.log(Etype);
    if(Etype <=0.4){
      /*snake*/
      var snake = this.snakes.getFirstExists(false);
      if(!snake){
        snake = new Snake(this.game, 0, 0, this.speed);
        /*this.scaleOject(snake);*/
        this.snakes.add(snake);
      }

      snake.alpha = 1;

      snake.x = this.rounded(this.hero_leg.x);
      snake.y = this.rounded(this.hero_leg.y - this.hero_leg.height/2);
      snake.speed = this.snakeSpeed;
      snake.revive();    

    }
    else{
      /*frog*/
      var frog = this.frogs.getFirstExists(false);
      if(!frog){
        frog = new NFrog(this.game, 0,0);
        frog.basePoint = new Phaser.Point(this.rounded(this.hero.x), this.rounded(this.hero.y));
        frog.baseDistance = this.hero_leg.height;
        this.frogs.add(frog);
      }
      frog.speed = this.snakeSpeed;    
      frog.revive();

    }    
    
    this.snakeGenerator = this.game.time.events.add(Phaser.Timer.SECOND*this.rnd.realInRange(7,10), this.generateSnakes, this);
  },
  
  generateTeam: function(){

    var Etype = this.game.rnd.frac();
    
    if(Etype<=0.6){
      /*lteam*/      
      this.lineTeam.createLine();      
    }
    else {
      /*vteam*/
      this.VTeam.createTeam();
    }
    
    this.teamGenerator = this.game.time.events.add(Phaser.Timer.SECOND*this.rnd.integerInRange(8,12), this.generateTeam, this);
  },

  snakeHit: function (hero_leg, snake){
    
    this.heroHurtSound.play();
    this.playerHelth -= this.scoreKilledSnake;
    if(this.playerHelth < 0 ) this.playerHelth = 0;
    this.gui.heartLabel.updateText(this.playerHelth);   

    if(this.playerHelth <= 0 ) {

      this.canFire = false;     
    
      this.emitterHeart.x = this.rounded(hero_leg.x) ;
      this.emitterHeart.y = this.rounded(hero_leg.y);    
      this.emitterHeart.start(true, 1000, null, 50); 
      
      this.hero_stomach.kill();    
      hero_leg.y = hero_leg.y+1;
      this.game.add.tween(hero_leg)
              .to( { angle: -90},300, Phaser.Easing.Linear.None, true)
              .to( { alpha:0},200, Phaser.Easing.Linear.None, true,300)
              .start();
      
      y1 = hero_leg.y - 70;
      y2 = hero_leg.y +10;
      var hAngle = 90;
      if(snake.direction) hAngle = -90;       
      
      this.game.add.tween(this.hero)
              .to( { angle: hAngle, y: y1, x: '-15'  }, 150, Phaser.Easing.Linear.None)
              .to( { y: y2 }, 150, Phaser.Easing.Linear.None)
              .to( { alpha: 0}, 200, Phaser.Easing.Linear.None, false, 300).start() ;
         
      this.game.time.events.add(1000, this.showScoreBoard, this);
    }
    else{
      this.heroInvulnerable();
    }
        
  },
  
  frogHit: function (hero_leg, frog){
    this.playerHelth -= this.scoreKilledFrog;    
    if(this.playerHelth < 0 ) this.playerHelth = 0;    

    this.gui.heartLabel.updateText(this.playerHelth);  

    if(this.playerHelth <= 0 ) {
      this.canFire = false;         
      this.game.time.events.add(1000, this.showScoreBoard, this);
    }
    else{
      this.heroInvulnerable();
    }
  },
  
  bulletHitSnake: function (bullet, snake){
    this.game.add.tween(snake).to( { alpha: 0}, 100, Phaser.Easing.Cubic.InOut, true,0,0,true);
    
    if(bullet instanceof Missile){
        this.rocketBoom(snake, 10);
    }

    bullet.kill();
    snake.damage(1);
    
    if(snake.health <= 0){
      snake.alpha = 1;
     
      for(i=1; i <= this.scoreKilledSnake;i++){                
        this.showCoin(new Phaser.Point(Math.floor(snake.x-snake.width/2+snake.width/i) ,Math.round(snake.y)));
      }  
 /*
      this.popSound.play();*/

      this.explosion_emitter.x = this.rounded(snake.x);
      this.explosion_emitter.y = this.rounded(snake.y);
      this.explosion_emitter.width = snake.width;
      this.explosion_emitter.height = snake.height/2; 

      this.playSound(this.explosionSound);
      //if(!this.explosionSound.isPlaying) {this.explosionSound.play();}

      if(bullet instanceof Missile)  this.explosion_emitter.start(true, 1000, null, 2);                  
      else this.explosion_emitter.start(true, 1000, null, 5);            

      snake.kill();
      this.killedSnake++;      
      this.gui.snakeLabel.updateText(this.killedSnake);
      
      this.levelGenerator();
      
    }
    
  },
  bulletHitFrog: function (bullet, frog){
    bullet.kill();
    
    for(i=1; i <= this.scoreKilledFrog;i++){                
        this.showCoin(new Phaser.Point(Math.floor(frog.x-frog.width/2+(i-1)*frog.width) ,Math.round(frog.y)));
    }/*
    this.popSound.play();*/
    if(bullet instanceof Missile){
      this.rocketBoom(frog,8);
    }
    else{
      this.showExplosion(frog.x, frog.y)    ;
    }
    

    this.killedFrog++;
    this.gui.frogLabel.updateText(this.killedFrog);

    frog.kill();
  },
  KillDuckinTeam: function(duck){    
    if(duck.type == 1){      
      var prev = duck.prev;
      var target = duck.target;
      if(duck.name != 'head'){
        if(prev) {          
          prev.target = target;
          target.prev = prev;
        } 
        else {
          target.prev = null;          
        }

      }
      else {
        if(prev) {          
          prev.name = 'head';
          prev.minDistance = Math.abs(prev.width/2);          
          /*prev.target= target;*/
          prev.target = prev.generatePoint();          
        } 
        duck.name = null;

        
      }  
    }
    else if(duck.type == 2){      
      var prev = duck.prev;
      var prev2  = duck.prev2
      var target = duck.target;

      if(duck.name == 'head') {        
        if(prev){          
          prev.name = 'head' ;
          prev.minDistance = Math.abs(prev.width/2);
          /*prev.target = target; */
          prev.target = prev.generatePoint(); 

          if(prev2){
            prev2.target = prev;
            prev.prev2 = prev2;
          }
          else{
            prev.prev2 = null;
          }
          
        }
        else{          
          if(prev2){
            prev2.name = 'head' ;
            prev2.minDistance = Math.abs(prev2.width/2);
            /*prev2.target = target; */
            prev2.target = prev2.generatePoint(); ;            
          }
        }
        duck.name = '';
      }
      else{
        if(prev){
          prev.target = target;
          if(target.name === 'head' && duck.odd == false) target.prev2 = prev;
          else target.prev = prev;
        }
        else{
          if(target.name == 'head' && !duck.odd) target.prev2 = null;
          else target.prev = null;
        }
      }      

    }
    /*end type=2*/
  },
  duckHitHero: function (hero, duck){    
    this.fallSound.play();
    this.KillDuckinTeam(duck);
    duck.kill();
    this.playerHelth--;    
    if(this.playerHelth < 0 ) this.playerHelth = 0;
    this.gui.heartLabel.updateText(this.playerHelth);
    
    this.emitterHeart.x = this.rounded(this.gui.heartLabel.image.getBounds().x  + this.gui.heartLabel.image.width/2);
    this.emitterHeart.y = this.rounded(this.gui.heartLabel.image.getBounds().y + this.gui.heartLabel.image.height/2);    
    this.emitterHeart.start(true, 1000, null, 80); 
    
    this.emmitFeather(hero,1000,15);
     
    if(this.playerHelth <= 0 ) {
      this.game.time.events.add(1000, this.showScoreBoard, this);
      this.scoreBoardSound.play();     
    } 
    else{
     this.heroInvulnerable() ;
    }
  },
  
  showExplosion: function(x, y){
    var explosion = this.explosions.getFirstExists(false);
    if(!explosion){
      explosion = new Explosion(this.game, 0, 0);
      this.scaleOject(explosion);
      this.explosions.add(explosion);
    }
    
    explosion.reset(this.rounded(x), this.rounded(y));
    explosion.play('boom', 23, false, true); 
    this.playSound(this.explosionSound);
    //if(!this.explosionSound.isPlaying){this.explosionSound.play();}    
  },
  
  showScoreBoard: function (){  
    this.killDucksSnakesAlive();
    this.canFire = false;    
    this.gPaused = true;
    this.game.time.events.add(this.invulnerableTime, function (){
      this.game.time.events.pause();
      this.killDucksSnakesAlive();
    }, this);
    
    this.scoreBoard.show(this.score, this.killedDuck, this.killedSnake, this.killedFrog);
    
  },
  killDucksSnakesAlive: function (){
    this.ducks.forEachAlive(function(a){    
      this.emmitFeather(a,1500);
      a.kill();
    },this);
    this.snakes.forEachAlive(function(b){b.kill();},this);
    this.frogs.forEachAlive(function(b){b.kill();},this);
  },
  emmitFeather: function (a, time, quantity){    
    if(!quantity) quantity = 10;   
    this.emitter.x = this.rounded(a.x);
    this.emitter.y = this.rounded(a.y);    
    this.emitter.width = Math.floor(a.width*this.scale);
    this.emitter.start(true, time, null, quantity); 
  },
  playSound: function(sound, start, volume){
    start =  start || 0;
    volume = volume || 1;
    if(!sound.isPlaying) {sound.play('', start, volume);}
  },
  rounded: function(number){
    return this.util.roundBitwiseOR(number);
  }
};
