editor.js: editor/*.ts
	tsc --out $@ --target ES5 editor/*.ts

.PHONY: clean
clean:
	rm main.js
