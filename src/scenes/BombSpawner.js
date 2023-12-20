import Phaser from "phaser"

export default class BombSpawner {
  constructor(scene, bombKey = 'bomb') {
    this.scene = scene
    this.key = bombKey
    this._group = this.scene.physics.add.group()
  }

  get group () {
    return this._group
  }
  spawn (playerX = 0) {
    const x = (playerX < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400)//X 是一个随机数,如果playerX小于400,则X为400到800之间的随机数,否则为0到400之间的随机数
    const bomb = this.group.create(x, 16, this.key)//创建一个bomb,并添加到组中,第一个参数为x,第二个参数为y,第三个参数为key
    bomb.setBounce(1)
    bomb.setCollideWorldBounds(true)
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
    return bomb
  }
}