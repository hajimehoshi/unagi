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

package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"strings"
)

const tmpl = `// Generated by createdeclarations.go: DO NOT EDIT

namespace typescript {
    export const declarations = {
%s
    };
}
`

var stringLiteralContentReplacer = strings.NewReplacer(
	"\\", "\\\\",
	"\"", "\\\"",
	"'", "\\'",
	"\n", "\\n",
	"\r", "\\r",
	"\u2028", "\\u2028",
	"\u2029", "\\u2029")

func toStringLiteral(s string) string {
	return stringLiteralContentReplacer.Replace(s)
}

type declaration struct {
	name     string
	filename string
	content  string
}

func (d *declaration) Content() string {
	if d.content != "" {
		return d.content
	}
	content, err := ioutil.ReadFile(d.filename)
	if err != nil {
		panic(err)
	}
	d.content = string(content)
	return d.content
}

func (d *declaration) String() string {
	return fmt.Sprintf(`"%s": "%s"`, toStringLiteral(d.name), toStringLiteral(d.Content()))
}

func readDir(path string, prefix string) []declaration {
	dir, err := os.Open(path)
	if err != nil {
		panic(err)
	}
	dirNames, err := dir.Readdirnames(0)
	if err != nil {
		panic(err)
	}
	declarations := []declaration{}
	for _, n := range dirNames {
		if !strings.HasSuffix(n, ".ts") {
			continue
		}
		declarations = append(declarations, declaration{
			name:     prefix + "/" + n,
			filename: path + "/" + n,
		})
	}
	return declarations
}

func main() {
	declarations := []declaration{
		{
			name:     "lib.d.ts",
			filename: "player/typescript/lib.d.ts",
		},
		{
			name:     "graphics.d.ts",
			filename: "player/typescript/graphics.d.ts",
		},
	}
	declarations = append(declarations, readDir("data", "data")...)

	declarationsStrs := make([]string, 0, len(declarations))
	for _, d := range declarations {
		declarationsStrs = append(declarationsStrs, fmt.Sprintf("        %s,", d.String()))
	}
	fmt.Printf(tmpl, strings.Join(declarationsStrs, "\n"))
}
