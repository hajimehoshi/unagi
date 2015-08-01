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
    let actorIds = [
        data.UUID.generate(),
        data.UUID.generate(),
        data.UUID.generate(),
        data.UUID.generate(),
    ];

    function calcCurve(growth: number, factor: number): number[] {
        let result: number[] = [];
        for (let i = 0; i < data.MAX_LEVEL; i++) {
            let level = i + 1;
            let base = Math.pow(Math.pow(level, 1.5)/8 + 2, growth);
            let x = base * factor;
            result.push(x|0);
        }
        return result;
    }

    function calcLogCurve(growth: number, factor: number, offset: number): number []{
        let result: number[] = [];
        for (let i = 0; i < data.MAX_LEVEL; i++) {
            let level = i + 1;
            let base = Math.pow(Math.pow(level, 1.5)/8 + 2, growth);
            let x = (Math.LOG2E * Math.log(base * factor) + offset) * 16;
            result.push(x|0);
        }
        return result;
    }

    export const initialGame: data.Game = {
        maps:   [
            {
                id:    mapId,
                name:  'New Map',
                xNum:  100,
                yNum:  100,
                tiles: new Int16Array(100 * 100),
            },
            {
                id:    data.UUID.generate(),
                name:  'New Map 2',
                xNum:  20,
                yNum:  15,
                tiles: new Int16Array(20 * 15),
            },
        ],
        actors: [
            {
                id:                actorIds[0],
                name:              'Sato',
                initialLevel:      1,
                maxHPCurve:        calcCurve(1, 60),
                maxMPCurve:        calcCurve(1, 6),
                attackCurve:       calcLogCurve(7/4, 10, -4),
                defenseCurve:      calcLogCurve(1/2, 1, 2),
                magicAttackCurve:  calcLogCurve(7/4, 10, -4),
                magicDefenseCurve: calcLogCurve(1/2, 1, 2),
                speedCurve:        calcCurve(1/2, 10),
            },
            {
                id:                actorIds[1],
                name:              'Suzuki',
                initialLevel:      1,
                maxHPCurve:        calcCurve(1, 60),
                maxMPCurve:        calcCurve(1, 6),
                attackCurve:       calcLogCurve(7/4, 10, -4),
                defenseCurve:      calcLogCurve(1/2, 1, 2),
                magicAttackCurve:  calcLogCurve(7/4, 10, -4),
                magicDefenseCurve: calcLogCurve(1/2, 1, 2),
                speedCurve:        calcCurve(1/2, 10),
            },
            {
                id:                actorIds[2],
                name:              'Takahashi',
                initialLevel:      1,
                maxHPCurve:        calcCurve(1, 60),
                maxMPCurve:        calcCurve(1, 6),
                attackCurve:       calcLogCurve(7/4, 10, -4),
                defenseCurve:      calcLogCurve(1/2, 1, 2),
                magicAttackCurve:  calcLogCurve(7/4, 10, -4),
                magicDefenseCurve: calcLogCurve(1/2, 1, 2),
                speedCurve:        calcCurve(1/2, 10),
            },
            {
                id:                actorIds[3],
                name:              'Tanaka',
                initialLevel:      1,
                maxHPCurve:        calcCurve(1, 60),
                maxMPCurve:        calcCurve(1, 6),
                attackCurve:       calcLogCurve(7/4, 10, -4),
                defenseCurve:      calcLogCurve(1/2, 1, 2),
                magicAttackCurve:  calcLogCurve(7/4, 10, -4),
                magicDefenseCurve: calcLogCurve(1/2, 1, 2),
                speedCurve:        calcCurve(1/2, 10),
            },
        ],
        enemies: [
            {
                id:           data.UUID.generate(),
                name:         'New Enemy',
                level:        1,
                maxHP:        10,
                maxMP:        10,
                attack:       10,
                defense:      10,
                magicAttack:  10,
                magicDefense: 10,
                speed:        10,
            }
        ],
        system: {
            title:        'New RPG',
            initialParty: actorIds.slice(),
        },
        playerInitialPosition: {
            mapId: mapId,
            x:     4,
            y:     4,
        },
        scripts: editor.defaultScripts,
    };
}
