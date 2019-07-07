import Phaser from "phaser";


export default class Field {
    constructor(scene, name, x, y, index){
        const sprite = scene.add.image(x, y, name);
        sprite.setScale(1.2);
        sprite.setInteractive();
        this.value = 1;
        this.texture = sprite;
        this.neighborhood = [];
        this.texture.input.dropZone = true;
        this.holder = scene.add.sprite(x, y, "numbers", "num2.png");
        this.holder.setScale(2);
        this.holder.setVisible(false);
        this.index = index
    }
    fieldMethod(x, y, val, fieldArr, affected){
        if(x == this.texture.x && y == this.texture.y){
            this.value = val;
            this.texture.input.dropZone = false;
            const image = `num${val}.png`;
            this.holder.setTexture("numbers", image);
            this.holder.setVisible(true);
            this.calcField(fieldArr, affected)
                     
        }        
    }
    calcField(fieldArr, affected){
        const currentVal = this.value;        
        for(let i = 0; i< this.neighborhood.length; i++){
            let indexN = this.neighborhood[i];
            let nextField = fieldArr[indexN].value;
            
            if(nextField !=1 && nextField%currentVal === 0 && nextField>currentVal) {
                this.value = 1;
                this.holder.setVisible(false);
                this.texture.input.dropZone = true;
                fieldArr[indexN].value = nextField/currentVal;
                const image = `num${nextField/currentVal}.png`;                
                fieldArr[indexN].holder.setTexture("numbers", image);
                affected.push(indexN)
            }
            if(nextField !=1 && currentVal%nextField === 0 && nextField<currentVal) {                
                fieldArr[indexN].value = 1;
                fieldArr[indexN].holder.setVisible(false);
                fieldArr[indexN].texture.input.dropZone = true;
                this.value = currentVal/nextField;
                const image = `num${currentVal/nextField}.png`;
                this.holder.setTexture("numbers", image);
                affected.push(this.index)
            } 
            if(nextField !=1 && currentVal%nextField === 0 && nextField==currentVal) {                
                fieldArr[indexN].value = 1;
                fieldArr[indexN].holder.setVisible(false);
                fieldArr[indexN].texture.input.dropZone = true;
                this.value = 1;
                this.holder.setVisible(false);
                this.texture.input.dropZone = true;
            }   
            
        }
        
    }




    
}

