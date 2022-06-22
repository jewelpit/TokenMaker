default:
    just --list

install-deps:
    npm install

serve: install-deps
    npm run watch

build: install-deps
    npm run build
