module.exports = {
  ETHEREUM_ADDRESS: "0x2995c1376a852e4040caf9dbae2c765e24c37a15",
  ETHEREUM_SECRET: "ca6dbabef201dce8458f29b2290fef4cb80df3e16fef96347c3c250a883e4486",
  ETHEREUM_SMART_CONTRACT_ADDRESS: "0x71666bf0db3501a149e33b7fdaa76b8cc1fa9d90",
  ETHEREUM_ERC20_ADDRESS: "0x9bd4810a407812042f938d2f69f673843301cfa6",
  MOCK_NODE: "http://localhost",
  JINGTUM_ADDRESS: "jwnqKpXJYJPeAnUdVUv3LfbxiJh5ZVXh79",
  JC_CONTRACT: "0x9BD4810a407812042F938d2f69f673843301cfa6",
  SC_ADDRESS: "0x3907acb4c1818adf72d965c08e0a79af16e7ffb8",
  MOCK_HASH: "0x5f7b69611021eac1b811ab95e086ea956e8cb72c09ed5ec7cd8dcca575456213",
  MOCK_TRANSFER_HASH: "0x6a7826f215bb65914c7676da64956e9bbf9c45c7c542a65dad80af8ebc355ed7",
  MOCK_DEPOSITTOKEN_SIGN: "0xf9014a808504a817c8008306ddd0943907acb4c1818adf72d965c08e0a79af16e7ffb880b8e4cc2c516400000000000000000000000000000000000000000000000000000000000000800000000000000000000000009bd4810a407812042f938d2f69f673843301cfa6000000000000000000000000000000000000000000000000016345785d8a00006a7826f215bb65914c7676da64956e9bbf9c45c7c542a65dad80af8ebc355ed700000000000000000000000000000000000000000000000000000000000000226a776e714b70584a594a5065416e5564565576334c666278694a68355a565868373900000000000000000000000000000000000000000000000000000000000025a00ea28a9353b9125c08931fc881f274ab5996d2bc381ee1cc40d025743e813eaaa008c01629757674814f063f7bde0525de8ced9c1b573641768883de73098b5f71",
  MOCK_TRANSFER_SIGN: "0xf8aa808504a817c80083015f90949bd4810a407812042f938d2f69f673843301cfa680b844a9059cbb0000000000000000000000003907acb4c1818adf72d965c08e0a79af16e7ffb8000000000000000000000000000000000000000000000000016345785d8a000026a03716e5a9302b7712633c6c57214777540fd64c400e0c6c3584d37de2db4200bea01ed2ca56fd9ab6bb1a680d327340865aba5734e91858c9595db8f310366e2d08",
  CALLDATA: "0xa26e1186000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000226a776e714b70584a594a5065416e5564565576334c666278694a68355a5658683739000000000000000000000000000000000000000000000000000000000000",
  MOCK_SIGN: "0xf8f1808504a817c800830249f0943907acb4c1818adf72d965c08e0a79af16e7ffb887038d7ea4c68000b884a26e1186000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000226a776e714b70584a594a5065416e5564565576334c666278694a68355a565868373900000000000000000000000000000000000000000000000000000000000025a0d35ff0459b95b6b119c64945216ab3d0edbebb2f9e810f3ba9e45ac35248576da04e8a9cea62d17e3492e5aca3cbbe696da5448977626739655f80e956640edeca",
  ETHEREUM_ERC20_ABI: [{
    "constant": false,
    "inputs": [{
      "name": "_spender",
      "type": "address"
    }, {
      "name": "_value",
      "type": "uint256"
    }],
    "name": "approve",
    "outputs": [{
      "name": "success",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "_from",
      "type": "address"
    }, {
      "name": "_to",
      "type": "address"
    }, {
      "name": "_value",
      "type": "uint256"
    }],
    "name": "transferFrom",
    "outputs": [{
      "name": "success",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "_owner",
      "type": "address"
    }],
    "name": "balanceOf",
    "outputs": [{
      "name": "balance",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "_to",
      "type": "address"
    }, {
      "name": "_value",
      "type": "uint256"
    }],
    "name": "transfer",
    "outputs": [{
      "name": "success",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
        "name": "_from",
        "type": "address"
      },
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_tokenId",
        "type": "uint256"
      },
      {
        "name": "_data",
        "type": "bytes"
      }
    ],
    "name": "transfer",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "_owner",
      "type": "address"
    }, {
      "name": "_spender",
      "type": "address"
    }],
    "name": "allowance",
    "outputs": [{
      "name": "remaining",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": true,
      "name": "_from",
      "type": "address"
    }, {
      "indexed": true,
      "name": "_to",
      "type": "address"
    }, {
      "indexed": false,
      "name": "_value",
      "type": "uint256"
    }],
    "name": "Transfer",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": true,
      "name": "_owner",
      "type": "address"
    }, {
      "indexed": true,
      "name": "_spender",
      "type": "address"
    }, {
      "indexed": false,
      "name": "_value",
      "type": "uint256"
    }],
    "name": "Approval",
    "type": "event"
  }]
}