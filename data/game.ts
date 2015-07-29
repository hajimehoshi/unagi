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
    export const gridSize = 16; // TODO: Rename

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
        title:                 string,
        maps:                  Map[],
        actors:                Actor[],
        playerInitialPosition: Position,
        initialParty:          string[],
        scripts:               {[name: string]: string}, // TODO: Fix this to Script[]
        scriptNames:           string[],
    }

    export declare type Actor = {
        id:               string,
        name:             string,
        initialLevel:     number,
        maxHPCurve:       number[],
        maxMPCurve:       number[],
        attackCurve:      number[],
        defenseCurve:     number[],
        magicAttackCurve: number[],
        magicDefeneCurve: number[],
        speedCurve:       number[],
    }
}
