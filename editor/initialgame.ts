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

    function createEmptyTiles(size: number) {
        let arr = new Array(size);
        for (let i = 0; i < arr.length; i++) {
            arr[i] = 0;
        }
        return arr;
    }

    export const initialGame: data.Game = {
        id: data.UUID.generate(),
        maps: [
            {
                id:     mapId,
                name:   'New Map',
                xNum:   100,
                yNum:   100,
                tiles:  createEmptyTiles(100 * 100),
                events: [
                    {
                        id:     data.UUID.generate(),
                        x:      1,
                        y:      1,
                        pages:  [
                            {
                                image:    data.NullImage.id,
                                imageX:   1,
                                imageY:   2,
                                passable: false,
                                commands: [
                                    {
                                        type: 'showMessage',
                                        args: {
                                            content: 'Hello! This is a test message.',
                                        },
                                    },
                                    {
                                        type: 'showSelectionWindow',
                                        args: {
                                            options: ['Yes', 'No'],
                                        },
                                    },
                                    {
                                        type: 'showMessage',
                                        args: {
                                            content: '隴西の李徴は博学才穎、天宝の末年、若くして名を\n虎榜に連ね、ついで江南尉に補せられたが、\n性、狷介、自から恃むところ頗る厚く、\n賤吏に甘んずるを潔しとしなかった。',
                                        },
                                    },
                                    {
                                        type: 'showMessage',
                                        args: {
                                            content: '長い文章テストです。\nああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ',
                                        },
                                    },
                                ],
                            },
                        ],
                    }
                ],
            },
            {
                id:     data.UUID.generate(),
                name:   'New Map 2',
                xNum:   20,
                yNum:   15,
                tiles:  createEmptyTiles(20 * 15),
                events: [],
            },
        ],
        actors: [
            {
                id:                actorIds[0],
                name:              'Sato',
                image:             data.NullImage.id,
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
                image:             data.NullImage.id,
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
                image:             data.NullImage.id,
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
                image:             data.NullImage.id,
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
                name:         'Ebiten',
                image:        data.NullImage.id,
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
            title:            'New RPG',
            initialParty:     actorIds.slice(),
            regularFontImage: data.NullImage.id,
            numberFontImage:  data.NullImage.id,
            windowImage:      null,
        },
        images: [
        ],
        playerInitialPosition: {
            mapId: mapId,
            x:     4,
            y:     4,
        },
        scripts: editor.defaultScripts,
    };

    function idFromName(items: {id: string, name: string}[], name: string): string {
        for (let item of items) {
            if (item.name === name) {
                return item.id;
            }
        }
        return null;
    }

    (() => {
        for (let image of defaultImages) {
            let type = 'picture';
            if (image.name.match(/^character/)) {
                type = 'character';
            } else if (image.name.match(/^enemy/)) {
                type = 'enemy';
            } else if (image.name.match(/^tileset/)) {
                type = 'tileSet';
            } else if (image.name.match(/^window/)) {
                type = 'window';
            }
            initialGame.images.push({
                id:   data.UUID.generate(),
                name: image.name,
                data: image.data,
                type: type,
            });
        }
        initialGame.maps[0].events[0].pages[0].image = idFromName(initialGame.images, 'character2');
        initialGame.actors[0].image = idFromName(initialGame.images, 'character0');
        initialGame.actors[1].image = idFromName(initialGame.images, 'character3');
        initialGame.actors[2].image = idFromName(initialGame.images, 'character4');
        initialGame.actors[3].image = idFromName(initialGame.images, 'character7');
        initialGame.enemies[0].image = idFromName(initialGame.images, 'enemy_ebiten');
        initialGame.system.regularFontImage = idFromName(initialGame.images, 'font_mplus');
        initialGame.system.numberFontImage = idFromName(initialGame.images, 'font_arcade');
        initialGame.system.windowImage = idFromName(initialGame.images, 'window');
    })()
}
