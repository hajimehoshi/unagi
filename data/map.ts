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
    export declare type Map = {
        id:     string,
        name:   string,
        tiles:  number[],
        xNum:   number,
        yNum:   number,
        events: Event[],
    };

    export declare type Event = {
        id:    string,
        x:     number,
        y:     number,
        pages: EventPage[],
    };

    export declare type EventPage = {
        image:    string,
        imageX:   number,
        imageY:   number,
        passable: boolean,
        // condition
        commands: EventCommand[],
    };

    // Use interface here because type aliasing can't be used recursively.
    export interface EventCommand {
        type:   string,
        args:   {[key: string]: any},
        indent: number,
    }
}
