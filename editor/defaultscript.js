'use strict';

class MapScene {
    constructor() {
        this.x = 0;
        this.y = 0;
    }
    update() {
        this.x++;
        this.y++;
    }

    draw(context) {
        //context.fillStyle = 'rgba(0, 128, 255, 0.5)';
        //context.fillRect(1, 1, 318, 238);

        //context.font = '12px sans-serif さざなみゴシック \'Sazanami Gothic\'';
        //context.font = "lighter 24px 'Noto Sans Japanese'";
        //context.fillStyle = 'rgb(255, 255, 255)';
        //context.fillText("ABC OPQ あいう 魑魅魍魎", 1, 0);
        util.drawBitmapTextAt(context, "ABC OPQ あいう\n魑魅魍魎", 0, 16);
    }
}

var currentScene = new MapScene();

function update(context) {
    if (!currentScene) {
        return;
    }

    currentScene.update();
    currentScene.draw(context);
}

Env.run(update);
