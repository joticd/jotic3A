import Phaser from "phaser";


export default class Keep {
    constructor(scene, name, x, y){
        const sprite = scene.add.image(x, y, name);
        sprite.setScale(1.2);
        sprite.setInteractive();
        this.texture = sprite;
        this.value = 1;
        this.texture.input.dropZone = true;
        this.taken = false
    }

    keepMethod(x, y, val){
        if(x == this.texture.x && y == this.texture.y){
            this.value = val;
            // return true
        } else {
            // return false
        }       return
    }
}