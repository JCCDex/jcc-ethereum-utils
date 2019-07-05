# Usage

```shell
npm i jcc-ethereum-utils@0.1.3
```

```javascript

// demo
import { EtherFingate, Erc20Fingate } from "jcc-ethereum-utils";

// Ethereum node
const node = "https://eth626892d.jccdex.cn";

// Production network or not
const production = true;

// Your ethereum secret
const ethereumSecret = '';

// Your ethereum address
const ethereumAddress = '';

// Your swtc address
const swtcAddress = '';

// Deposit amount
const amount = "1";

// Ethereum fingate contract address, don't change it.
const scAddress = '0x3907acb4c1818adf72d965c08e0a79af16e7ffb8';

try {
    // deposit 1 ETH
    const inst = new EtherFingate(node, production);
    inst.initEtherContract(scAddress);

    // Check if has pending order, if has don't call the next deposit api
    const state = await inst.depositState(moacAddress);

    if (inst.isPending(state)) {
        return;
    }

    // start to transfer 1 ETH to fingate address
    const hash = await inst.deposit(ethereumSecret, swtcAddress, amount);
    console.log(hash);
} catch (error) {
    console.log(error);
}

// deposit erc20 token

try {
    // deposit 1 JCC

    // JCC contract address
    const jccContractAddress = "0x9BD4810a407812042F938d2f69f673843301cfa6";

    const inst = new Erc20Fingate(node, production);

    inst.initErc20Contract(scAddress, jccContractAddress);

    // Check if has pending order, if has don't call transfer api
    const state = await inst.depositState(ethereumAddress, jccContractAddress);

    if (inst.isPending(state)) {
        return;
    }
    // Please set decimals of erc20 token, if not will throw an error.
    inst.decimals = 18;

    // The first step to transfer 1 JCC to jcc contract address.
    const transferHash = await inst.transfer(amount, secret);

    // The next step to submit previous transfer hash.
    const depositHash = await inst.depositToken(swtcAddress, amount, transferHash, ethereumSecret);
    console.log(depositHash);

    // Warning:
    // This is not an atomic operating to deposit erc20 tokens for now,
    // If the first step is successful but next step is failed, please contact us.
    // The next version will make it an atomic operating after the next version of solidity contract upgrade.
} catch (error) {
    console.log(error);
}

```
