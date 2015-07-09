main.js: editor/*.ts
	tsc --out main.js --target ES5 editor/*.ts

.PHONY: clean
clean:
	rm main.js
