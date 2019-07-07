import GameScene from "./classes/game"
const config = {
    type: Phaser.AUTO,
    parent: "phaser-example",
    width: 1920,
    height: 1080,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: GameScene
};

export default config