#!/bin/bash
npm run build
npx babel node_modules/bs58/node_modules/base-x/index.js -o node_modules/bs58/node_modules/base-x/index.js
npx babel node_modules/ethereumjs-tx/dist/transaction.js -o node_modules/ethereumjs-tx/dist/transaction.js
npx babel node_modules/scryptsy/lib --out-dir node_modules/scryptsy/lib
./node_modules/cross-env/dist/bin/cross-env-shell.js MODE=$1 REPORT=$2 webpack

# ./compile.sh dev true
# ./compile.sh prod true


