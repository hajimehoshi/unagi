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
	"bytes"
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

const tmpl = `// Generated by createdefaultscript.go: DO NOT EDIT

namespace editor {
    export const defaultImages: {name: string, data: string}[] = [
%s
    ];
}
`

func bytesToLiteral(bs []byte) string {
	buf := bytes.Buffer{}
	buf.WriteString("[")
	for _, b := range bs {
		buf.WriteString(strconv.Itoa(int(b)))
		buf.WriteString(",")
	}
	buf.WriteString("]")
	return buf.String()
}

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

func main() {
	dir := os.Args[1]
	f, err := os.Open(dir)
	if err != nil {
		panic(err)
	}
	defer f.Close()
	infos, err := f.Readdir(0)
	if err != nil {
		panic(err)
	}
	literals := []string{}
	for _, info := range infos {
		name := info.Name()
		if info.IsDir() {
			continue
		}
		if strings.HasPrefix(name, ".") {
			continue
		}
		path := filepath.Join(dir, name)
		bin, err := ioutil.ReadFile(path)
		if err != nil {
			panic(err)
		}
		tmpl := `
        {
            name: "%s",
            data: "%s",
        }`
		ext := filepath.Ext(name)
		n := name[:len(name)-len(ext)]
		content := "data:image/png;base64," + base64.StdEncoding.EncodeToString(bin)
		literals = append(literals, fmt.Sprintf(tmpl, toStringLiteral(n), toStringLiteral(content)))
	}
	fmt.Printf(tmpl, strings.Join(literals, ",\n"))
}
