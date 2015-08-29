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
	"net/http"
	"regexp"
)

type Server struct {
	editor http.Handler
	player http.Handler
}

func NewServer() *Server {
	return &Server{
		editor: http.FileServer(http.Dir("static/editor")),
		player: http.FileServer(http.Dir("static/player")),
	}
}

var uuidPrefixPattern = regexp.MustCompile(`\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}.`)

func (s *Server) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	host := req.Host
	if uuidPrefixPattern.MatchString(host) {
		s.player.ServeHTTP(w, req)
		return
	}
	s.editor.ServeHTTP(w, req)
}

func main() {
	port := 8787
	fmt.Printf("http://localhost:%d/\n", port)

	http.Handle("/", NewServer())
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	panic(err)
}
