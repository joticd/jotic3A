import Phaser from "phaser";
import Field from "./field";
import NumberSprite from "./number";
import Keep from "./keep";

export default class GameScene extends Phaser.Scene{
  preload() {
    this.load.image("logo", "../src/assets/logo.png");
    this.load.image("background", "../src/assets/background.png")
    this.load.image("field", "../src/assets/field.png");
    this.load.atlas("numbers", "../src/assets/numbers.png", "../src/assets/numbers.json")
  }
    
  create() {
    const xx = Number(this.game.config.width);
    const yy = Number(this.game.config.height);
    this.bottomArr = [];
    this.numberArr = [];
    this.fieldArr = [];
    this.affectedArr = [];
    this.updateBool = false; 
    
   
    this.add.image(xx/2, yy/2, "background");   
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
      (left != null) ? field.neighborhood.push(left) : null;
      (right != null) ? field.neighborhood.push(right) : null;
      (down != null) ? field.neighborhood.push(down) : null;
      (up != null) ? field.neighborhood.push(up) : null;
      this.fieldArr.push(field)  
    }    
    this.keep = new Keep(this, "field", xx/1.1, yy/1.2);    

    for (let i =2; i<21; i++){
      const name = `num${i}.png`
      const num = new NumberSprite(this, name, xx-1.1*xx, yy * 0.85, i)
      this.numberArr.push(num);
    }

    this.moveStartNumbers(this.bottomArr, this.numberArr, xx/2);
    
    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });    

    this.input.on('drop', (pointer, gameObject, dropZone) => {
      
      gameObject.x = dropZone.x;
      gameObject.y = dropZone.y;
      let lastNum = this.bottomArr[this.bottomArr.length-1];
      
      let addnumbool = true;
      let destroy = true

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
      this.fieldArr.forEach((value) => {
        value.fieldMethod(dropZone.x,dropZone.y, feildVal, this.fieldArr, this.affectedArr)
      });
      destroy?(gameObject.input.enabled = false, gameObject.destroy()):gameObject.input.enabled = true
      addnumbool?this.addNumbers(this.bottomArr, this.numberArr, xx/2):null
      
    });
    
    this.input.on('dragend', function (pointer, gameObject, dropped) {
      if (!dropped){
          gameObject.x = gameObject.input.dragStartX;
          gameObject.y = gameObject.input.dragStartY;
      }
    });
  }

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

  calc(){
    let affected = this.affectedArr;
    this.affectedArr =[];
    affected.forEach((element) => {
      this.fieldArr[element].calcField(this.fieldArr, affected)      
    })
   
  }

  update(){
    (this.affectedArr.length>0) ? this.calc() : null;
  }
}


