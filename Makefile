all: editor.js player.js

editor.js: editor/*.ts data/*.ts
	tsc --out $@ --target ES5 $^

player.js: player/*.ts data/*.ts
	tsc --out $@ --target ES5 $^

.PHONY: clean
clean:
	rm editor.js player.js
