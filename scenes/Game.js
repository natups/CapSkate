// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
    }

    preload() {
        this.load.tilemapTiledJSON('mapa', 'public/assets/tilemap/mapa.json');
        this.load.image('assets', 'public/assets/Assets.png');

        this.load.spritesheet('player', 'public/assets/Player.png', {
            frameWidth: 24,
            frameHeight: 24
        });

        this.load.image('alfajor', 'public/assets/item.png');
    }

    create() {
        const map = this.make.tilemap({ key: 'mapa' });
        const tileset = map.addTilesetImage('Assets', 'assets');

        // Orden correcto de capas (fondo -> plataformas -> objetos)
        map.createLayer('cielo', tileset, 0, 0);
        map.createLayer('nubes', tileset, 0, 0);
        const platformLayer = map.createLayer('plataformas', tileset, 0, 0);

        platformLayer.setCollisionByProperty({ colision: true });

        const spawnPoint = map.findObject('objetos', obj => obj.name === 'jugador');
        this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'player').setScale(1.5);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, platformLayer);

        // Alfajores
        this.alfajores = this.physics.add.group();
        map.getObjectLayer('objetos').objects.forEach(obj => {
            if (obj.name === 'alfajor') {
                const item = this.alfajores.create(obj.x, obj.y - 16, 'alfajor');
                item.setOrigin(0);
                item.setImmovable(true);
                item.body.allowGravity = false;
            }
        });

        this.physics.add.overlap(this.player, this.alfajores, this.collectAlfajor, null, this);

        // Animación del jugador
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        this.player.anims.play('run', true);
        this.player.setVelocityX(120);

        // Cámara
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(2);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // Entrada de salto
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // UI
        /*this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Alfajores: 0', {
            fontSize: '14px',
            fill: '#fff',
            fontFamily: 'monospace'
        }).setScrollFactor(0).setDepth(20); // asegurarse que quede arriba de todo*/
    }

    collectAlfajor(player, alfajor) {
        alfajor.disableBody(true, true);
        this.score++;
        this.scoreText.setText(`Alfajores: ${this.score}`);
    }

    update() {
        if (!this.player) return;

        this.player.setVelocityX(120);

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.body.blocked.down) {
            this.player.setVelocityY(-300);
        }
    }
}
