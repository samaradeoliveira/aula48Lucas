class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");

    this.leadeboardTitle = createElement("h2");

    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");

    this.playerMoving = false;

    this.leftKeyActive = false;

    //ativar
    //this.blast = false;
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function (data) {
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

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("careo1", car1_img);
    car1.scale = 0.07;

    //adicionar imagem de explosão ao carro
    

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("carro2", car2_img);
    car2.scale = 0.07;

   //adicionar imagem de explosão ao carro


    cars = [car1, car2];

    // C38 TA
    fuels = new Group();
    powerCoins = new Group();
    obstacle1 = new Group();
    obstacle2 = new Group();

    var obstacle1Positions = [
      {x: width/2 -150, y:height -800, image: obstacle1Img},
      {x: width/2 -180, y:height -2300, image: obstacle1Img},
      {x: width/2, y:height -2800, image: obstacle1Img},
      {x: width/2 +180, y:height -3300, image: obstacle1Img},
      {x: width/2 -180, y:height -5500, image: obstacle1Img},

    ];

    var obstacle2Positions = [
      {x: width/2 +250, y:height -3300, image: obstacle2Img},
      {x: width/2 -250, y:height -1800, image: obstacle2Img},
      {x: width/2 -180, y:height -3300, image: obstacle2Img},
      {x: width/2 -150, y:height -4300, image: obstacle2Img},
      {x: width/2, y:height -5300, image: obstacle2Img},

    ];



    // Adicione o sprite de combustível ao jogo
    this.addSprites(fuels, 4, fuelImage, 0.02);

    // Adicione o sprite de moeda ao jogo
    this.addSprites(powerCoins, 18, powerCoinImage, 0.09);

   // Adicione o sprite de moeda ao jogo
   this.addSprites(obstacle1, obstacle1Positions.length , obstacle1Img , 0.04, obstacle1Positions);

  }

  // C38 TA
  addSprites(spriteGroup, numberOfSprites, spriteImage, scale, positions = []) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;
      
      if(positions.length > 0){
        x = positions[i].x;
        y = positions[i].y;
        spriteImage = positions[i].image;
      }
      else{
      x = random(width / 2 + 150, width / 2 - 150);
      y = random(-height * 4.5, height - 400);
      }

      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);

      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    this.resetTitle.html("Reiniciar o Jogo");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

    this.leadeboardTitle.html("Placar");
    this.leadeboardTitle.class("resetText");
    this.leadeboardTitle.position(width / 3 - 60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);




  }

  play() {
    this.handleElements();
    this.handleResetButton();

    Player.getPlayersInfo();
    player.getCarsAtEnd();

    if (allPlayers !== undefined) {

      image(track, 0, -height * 5, width, height * 6);
      this.showLife();
      this.showFuelBar();
      this.showLeaderboard();


      //índice da matriz
      var index = 0;
      for (var plr in allPlayers) {
        //adicione 1 ao índice para cada loop
        index = index + 1;

        //use os dados do banco de dados para exibir os carros nas direções x e y
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        //criar variável currentLife

        //montar um if para verificação de vida e imagem de explosão



        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;


        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.handleFuel(index);
          this.handlePowerCoins(index);
          this.handleObstacleCollision(index);

          //if para verficação de vida e imagem de explosão



          camera.position.y = cars[index - 1].position.y;

        }
      }

      if(this.playerMoving){
        player.positionY += 5;
        player.update();
      }

      this.handlePlayerControls();
      //Linha de chegada
      
      const finshLine = height * 6 - 100;

      if (player.positionY > finshLine) {
        gameState = 2;
        player.rank += 1;
        Player.updateCarsAtEnd(player.rank);
        player.update();
        this.showRank();
      }


      drawSprites();
    }
  }

  handleFuel(index) {
    cars[index - 1].overlap(fuels, function (collector, collected) {
      player.fuel = 185;
      //collected (coletado) é o sprite no grupo de colecionáveis que desencadeia
      //o evento
      collected.remove();
    });


    //if que reduz o combustível
    if (player.fuel > 0 && this.playerMoving) {
      player.fuel -= 0.3;
    }


    //if verificação de gasolina 
    if (player.fuel <= 0) {
      gameState = 2;
      this.gameOver();
    }


  }

  handlePowerCoins(index) {
    cars[index - 1].overlap(powerCoins, function (collector, collected) {
      player.score += 21;
      player.update();
      //ccollected (coletado) é o sprite no grupo de colecionáveis que desencadeia
      //o evento
      collected.remove();
    });
  }


  handleResetButton() {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        playerCount: 0,
        gameState: 0,
        players: {},
        carsAtEnd: 0
      });
      window.location.reload();
    });
  }

  showLeaderboard() {
    var leader1, leader2;
    var players = Object.values(allPlayers);
    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
      // &emsp;    Essa etiqueta é usada para exibir quatro espaços.
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
    if(!this.blast){
    if (keyIsDown(UP_ARROW)) {
      this.playerMoving = true;
      player.positionY += 10;
      player.update();
    }

    if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
      this.leftKeyActive = true;
      player.positionX -= 5;
      player.update();
    }

    if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300) {
      this.leftKeyActive = false;
      player.positionX += 5;
      player.update();
    }
  }
  }

  showLife(){
    push();
    image(lifeImg, width/2 - 130, height - player.positionY - 400, 20, 20);
    fill("white");
    rect(width/2-100, height - player.positionY - 400, 185, 20);
    fill("red");
    rect(width/2-100, height - player.positionY - 400, player.life, 20);
    noStroke();
    pop();
 }

 showFuelBar(){
  push();
  image(fuelImage, width/2 - 130, height - player.positionY - 350, 20, 20);
  fill("white");
  rect(width/2-100, height - player.positionY - 350, 185, 20);
  fill("#ffc400");
  rect(width/2-100, height - player.positionY - 350, player.fuel, 20);
noStroke();
  pop();
}

handleObstacleCollision(index){
  if(cars[index-1].collide(obstacle1) || cars[index-1].collide(obstacle2)){

     //fazer a verificação da chave left para desviar o carro
     if(this.leftKeyActive){
       player.positionX += 100;
     }
     else{
        player.positionX -=100;
     }


     if(player.life > 0){
      player.life -= 185/4
     }

     player.update();

  }
}






  showRank() {
    swal({
      title: `Incrível!${"\n"}Rank${"\n"}${player.rank}`,
      text: "Você alcançou a linha de chegada com sucesso!",
      imageUrl:
        "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "Ok"
    });
  }

  //método gameOver
  gameOver() {
    swal({
      title: `Fim de Jogo`,
      text: "Oops você perdeu a corrida!",
      imageUrl:
        "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
      imageSize: "100x100",
      confirmButtonText: "Obrigado por jogar"
    });
  }



}