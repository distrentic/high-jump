# high-jump (server)

## Usage

If you want to run `high-jump` from the source, it is as easy as any other node application.

```sh
# clone this repository
git clone git@github.com:distrentic/high-jump.git
cd high-jump

# first build the library
cd lib
yarn install && yarn build

# then server is ready to be run
cd ../server
yarn install

# you can run it using nodemon
yarn start

# or alternatively you can run the compiled version
yarn build
node build/index.js
```
