import Phaser from 'phaser'
import ScoreLabel from './ui/ScoreLabel'
import BombSpawner from './scenes/BombSpawner'

const GROUND_KEY = 'ground'
const DUDE_KEY = 'dude'
const STAR_KEY = 'star'
const Bomb_KEY = 'bomb'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game-scene')

    this.player = undefined
    this.cursors = undefined
    this.scoreLabel = undefined
    this.stars = undefined
    this.bombSpawner = undefined
    this.gameOver = false
  }

  preload () {
    this.load.image('sky', 'assets/sky.png')
    this.load.image(GROUND_KEY, 'assets/platform.png')
    this.load.image(STAR_KEY, 'assets/star.png')
    this.load.image(Bomb_KEY, 'assets/bomb.png')
    this.load.spritesheet(DUDE_KEY, 'assets/dude.png', { frameWidth: 32, frameHeight: 48 })//加载精灵表

  }

  create () {
    this.add.image(400, 300, 'sky')

    const platforms = this.createPlatforms()
    this.player = this.createPlayer()
    this.stars = this.createStars()//创建星星
    this.scoreLabel = this.createScoreLabel(16, 16, 0)//创建分数标签
    this.bombSpawner = new BombSpawner(this, Bomb_KEY)//创建炸弹生成器
    const bombsGroup = this.bombSpawner.group//获取炸弹组
    this.physics.add.collider(this.player, platforms)//添加碰撞检测
    this.physics.add.collider(this.stars, platforms)
    this.physics.add.collider(bombsGroup, platforms)
    this.physics.add.collider(this.player, bombsGroup, this.hitBomb, null, this)//添加碰撞检测,第一个参数为player,第二个参数为bombsGroup,第三个参数为回调函数,第四个参数为回调函数的上下文
    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this)//添加重叠检测,第一个参数为player,第二个参数为stars,第三个参数为回调函数,第四个参数为回调函数的上下文
    this.cursors = this.input.keyboard.createCursorKeys()//创建键盘监听
  }

  update () {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160)
      this.player.anims.play('left', true)
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160)
      this.player.anims.play('right', true)
    } else {
      this.player.setVelocityX(0)
      this.player.anims.play('turn')
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330)
    }
    if (this.gameOver) {
      return
    }
  }

  hitBomb (player, bomb) {
    this.physics.pause()
    player.setTint(0xff0000) //设置player的颜色
    player.anims.play('turn')
    this.gameOver = true
    this.showPlayAgainButton()
  }

  createPlatforms () {
    const platforms = this.physics.add.staticGroup()//创建一个静态组
    platforms.create(400, 568, GROUND_KEY).setScale(2).refreshBody()//创建一个地面,并设置缩放,刷新body
    platforms.create(600, 400, GROUND_KEY)
    platforms.create(50, 250, GROUND_KEY)
    platforms.create(750, 220, GROUND_KEY)

    return platforms
  }

  createPlayer () {
    const player = this.physics.add.sprite(100, 450, DUDE_KEY) //添加一个精灵
    player.setBounce(0.2)//设置弹跳值
    player.setCollideWorldBounds(true)//设置碰撞世界边界


    //定义精灵动画，key为动画名称，frames为动画帧，frameRate为帧率，repeat为重复次数
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1 //无限循环播放
    })

    this.anims.create({
      key: 'turn',
      frames: [{ key: DUDE_KEY, frame: 4 }],
      frameRate: 20
    })
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    })

    return player
  }

  createStars () {
    const stars = this.physics.add.group({
      key: STAR_KEY,
      repeat: 11, //重复创建的次数,最终的数量是12个
      setXY: { x: 12, y: 0, stepX: 70 }//设置每个星星的位置,stepX为间隔
    })
    stars.children.iterate(child => {
      // @ts-ignore
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))//设置弹跳值
    })
    return stars
  }

  collectStar (player, star) {
    star.disableBody(true, true)//禁用星星的body
    this.scoreLabel.add(10)//分数+10
    if (this.stars.countActive(true) === 0) {//如果没有星星了
      this.stars.children.iterate(child => {//遍历所有星星
        // @ts-ignore
        child.enableBody(true, child.x, 0, true, true)//启用星星的body,child.x为x坐标,0为y坐标
      })
      this.bombSpawner.spawn(player.x)//生成一个炸弹
    }
  }

  createScoreLabel (x, y, score) {
    const style = { fontSize: '32px', fill: '#000' }
    const label = new ScoreLabel(this, x, y, score, style)//创建分数标签
    this.add.existing(label)//添加到场景中
    return label
  }

  showPlayAgainButton () {
    // @ts-ignore
    let playAgainButton = this.add.text(400, 300, 'Play Again', { fontSize: '32px', fill: '#FFF' })
      .setInteractive()
      .setOrigin(0.5)
    playAgainButton.on('pointerdown', () => {
      this.scene.restart() // 重新启动当前场景
    })
  }

}


