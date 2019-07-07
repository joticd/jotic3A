import Phaser from "phaser";


export default class NumberSprite {
   
    constructor(scene, name, x,y, val){
        const sprite = scene.add.sprite(x, y, "numbers", name)
        sprite.setScale(1.5);
        this.value = val
        this.name = name
        this.keep = false;
        this.texture = sprite
    }
    
}