namespace game {
    export var $gameState = new GameState();
    export var $sceneStack = new SceneStack();

    (() => {
        $sceneStack.push(new TitleScene());
    })()

    function update(screen: graphics.Image) {
        if (!$sceneStack.current) {
            return;
        }

        $input.update();
        $sceneStack.update();
        $sceneStack.draw(screen);
    }

    Env.run(update);
}
