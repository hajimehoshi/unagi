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

namespace data {
    export const GRID_SIZE = 16;

    export const MAX_LEVEL    = 99;
    export const MAX_ACTOR_HP = 9999;
    export const MAX_ACTOR_MP = 999;
    export const MAX_ATTACK   = 255;
    export const MAX_DEFENSE  = 255;
    export const MAX_SPEED    = 255;

    export declare type Position = {
        mapId: string,
        x:     number,
        y:     number,
    }

    export declare type Game = {
        id:                    string,
        maps:                  Map[],
        actors:                Actor[],
        enemies:               Enemy[],
        system:                System,
        images:                Image[],
        playerInitialPosition: Position,
        scripts:               Script[],
    }

    export declare type Actor = {
        id:                string,
        image:             string,
        name:              string,
        initialLevel:      number,
        maxHPCurve:        number[],
        maxMPCurve:        number[],
        attackCurve:       number[],
        defenseCurve:      number[],
        magicAttackCurve:  number[],
        magicDefenseCurve: number[],
        speedCurve:        number[],
    }

    export declare type Enemy = {
        id:           string,
        name:         string,
        image:        string, // TODO: Add hue
        level:        number,
        maxHP:        number,
        maxMP:        number,
        attack:       number,
        defense:      number,
        magicAttack:  number,
        magicDefense: number,
        speed:        number,
    }

    export declare type System = {
        title:            string,
        initialParty:     string[],
        regularFontImage: string,
        numberFontImage:  string,
        windowImage:      string,
    }

    export declare type Image = {
        id:   string,
        name: string,
        data: string,
        type: string,
    }

    export const NullImage: Image = {
        id:   'ebdc76b2-beab-4aa5-8064-cab21c967e19',
        name: '',
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=',
        type: 'null',
    };

    export declare type Script = {
        name:    string,
        content: string,
    }
}
