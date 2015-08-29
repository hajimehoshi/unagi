# Copyright 2015 Hajime Hoshi
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

go run tools/createdefaultimages.go images/default > editor/defaultimages.ts
go run tools/createdefaultscripts.go editor/defaultscripts/names.txt > editor/defaultscripts.ts
go run tools/createdeclarations.go > player/typescriptdeclarations.ts
tsc --out static/editor/editor.js --target ES5 data/*.ts editor/*.ts
tsc --out static/player/player.js --target ES5 data/*.ts player/graphics/webgl/*.ts player/graphics/*.ts player/*.ts
