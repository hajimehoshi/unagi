// Copyright 2015 Hajime Hoshi
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var editor;
(function (editor) {
    var Canvas = (function () {
        function Canvas() {
        }
        Canvas.drawFrame = function (context, x, y, width, height) {
            var ratio = window.devicePixelRatio;
            context.lineJoin = 'miter';
            context.beginPath();
            var lineWidth = 4 * ratio;
            context.beginPath();
            context.lineWidth = lineWidth;
            context.rect(x + lineWidth / 2, y + lineWidth / 2, width - lineWidth / 2 * 2, height - lineWidth / 2 * 2);
            context.strokeStyle = '#212121';
            context.stroke();
            lineWidth = 2 * ratio;
            context.beginPath();
            context.lineWidth = lineWidth;
            context.rect(x + 1 * ratio + lineWidth / 2, y + 1 * ratio + lineWidth / 2, width - 2 * ratio - lineWidth / 2 * 2, height - 2 * ratio - lineWidth / 2 * 2);
            context.strokeStyle = '#f5f5f5';
            context.stroke();
        };
        return Canvas;
    })();
    var SelectedTiles = (function () {
        function SelectedTiles(tiles, xNum, yNum, isInPalette) {
            this.tiles_ = tiles;
            this.xNum_ = xNum;
            this.yNum_ = yNum;
            this.isInPalette_ = isInPalette;
        }
        SelectedTiles.prototype.renderFrameInPalette = function (context) {
            if (!this.isInPalette_)
                return;
            var ratio = window.devicePixelRatio;
            var tile = this.tiles_[0];
            var x = (tile % PaletteElement.tileXNum) * data.gridSize * PaletteElement.scale * ratio;
            var y = ((tile / PaletteElement.tileXNum) | 0) * data.gridSize * PaletteElement.scale * ratio;
            Canvas.drawFrame(context, x, y, this.width, this.height);
        };
        SelectedTiles.prototype.renderFrameAt = function (context, x, y) {
            Canvas.drawFrame(context, x, y, this.width, this.height);
        };
        // TODO: This class should be immutable?
        SelectedTiles.prototype.shrink = function () {
            this.tiles_ = [this.tiles_[0]];
            this.xNum_ = 1;
            this.yNum_ = 1;
        };
        Object.defineProperty(SelectedTiles.prototype, "xNum", {
            get: function () {
                return this.xNum_;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SelectedTiles.prototype, "yNum", {
            get: function () {
                return this.yNum_;
            },
            enumerable: true,
            configurable: true
        });
        SelectedTiles.prototype.at = function (x, y) {
            return this.tiles_[x + y * this.xNum_];
        };
        Object.defineProperty(SelectedTiles.prototype, "width", {
            get: function () {
                var ratio = window.devicePixelRatio;
                return this.xNum_ * data.gridSize * PaletteElement.scale * ratio;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SelectedTiles.prototype, "height", {
            get: function () {
                var ratio = window.devicePixelRatio;
                return this.yNum_ * data.gridSize * PaletteElement.scale * ratio;
            },
            enumerable: true,
            configurable: true
        });
        return SelectedTiles;
    })();
    editor.SelectedTiles = SelectedTiles;
    var TilesSelectingState = (function () {
        function TilesSelectingState(x, y) {
            this.startX_ = x;
            this.startY_ = y;
            this.endX_ = x;
            this.endY_ = y;
        }
        TilesSelectingState.prototype.moveTo = function (x, y) {
            this.endX_ = x;
            this.endY_ = y;
        };
        Object.defineProperty(TilesSelectingState.prototype, "startX", {
            get: function () {
                return this.startX_;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TilesSelectingState.prototype, "startY", {
            get: function () {
                return this.startY_;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TilesSelectingState.prototype, "xMin", {
            get: function () {
                return Math.min(this.startX_, this.endX_);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TilesSelectingState.prototype, "yMin", {
            get: function () {
                return Math.min(this.startY_, this.endY_);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TilesSelectingState.prototype, "xMax", {
            get: function () {
                return Math.max(this.startX_, this.endX_);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TilesSelectingState.prototype, "yMax", {
            get: function () {
                return Math.max(this.startY_, this.endY_);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TilesSelectingState.prototype, "width", {
            get: function () {
                return this.xMax - this.xMin + 1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TilesSelectingState.prototype, "height", {
            get: function () {
                return this.yMax - this.yMin + 1;
            },
            enumerable: true,
            configurable: true
        });
        TilesSelectingState.prototype.toSelectedTilesInPalette = function () {
            var xMin = this.xMin;
            var xMax = this.xMax;
            var yMin = this.yMin;
            var yMax = this.yMax;
            var tiles = [];
            for (var j = yMin; j <= yMax; j++) {
                for (var i = xMin; i <= xMax; i++) {
                    tiles.push(i + j * PaletteElement.tileXNum);
                }
            }
            return new SelectedTiles(tiles, this.width, this.height, true);
        };
        TilesSelectingState.prototype.toSelectedTilesInTiles = function (map) {
            var xMin = this.xMin;
            var xMax = this.xMax;
            var yMin = this.yMin;
            var yMax = this.yMax;
            var tiles = [];
            for (var j = yMin; j <= yMax; j++) {
                for (var i = xMin; i <= xMax; i++) {
                    tiles.push(map.tileAt(i, j));
                }
            }
            return new SelectedTiles(tiles, this.width, this.height, false);
        };
        return TilesSelectingState;
    })();
    editor.TilesSelectingState = TilesSelectingState;
})(editor || (editor = {}));
function concatenatedScript(game) {
    var script = "";
    for (var _i = 0, _a = game.scriptNames; _i < _a.length; _i++) {
        var name_1 = _a[_i];
        script += game.scripts[name_1];
    }
    return script;
}
exports.concatenatedScript = concatenatedScript;
(function () {
    window.addEventListener('load', function () {
        var main = document.querySelector('unagi-main');
        var store = new editor.Store(main);
        editor.Dispatcher.store = store;
        var game = data.createGame('Sample RPG');
        var firstMap = data.createMap(100, 100);
        for (var _i = 0, _a = [firstMap, data.createMap(20, 15), data.createMap(20, 15)]; _i < _a.length; _i++) {
            var map = _a[_i];
            game.maps[map.id] = map;
            game.mapIds.push(map.id);
        }
        game.playerInitialPosition = { mapId: firstMap.id, x: 4, y: 4 };
        game.scripts = editor.defaultScripts;
        game.scriptNames = editor.defaultScriptNames;
        editor.Dispatcher.onInitialized(game);
    });
})();
