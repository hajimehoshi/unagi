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

namespace editor {
    let mapId = data.UUID.generate();
    let actorId = data.UUID.generate();

    export const initialGame: data.Game = {
        title:  'New RPG',
        maps:   [
            {
                id:    mapId,
                name:  'New Map',
                xNum:  100,
                yNum:  100,
                tiles: new Int16Array(100 * 100),
            },
        ],
        actors: [
            {
                id:               actorId,
                name:             'New Actor',
                initialLevel:     1,
                maxHPCurve:       [100],
                maxMPCurve:       [100],
                attackCurve:      [100],
                defenseCurve:     [100],
                magicAttackCurve: [100],
                magicDefeneCurve: [100],
                speedCurve:       [100],
            },
        ],
        playerInitialPosition: {
            mapId: mapId,
            x:     4,
            y:     4,
        },
        initialParty: [actorId],
        scripts:      editor.defaultScripts,
        scriptNames:  editor.defaultScriptNames,
    };
}
