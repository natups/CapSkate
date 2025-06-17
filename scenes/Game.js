// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
    }

    preload() {
        this.load.tilemapTiledJSON('mapa', 'public/assets/tilemap/mapaCap.json');

        // Cargar cada tileset con su nombre y archivo correspondiente
        this.load.image('assets', 'public/assets/Assets.png'); // plataformas
        this.load.image('Background_1', 'public/assets/Background_1.png'); // nubes
        this.load.image('Background_2', 'public/assets/Background_2.png'); // cielo

        this.load.spritesheet('player', 'public/assets/Player.png', {
            frameWidth: 24,
            frameHeight: 24
        });

        this.load.image('alfajor', 'public/assets/item.png');
    }

    create() {
        const map = this.make.tilemap({ key: 'mapa' });

        // Cargar tilesets individualmente con el mismo nombre que usaste en Tiled
        const tilesetAssets = map.addTilesetImage('Assets', 'assets');
        const tilesetNubes = map.addTilesetImage('Background_1', 'Background_1');
        const tilesetCielo = map.addTilesetImage('Background_2', 'Background_2');

        // Crear capas usando sus tilesets correspondientes
        map.createLayer('cielo', tilesetCielo, 0, 0);
        map.createLayer('nubes', tilesetNubes, 0, 0);
        const platformLayer = map.createLayer('plataformas', tilesetAssets, 0, 0);

        platformLayer.setCollisionByProperty({ colision: true });

        // Crear jugador en su posición de spawn
        const spawnPoint = map.findObject('objetos', obj => obj.name === 'jugador');
        this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'player').setScale(1.5);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, platformLayer);

        // Crear grupo para alfajores y colocar cada uno según el objeto en Tiled
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

        // Animación jugador
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

        // Input para salto
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Inicializar puntaje y texto para mostrarlo en pantalla
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Alfajores: 0', {
            fontSize: '18px',
            fill: '#fff',
            fontFamily: 'monospace'
        }).setScrollFactor(0).setDepth(100);

        // Fondo de cámara (por si falla algo)
        this.cameras.main.setBackgroundColor('#87CEEB');
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
