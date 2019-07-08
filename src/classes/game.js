import Phaser from "phaser";
import Field from "./field";
import NumberSprite from "./number";
import Keep from "./keep";

export default class GameScene extends Phaser.Scene{
  preload() {
    this.load.image("logo", "../src/assets/logo.png");
    this.load.image("background", "../src/assets/background.png")
    this.load.image("field", "../src/assets/field.png");
    this.load.image("messageBack", "../src/assets/message.png");  
    this.load.image("button", "../src/assets/button.png");   
    this.load.atlas("numbers", "../src/assets/numbers.png", "../src/assets/numbers.json")
    this.load.bitmapFont("statusFont", "../src/assets/font.png", "../src/assets/font.fnt");
  
  }
    
  create() {
    //Game dimensions
    const xx = Number(this.game.config.width); 
    const yy = Number(this.game.config.height);

    this.bottomArr = [];
    this.numberArr = [];
    this.fieldArr = [];
    this.affectedArr = [];
    this.updateBool = false;
    this.score = 0;
   
    this.add.image(xx/2, yy/2, "background"); //backgound image  
    
    //creating the fields, calculate field coordinate
    for(let i = 0; i<9; i++){ 
      let xf = xx/4 + 0.13*i*xx
      let yf = yy/6  
      let left = null
      let right = null
      let up = null
      let down = i+3;
      left = (i != 2)?i+1:null
      right = (i != 0)?i-1:null
      if(i>2 && i <6){
        xf = xx/4 + 0.13*(i-3)*xx
        yf = yy/6 + 0.13*xx
        left = (i-3 != 2)?i+1:null
        right = (i-3 != 0)?i-1:null
        down = i+3;
        up = i-3;
      }
      if(i>5){
        xf = xx/4 + 0.13*(i-6)*xx
        yf = yy/6 + 0.13*(2)*xx
        left = (i-6 != 2)?i+1:null
        right = (i-6 != 0)?i-1:null
        down = null;
        up = i-3;
      }
      const field = new Field(this, "field", xf, yf, i);

      //putting propertie in field object
      (left != null) ? field.neighborhood.push(left) : null;
      (right != null) ? field.neighborhood.push(right) : null;
      (down != null) ? field.neighborhood.push(down) : null;
      (up != null) ? field.neighborhood.push(up) : null;
      this.fieldArr.push(field)  
    }    
    this.keep = new Keep(this, "field", xx/1.1, yy/1.2);  // keep field  

    // Creating numbers
    for (let i =2; i<50; i++){
      const name = `num${i}.png`
      const num = new NumberSprite(this, name, xx-1.1*xx, yy * 0.85, i)
      this.numberArr.push(num);
    }
    
    //In game text
    const scoreText = this.add.bitmapText(xx / 2+0.2*xx, yy/2-0.45*yy , 'statusFont', 'Score: ')
    this.scoreTextVal = this.add.bitmapText(xx / 2+0.24*xx, yy/2-0.35*yy , 'statusFont', '0')
    const keepText = this.add.bitmapText(xx /2+0.37*xx, yy/1.6 , 'statusFont', 'Keep ')

    //Message 
    this.msgBckg = this.add.image(xx/2, yy/2-1000, "messageBack");
    this.msgBckg.setScale(4,4);    
    this.msgText = this.add.bitmapText(xx / 2-0.1*xx, yy/2-0.3*yy-1000 , 'statusFont', 'Your score: ')
    this.msgTextVal = this.add.bitmapText(xx / 2, yy/2-0.2*yy-1000 , 'statusFont', '0')
    this.msgButton = this.add.image(this.msgBckg.x, yy/1.35-1000, "button");
    this.msgButton.setInteractive();

    //click for new game
    this.msgButton.on('pointerdown', ()=>{
      this.scene.restart();
    }); 

    this.moveStartNumbers(this.bottomArr, this.numberArr, xx/2); 
    
    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });    

    this.input.on('drop', (pointer, gameObject, dropZone) => {
      
      gameObject.x = dropZone.x;
      gameObject.y = dropZone.y;
      let lastNum = this.bottomArr[this.bottomArr.length-1]; //moving number
      
      let addnumbool = true; //flag for adding new number
      let destroy = true // flag for destroying moving number

      //putting number on keep field
      if(gameObject.x === this.keep.texture.x && gameObject.y === this.keep.texture.y ){
        if(!this.keep.taken){
          this.keep.keepMethod(gameObject.x, gameObject.y, lastNum.value)
          gameObject.x = dropZone.x;
          gameObject.y = dropZone.y;
          this.keep.taken = true
          this.keep.texture.input.dropZone = false;
          destroy = false;
        } else {
          gameObject.x = gameObject.input.dragStartX;
          gameObject.y = gameObject.input.dragStartY
        }       
      } else{
        destroy = true;        
      }

      //putting number from keep field
      let feildVal = 1
      if(gameObject.input.dragStartX === this.keep.texture.x && 
        gameObject.input.dragStartY === this.keep.texture.y 
        ){
        this.keep.taken = false        
        this.keep.texture.input.dropZone = true; 
        feildVal = this.keep.value
        addnumbool = false
      } else {
        feildVal = lastNum.value
        addnumbool = true
      }

      //dropzone - field
      this.fieldArr.forEach((value) => {
        value.fieldMethod(dropZone.x,dropZone.y, feildVal, this.fieldArr, this.affectedArr)
      });


      destroy?(gameObject.input.enabled = false, gameObject.destroy()):gameObject.input.enabled = true
      addnumbool?this.addNumbers(this.bottomArr, this.numberArr, xx/2):null
      
      //End game condition
      let startNew = true; 
      this.fieldArr.forEach((element) => {
        (element.value==1)?(startNew=false):null
        
      })
      if(startNew){
        this.msgTextVal.setText(""+this.score)
        this.add.tween({
          targets: [this.msgBckg, this.msgText, this.msgTextVal, this.msgButton],
          duration :1000,
          y : "+=1000",
          ease:"Linear",
               
        })
      }
    });
    
    this.input.on('dragend', function (pointer, gameObject, dropped) {
      if (!dropped){
          gameObject.x = gameObject.input.dragStartX;
          gameObject.y = gameObject.input.dragStartY;
      }
    });
  }

  //random three number appearing
  moveStartNumbers (arrBot, arrNum, xx){    
    for(let i = 0; i<3; i++){
      const randomNumber = Math.floor((Math.random() * arrNum.length) );
      let removed = arrNum[randomNumber];
      arrNum.splice(randomNumber, 1)
      arrBot.push(removed)
    } 
    arrBot.forEach((value, index) => {            
      this.add.tween({
        targets: value.texture,
        duration :1000,
        x : xx+ 0.2*index*xx,
        ease:"Linear",
        onComplete : ()=>{
          const lastNum = arrBot[arrBot.length-1];
          this.add.tween({
            targets: lastNum.texture,
            duration :700,
            scaleX : 1.65,
            scaleY: 1.65,
            yoyo : true,
            ease:"Linear", 
            repeat : -1        
          })
          lastNum.texture.setInteractive({ draggable: true });
        }        
      })
    });
    
  }
  //single number appearing
  addNumbers(arrBot, arrNum, xx) {
    arrBot.pop();
    const randomNumber = Math.floor((Math.random() * arrNum.length) );
    let removed = arrNum[randomNumber];
    arrNum.splice(randomNumber, 1);
    arrBot.forEach((value, index) => {
      this.add.tween({
        targets: value.texture,
        duration :500,
        x : xx+ 0.2*(index+1)*xx,
        ease:"Linear",
             
      })
    });
    arrBot.unshift(removed);
    this.add.tween({
      targets: removed.texture,
      duration :1000,
      x : xx,
      ease:"Linear",
      onComplete : ()=>{
        const lastNum = arrBot[arrBot.length-1];
          this.add.tween({
            targets: lastNum.texture,
            duration :700,
            scaleX : 1.65,
            scaleY: 1.65,
            yoyo : true,
            ease:"Linear", 
            repeat : -1        
          })
          lastNum.texture.setInteractive({ draggable: true });
      }        
    })
  }

  //calc the score, doing math, looking for end game
  calc(){
    this.fieldArr.forEach((element) => {
      this.score = this.score+element.score;
      element.score = 0;
    })
    let affected = this.affectedArr;
    this.affectedArr =[];
    affected.forEach((element) => {
      this.fieldArr[element].calcField(this.fieldArr, affected)      
    })
    this.scoreTextVal.setText(""+this.score) 

    let startNew = true; 
    this.fieldArr.forEach((element) => {
      (element.value==1)?(startNew=false):null
      
    })
    if(startNew){
      this.msgTextVal.setText(""+this.score)
      this.add.tween({
        targets: [this.msgBckg, this.msgText, this.msgTextVal, this.msgButton],
        duration :1000,
        y : "+=1000",
        ease:"Linear",
              
      })
    }
   
  }

  update(){
    (this.affectedArr.length>0) ? this.calc() : null;
  }
}


