#!/bin/bash
npm run build
npx babel node_modules/base-x/src/index.js -o node_modules/base-x/src/index.js
npx babel node_modules/ethereumjs-tx/dist/transaction.js -o node_modules/ethereumjs-tx/dist/transaction.js
npx babel node_modules/scryptsy/lib --out-dir node_modules/scryptsy/lib
npx babel ./node_modules/swtc-factory --out-dir ./node_modules/swtc-factory
npx babel ./node_modules/swtc-keypairs --out-dir ./node_modules/swtc-keypairs
npx babel ./node_modules/swtc-chains --out-dir ./node_modules/swtc-chains
npx babel ./node_modules/swtc-address-codec --out-dir ./node_modules/swtc-address-codec
./node_modules/cross-env/dist/bin/cross-env-shell.js MODE=$1 REPORT=$2 webpack

# ./compile.sh dev true
# ./compile.sh prod true


