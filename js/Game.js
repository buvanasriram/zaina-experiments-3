class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");

   // this.leadeboardTitle = createElement("h2");

  //  this.leader1 = createElement("h2");
  //  this.leader2 = createElement("h2");
    this.weaponMovingDir = null;
    this.leftKeyActive = false;
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    player1 = createSprite(width / 2 - 50, height - 100);
    player1.addImage("player1", player1_img);
    player1.scale = 0.5;

    player2 = createSprite(width / 2 + 100, height - 100);
    player2.addImage("player2", player2_img);
    player2.scale = 0.5;

    players = [player1, player2];

    weapon1 = createSprite(width / 2 - 50, height - 100);
    weapon1.addImage("weapon1", fireImage);
    weapon1.scale = 0.1;
    weapon1.visible = false;

    weapon2 = createSprite(width / 2 + 100, height - 100);
    weapon2.addImage("weapon2", bulletImage);
    weapon2.scale = 0.1;
    weapon2.visible = false;

    weapons = [weapon1, weapon2];

  //  weapon1.debug = true;
  //  weapon2.debug = true;
  //  player1.debug = true;
    player1.setCollider("rectangle", 0,0,220,300 ) //new

   // player2.debug = true;

    

    bullets = new Group();
    fires = new Group();

    obstacles = new Group();

   console.log(bulletPos)

    // Adding bullet sprite in the game
    this.addSprites(bullets, NUMBULLETS, bulletImage, 0.1, bulletPos, "bullet");//new

    // Adding coin sprite in the game
    this.addSprites(fires, NUMFIRES, fireImage, 0.1, firePos, "fire");//new

    //Adding obstacles sprite in the game
    this.addSprites(obstacles, NUMOBSTACLES, obstacleImage, 0.1, obstaclePos, "obstacle");//new

 
  }

  addSprites(spriteGroup, numberOfSprites, spriteImage, scale, pos,name) {//new
    console.log(pos);
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;

     // x = random(150, width - 150);
      //y = random(30, height - 30);
      
      //var sprite = createSprite(x, y);
      
      var sprite = createSprite(pos[i]['x'], pos[i]['y']);
      sprite.name = name+i;
      if (name=="bullet") {
        var power=pos[i].power;
        switch(power){
          case 20: sprite.addImage("sprite20", bulletImage20);
                   break;
          case 25: sprite.addImage("sprite25", bulletImage25);
                   break;
          default: sprite.addImage("sprite5", bulletImage5);
                   break;
        }   
      }
      else
      sprite.addImage("sprite", spriteImage);

      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    //C39
    this.resetTitle.html("Reset Game");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

   // this.leadeboardTitle.html("Leaderboard");
   // this.leadeboardTitle.class("resetText");
  //  this.leadeboardTitle.position(width / 3 - 60, 40);

  //  this.leader1.class("leadersText");
 //   this.leader1.position(width / 3 - 50, 80);

  //  this.leader2.class("leadersText");
   // this.leader2.position(width / 3 - 50, 130);
  }

  play() {
    this.handleElements();
    this.handleResetButton();
    this.handleDelObjects();

    Player.getPlayersInfo();
    player.getLives();
    if (player.lives <= 0){
      gameState= 2;this.gameOver(); return;
    }
    //player.getCarsAtEnd();

    if (allPlayers !== undefined) {
      //image(track, 0, -height * 5, width, height * 6);

      
     
      //this.showLeaderboard();

      //index of the array
      var index = 0;
      for (var plr in allPlayers) {
        //add 1 to the index for every loop
        index = index + 1;
        
        //new show bullets, lives and fires for both the players in both the screens
        if (index == 1) {
          stroke("white");//new
          noFill();
          textSize(15) ;
          rect(5,5,220,40);
          text(allPlayers[plr].name, 10,10);
          this.showLives(plr,10,20);
          this.showBullets(plr, 70 ,15); 
          this.showFires(plr, 170,15);
        }
        else {
          stroke("white");//new
          noFill();
          textSize(15) 
          rect(width-230,5,220,40);
          text(allPlayers[plr].name, width-230,10);
          this.showLives(plr, width-230, 20);
          this.showBullets(plr, width-230+70, 15); 
          this.showFires(plr, width-230+170, 15);
        }
        
        
        //use data form the database to display the players in x and y direction
        players[index - 1].position.x = allPlayers[plr].positionX;
        players[index - 1].position.y = allPlayers[plr].positionY;
        //show weapons in both windows
        weapons[index-1].position.x = allPlayers[plr].weaponX;
        weapons[index-1].position.y = allPlayers[plr].weaponY;

        if (weapons[index-1].x != -1000 || weapons[index-1].y != -1000)
          weapons[index-1].visible = true;
          
        stroke("red");
        textSize(25) 
        text(allPlayers[plr].name, allPlayers[plr].positionX, allPlayers[plr].positionY+50);
        if (index === player.index) {
          this.handleBullets(index);
          this.handleFires(index);
          this.handleObstacles(index);
          this.handleAttackControls(index);

          // Changing camera position in y direction
          //camera.position.y = players[index - 1].position.y;
        }
  

      }

      // handling keyboard events
      this.handlePlayerControls();

      drawSprites();
    }
  }

  handleDelObjects() { //new
    for (var i = 0; i < NUMFIRES; i++){
      if (firePos[i].visible == false) {
        var delSprite = fires.get(i);
        //fires.remove(delSprite);
        console.log("remove fire ", i)
       // delSprite.remove();
        delSprite.visible = false;
      /*  database.ref("firePos/"+ i+"/").update({
          visible: true
        });*/
      }
    }
    for (var i = 0; i < NUMOBSTACLES; i++){
      if (obstaclePos[i].visible == false) {
        var delSprite = obstacles.get(i);
        //obstacles.remove(delSprite);
        console.log("remove obst ", i)
        //delSprite.remove();
        delSprite.visible = false;
        /*database.ref("obstaclePos/"+ i+"/").update({
          visible: true
        });*/
        
      }
    }
    for (var i = 0; i < NUMBULLETS; i++){
      if (bulletPos[i].visible == false) {
        var delSprite = bullets.get(i);
       // bullets.remove(delSprite);
        console.log("remove bullet ", i)
       // delSprite.remove();
       delSprite.visible = false;
       /* database.ref("bulletPos/"+ i+"/").update({
          visible: true
        });*/
      }
    }
  }

  handleResetButton() {
    this.resetButton.mousePressed(() => {

      database.ref("/").set({
        playerCount: 0,
        gameState: 0,
        players: {}
      });
      
      //new
      for (var i = 0; i < NUMFIRES; i++) {
        var x = random(100, width-100);
        var y = random(100, height-100);
        database.ref("firePos/"+ i+"/").set({
          x: x,
          y: y,
          visible: true
        });
      }
      for (var i = 0; i < NUMOBSTACLES; i++) {
        var x = random(100, width-100);
        var y = random(100, height-100);
        database.ref("obstaclePos/"+ i+"/").set({
          x: x,
          y: y,
          visible:true
        });
      }
      for (var i = 0; i < NUMBULLETS; i++) {
        var x = random(100, width-100);
        var y = random(100, height-100);
        var p = firePower[int(random(0,firePower.length-1))]; //new2
        database.ref("bulletPos/"+ i+"/").set({
          x: x,
          y: y,
          visible:true,
          power: p //new2
        });
      }

      window.location.reload();
    });
  }

  showLives(plr, xPos, yPos) {
    push();
    image(lifeImage, xPos, yPos, 20, 20);
    fill("white");
    noStroke();
    text(allPlayers[plr].lives, xPos + 25,yPos+13);

    pop();
  }

  showBullets(plr, xPos, yPos) {
    push();
    image(bulletImage, xPos,yPos, 50, 30);
    fill("white");
    noStroke();
    text(allPlayers[plr].bullets, xPos+51,yPos+20);
    pop();
  }

  showFires(plr, xPos, yPos) {
    push();
    image(fireImage, xPos, yPos, 30, 30);
    fill("white");
    noStroke();
    text(allPlayers[plr].fires, xPos+31,30);
    pop();
  }

  showLeaderboard() {
    var leader1, leader2;
    var players = Object.values(allPlayers);
    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
      // &emsp;    This tag is used for displaying four spaces.
      leader1 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;

      leader2 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }

    if (players[1].rank === 1) {
      leader1 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;

      leader2 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }

  handlePlayerControls() {
    if (keyIsDown(DOWN_ARROW) && player.positionY < height - 15) {
      player.positionY += 5;
      player.update();
    }
    if (keyIsDown(UP_ARROW) && player.positionY >15) {
      player.positionY -= 5;
      player.update();
    }

    if (keyIsDown(LEFT_ARROW) && player.positionX > 15) {
      player.positionX -= 5;
      player.update();
      this.leftKeyActive = true;
    }

    if (keyIsDown(RIGHT_ARROW) && player.positionX < width - 15) {
      player.positionX += 5;
      player.update();
    }
  }

  handleAttackControls() {
    if ((player.index==1 && player.fires > 0) || (player.index == 2 && player.bullets > 0) ){
      if (keyDown("w") && this.weaponMovingDir== null) {
        this.weaponMovingDir = "w"; 
        player.weaponX = player.positionX;
        player.weaponY = player.positionY;   
        if (player.index == 1) player.fires--;
        else
        player.bullets--;    
      }
      if (keyDown("s")&& this.weaponMovingDir== null) {
        this.weaponMovingDir = "s";
        player.weaponX = player.positionX;
        player.weaponY = player.positionY;
        if (player.index == 1) player.fires--;
        else
        player.bullets--;
      }

      if (keyDown("a") && this.weaponMovingDir== null) {
        this.weaponMovingDir = "a";
        player.weaponX = player.positionX;
        player.weaponY = player.positionY;
        if (player.index == 1) player.fires--;
        else
        player.bullets--;
      }

      if (keyDown("d") && this.weaponMovingDir== null) {
        this.weaponMovingDir = "d";
        player.weaponX = player.positionX;
        player.weaponY = player.positionY;
        if (player.index == 1) player.fires--;
        else
        player.bullets--;
      }
      if (this.weaponMovingDir=="a") player.weaponX -=10;
      if (this.weaponMovingDir=="d") player.weaponX +=10;
      if (this.weaponMovingDir=="w") player.weaponY -=10;
      if (this.weaponMovingDir=="s") player.weaponY +=10;
      
      if (this.weaponMovingDir != null){
        weapons[player.index-1].visible = true;//new
        if (player.weaponX > width || player.weaponX < 0 || player.weaponY > height || player.weaponY < 0) {
          // weapon is done with its journey
          this.weaponMovingDir = null;
          player.weaponX = -1000;
          player.weaponY = -1000;
        }
        player.update();
      }
    }
  }

  handleBullets(index) {
    // Adding bullet
    players[index - 1].overlap(bullets, function(collector, collected) {
      if (collected.visible) {//new
        //player.bullets += 15; // later change this to different pack of bullets
        
        console.log("collected bullet= " + collected.name.substring(6));//new
        var delPos=collected.name.substring(6);//new
        player.bullets +=bulletPos[delPos].power; //new2
        player.update();
        database.ref("bulletPos/"+delPos).update({//new
          visible:false
        })

      // collected.remove();
      }
    });


    if (player.bullets <= 0) {
      gameState = 2;
      this.gameOver();
    }
  }

  handleFires(index) {
    players[index - 1].overlap(fires, function(collector, collected) {
      if (collected.visible) {//new
        player.update();
        console.log("collected fire = " + collected.name.substring(4));//new
        var delPos=collected.name.substring(4);//new
        player.fires += 5
        database.ref("firePos/"+delPos).update({//new
          visible:false
        })
      }
     // collected.remove();
    });
  }

  handleAttacks() {
   //player.index = 2, index = 1
  console.log("in handle attacks");
  /* players[player.index-1].overlap(weapons, function(player, weapon){
     weapon.visible = false;
     player.lives--;
     player.updateLives();
     console.log("player "+ player.index +  " is touched by a weapon from player " + index)
     player.update();
   });*/
   var attackWeapon;
   if (player.index ==1) attackWeapon = weapons[1];
   else
    attackWeapon = weapons[0];
  
   if (players[player.index-1].collide(attackWeapon)){
     console.log("attacked")
     player.lives--;
     player.updateLives();
   }

  }
  showRank() {
    swal({
      title: `Awesome!${"\n"}Rank${"\n"}${player.rank}`,
      text: "You reached the finish line successfully",
      imageUrl:
        "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "Ok"
    });
  }

  gameOver() {
    this.update(2);
    swal({
      title: `Game Over`,
      text: player.lives <= 0?  "Oops you lost the race....!!!":"You Won! Keep it up!",
      imageUrl:
        player.lives? "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Up_Sign_Emoji_Icon_ios10_grande.png":"https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
      imageSize: "50x50",
      confirmButtonText: "Thanks For Playing"
    });
    setTimeOut(()=>{
      database.ref("/").set({
      playerCount: 0,
      gameState: 0,
      players: {}
    });
    window.location.reload();
  }, 2000);
    
  }

  handleObstacles(index) {
    players[index - 1].overlap(obstacles, function(collector, collected) {
      if (collected.visible) {//new
        if (this.leftKeyActive) {
          player.positionX += 100;
        } else {
          player.positionX -= 100;
        }

        //Reducing Player lives
        if (player.lives > 0) {
          player.lives -= 1;
          player.update();
        }
        
        collected.addImage("blast", blastImage);
        collected.changeImage("blast")
        console.log("collected obstacle= " + collected.name.substring(8));//new
        var delPos=collected.name.substring(8);//new
        database.ref("obstaclePos/"+delPos).update({//new
          visible:false
        })
        //setTimeout(()=>{collected.remove()}, 1500);
      }
    });

    if (player.lives <=0 ) {
      gameState = 2;
      this.gameOver();
    }

  } 
}
