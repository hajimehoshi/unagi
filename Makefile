all: editor.js player.js

editor.js: editor/*.ts
	tsc --out $@ --target ES5 editor/*.ts

player.js: player/*.ts
	tsc --out $@ --target ES5 player/*.ts

.PHONY: clean
clean:
	rm main.js
