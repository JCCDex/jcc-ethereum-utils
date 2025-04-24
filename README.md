# jcc-ethereum-utils

Toolkit of crossing chain from EVM networks to SWTC chain.

![npm](https://img.shields.io/npm/v/jcc-ethereum-utils.svg)
[![build](https://github.com/JCCDex/jcc-ethereum-utils/actions/workflows/node.js.yml/badge.svg)](https://github.com/JCCDex/jcc-ethereum-utils/actions/workflows/node.js.yml)
[![Coverage Status](https://coveralls.io/repos/github/JCCDex/jcc-ethereum-utils/badge.svg?branch=master)](https://coveralls.io/github/JCCDex/jcc-ethereum-utils?branch=master)
[![npm downloads](https://img.shields.io/npm/dm/jcc-ethereum-utils.svg)](http://npm-stat.com/charts.html?package=jcc-ethereum-utils)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

## Description

Transfer token automatically from [Ethereum](https://www.ethereum.org/) to [SWTC](http://swtc.top/index.html#/) chain. Support ether and erc20 tokens.

e.g. you transfer 1 `eth` to [Ethereum Fingate](https://etherscan.io/address/0x3907acb4c1818adf72d965c08e0a79af16e7ffb8) from your ethereum address, If success the contract will automatically transfer 1 `jeth` to your swtc address from [Jingtum Fingate](https://swtcscan.jccdex.cn/#/wallet/?wallet=jsk45ksJZUB7durZrLt5e86Eu2gtiXNRN4) in a few minutes.

## Support token list of erc20

- [USDT](https://etherscan.io/address/0xdAC17F958D2ee523a2206206994597C13D831ec7)
- [JCC](https://etherscan.io/address/0x9BD4810a407812042F938d2f69f673843301cfa6)
- [EKT](https://etherscan.io/address/0xBAb165dF9455AA0F2AeD1f2565520B91DDadB4c8)
- [DABT](https://etherscan.io/address/0x1C6890825880566dd6Ad88147E0a6acE7930b7c0)
- [BIZ](https://etherscan.io/address/0x399f9A95305114efAcB91d1d6C02CBe234dD36aF)
- [SLASH](https://etherscan.io/address/0xE222e2e3517f5AF5e3abc667adF14320C848D6dA)
- [GSGC](https://etherscan.io/address/0x0ec2a5ec6a976d6d4c101fb647595c9d8d21779e)

**_If you wanna we support other erc20 token, please contact us._**

## Installtion

```shell
npm i jcc-ethereum-utils
```

## CDN

`jcc_ethereum_utils` as a global variable.

```javascript
<script src="https://unpkg.com/jcc-ethereum-utils/dist/jcc-ethereum-utils.min.js"></script>
```

## Usage

Breaking changes since 0.1.4, if you used 0.1.3 see [this demo](https://github.com/JCCDex/jcc-ethereum-utils/blob/master/docs/demo_below_0.1.4.md).

```javascript
// demo
import { Fingate, Ethereum, ERC20 } from "jcc-ethereum-utils";

// Ethereum node
const node = "https://eth626892d.jccdex.cn";

// Your ethereum secret
const ethereumSecret = "";

// Your ethereum address
const ethereumAddress = "";

// Your swtc address
const swtcAddress = "";

// Deposit amount
const amount = "1";

// Ethereum fingate contract address, don't change it.
const scAddress = "0x3907acb4c1818adf72d965c08e0a79af16e7ffb8";

try {
  // deposit 1 ETH
  const ethereumInstance = new Ethereum(node);
  ethereumInstance.initWeb3();

  const fingateInstance = new Fingate();
  fingateInstance.init(scAddress, ethereumInstance);

  // Check if has pending order, if has don't call the next deposit api
  const state = await fingateInstance.depositState(ethereumAddress);

  if (fingateInstance.isPending(state)) {
    return;
  }

  // start to transfer 1 ETH to fingate address
  const hash = await fingateInstance.deposit(ethereumSecret, swtcAddress, amount);
  console.log(hash);
} catch (error) {
  console.log(error);
}

// deposit erc20 token

try {
  // deposit 1 JCC

  // JCC contract address
  const jccContractAddress = "0x9BD4810a407812042F938d2f69f673843301cfa6";

  const ethereumInstance = new Ethereum(node);
  ethereumInstance.initWeb3();

  const erc20Instance = new ERC20();
  erc20Instance.init(jccContractAddress, ethereumInstance);

  const fingateInstance = new Fingate();
  fingateInstance.init(scAddress, ethereumInstance);

  fingateInstance.initErc20(erc20Instance);

  // Check if has pending order, if has don't call depositErc20 api
  const state = await fingateInstance.depositState(address, jccContractAddress);

  if (fingateInstance.isPending(state)) {
    return;
  }

  const amount = "1";

  const receipts = await fingateInstance.depositErc20(ethereumSecret, swtcAddress, amount);
  console.log(receipts);
} catch (error) {
  console.log(error);
}
```

## API

see [API.md](https://github.com/JCCDex/jcc-ethereum-utils/blob/master/docs/API.md)
