default:
    just --list

build-image:
    docker build -t token-maker --progress plain .

serve: build-image
    docker run --rm -it token-maker npm run watch

build: build-image
    docker run --rm -it -v $(pwd)/dist/gen:/app/dist/gen token-maker npm run build
