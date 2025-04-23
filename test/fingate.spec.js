const chai = require("chai");
const expect = chai.expect;
const Fingate = require("../lib").Fingate;
const Ethereum = require("../lib").Ethereum;
const sinon = require("sinon");
const sandbox = sinon.createSandbox();
const config = require("./config");
const { Contract } = require("web3-eth-contract");
const { ERC20 } = require("../lib");
const { Web3RequestManager } = require("web3-core");

describe("test Fingate", function () {
  describe("test constructor", function () {
    it("create successfully", function () {
      let inst = new Fingate();
      const ethereum = new Ethereum(config.MOCK_NODE, true);
      ethereum.initWeb3();
      const spy = sandbox.spy(ethereum, "contract");
      inst.init(config.ETHEREUM_ADDRESS, ethereum);
      expect(spy.calledOnce).to.true;
      inst.init(config.ETHEREUM_ADDRESS, ethereum);
      expect(spy.calledOnce).to.true;
      expect(inst._address).to.equal(config.ETHEREUM_ADDRESS);
      expect(inst._contract instanceof Contract).to.true;
      expect(inst.etherGasLimit).to.equal(150000);
      expect(inst._ethereum).to.deep.equal(ethereum);
      inst.etherGasLimit = 1;
      expect(inst.etherGasLimit).to.equal(1);
      sandbox.restore();
    });
  });

  describe("test destroy", function () {
    it("destroy and destroyWeb3 should be called once", function () {
      let inst = new Fingate();
      const ethereum = new Ethereum(config.MOCK_NODE, true);
      ethereum.initWeb3();
      inst.init(config.ETHEREUM_ADDRESS, ethereum);
      inst.destroy();
      expect(inst._contract).to.equal(null);
    });
  });

  describe("test depositState", async function () {
    let inst;
    before(() => {
      inst = new Fingate();
      const ethereum = new Ethereum(config.MOCK_NODE, true);
      ethereum.initWeb3();
      inst.init(config.ETHEREUM_ADDRESS, ethereum);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("request success", async function () {
      const s1 = sandbox.stub(inst._contract.methods, "depositState");
      s1.returns({
        call: function () {
          return new Promise((resolve, reject) => {
            resolve({
              0: "0",
              1: "",
              2: "0",
              amount: "0",
              jtaddress: "",
              state: "0"
            });
          });
        }
      });
      const s2 = sandbox.stub(s1, "call");
      s2.resolves();
      const state = await inst.depositState(config.ETHEREUM_ADDRESS);
      expect(state).to.deep.equal({
        0: "0",
        1: "",
        2: "0",
        amount: "0",
        jtaddress: "",
        state: "0"
      });
      expect(s1.calledOnceWith("0x0000000000000000000000000000000000000000", config.ETHEREUM_ADDRESS)).to.true;
    });

    it("request failed", async function () {
      const s1 = sandbox.stub(inst._contract.methods, "depositState");
      s1.returns({
        call: function () {
          return new Promise((resolve, reject) => {
            reject(new Error("network error"));
          });
        }
      });
      const s2 = sandbox.stub(s1, "call");
      s2.rejects();
      try {
        await inst.depositState(config.ETHEREUM_ADDRESS, "0x0000000000000000000000000000000000000000");
      } catch (error) {
        expect(error.message).to.equal("network error");
      }
    });
  });

  describe("test isPending", function () {
    it("return false if not pending", function () {
      const inst = new Fingate();
      const ethereum = new Ethereum(config.MOCK_NODE, true);
      ethereum.initWeb3();
      inst.init(config.ETHEREUM_ADDRESS, ethereum);
      const state = {
        0: "0",
        1: "",
        2: "0",
        amount: "0",
        jtaddress: "",
        state: "0"
      };
      expect(inst.isPending(state)).to.false;
    });

    it("return true if pending", function () {
      const inst = new Fingate();
      const ethereum = new Ethereum(config.MOCK_NODE, true);
      ethereum.initWeb3();
      inst.init(config.ETHEREUM_ADDRESS, ethereum);
      const state = {
        0: "1000000000000000",
        1: "jwnqKpXJYJPeAnUdVUv3LfbxiJh5ZVXh79",
        2: "0",
        amount: "1000000000000000",
        jtaddress: "jwnqKpXJYJPeAnUdVUv3LfbxiJh5ZVXh79",
        state: "0"
      };
      expect(inst.isPending(state)).to.true;
    });
  });

  describe("test deposit", function () {
    let inst;
    before(function () {
      inst = new Fingate();
      const ethereum = new Ethereum(config.MOCK_NODE, true);
      ethereum.initWeb3();
      inst.init("0x3907acb4c1818adf72d965c08e0a79af16e7ffb8", ethereum);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("deposit success without nonce", async function () {
      const stub1 = sandbox.stub(inst._ethereum.getWeb3().eth, "getGasPrice");
      stub1.resolves("20000000000");
      const stub2 = sandbox.stub(inst._ethereum.getWeb3().eth, "getTransactionCount");
      stub2.resolves(0);
      const stub3 = sandbox.stub(inst._ethereum.getWeb3().eth, "sendSignedTransaction");
      stub3.resolves({ transactionHash: "1" });
      const stub4 = sandbox.stub(inst._ethereum.getWeb3().currentProvider, "send");
      stub4.yields(null, 0);
      const stub5 = sandbox.stub(inst._ethereum.getWeb3().eth, "getChainId");
      stub5.resolves(1);
      const stub6 = sandbox.stub(inst._ethereum.getWeb3().eth.net, "getId");
      stub6.resolves(1);
      const chainId = await inst._ethereum.getWeb3().eth.getChainId();
      const networkId = await inst._ethereum.getWeb3().eth.net.getId();
      const stub7 = sandbox.stub(inst._ethereum, "getTx");
      stub7.callsFake(function (...arg) {
        let tx = inst._ethereum.getTx.wrappedMethod.apply(this, arg);
        tx.chainId = chainId;
        tx.networkId = networkId;
        return tx;
      });
      const hash = await inst.deposit(config.ETHEREUM_SECRET, config.JINGTUM_ADDRESS, "0.001");
      expect(hash).to.equal("1");
      expect(stub3.calledOnceWith(config.MOCK_SIGN)).to.true;
    });

    it("deposit success with nonce", async function () {
      const stub1 = sandbox.stub(inst._ethereum.getWeb3().eth, "getGasPrice");
      stub1.resolves("20000000000");
      const stub3 = sandbox.stub(inst._ethereum.getWeb3().eth, "sendSignedTransaction");
      stub3.resolves({ transactionHash: "1" });
      const stub4 = sandbox.stub(inst._ethereum.getWeb3().currentProvider, "send");
      stub4.yields(null, 0);
      const stub5 = sandbox.stub(inst._ethereum.getWeb3().eth, "getChainId");
      stub5.resolves(1);
      const stub6 = sandbox.stub(inst._ethereum.getWeb3().eth.net, "getId");
      stub6.resolves(1);
      const chainId = await inst._ethereum.getWeb3().eth.getChainId();
      const networkId = await inst._ethereum.getWeb3().eth.net.getId();
      const stub7 = sandbox.stub(inst._ethereum, "getTx");
      stub7.callsFake(function (...arg) {
        let tx = inst._ethereum.getTx.wrappedMethod.apply(this, arg);
        tx.chainId = chainId;
        tx.networkId = networkId;
        return tx;
      });
      const hash = await inst.deposit(config.ETHEREUM_SECRET, config.JINGTUM_ADDRESS, "0.001", 0);
      expect(hash).to.equal("1");
      expect(stub3.calledOnceWith(config.MOCK_SIGN)).to.true;
    });

    it("jingtum address is invalid", function () {
      expect(() => inst.deposit(config.ETHEREUM_SECRET, config.JINGTUM_ADDRESS.substring(1), 1)).throw(`${config.JINGTUM_ADDRESS.substring(1)} is invalid jingtum address.`);
    });

    it("amount is invalid", function done() {
      expect(() => inst.deposit(config.ETHEREUM_SECRET, config.JINGTUM_ADDRESS, 0)).throw(`0 is invalid amount.`);
    });

    it("moac secret is invalid", function () {
      expect(() => inst.deposit(config.ETHEREUM_SECRET.substring(1), config.JINGTUM_ADDRESS, 1)).throw(`${config.ETHEREUM_SECRET.substring(1)} is invalid ethereum secret.`);
    });

    it("reject error", async function () {
      try {
        inst.deposit(config.ETHEREUM_SECRET, config.JINGTUM_ADDRESS, 0.001);
      } catch (error) {
        expect(error).to.be.an("error");
      }
    });
  });

  describe("test depositToken", function () {
    let inst;
    before(function () {
      inst = new Fingate();
      const ethereum = new Ethereum(config.MOCK_NODE, true);
      ethereum.initWeb3();
      inst.init(config.SC_ADDRESS, ethereum);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("amount is invalid", function done() {
      expect(() => inst.depositToken(config.JINGTUM_ADDRESS, config.JC_CONTRACT, 18, "0", config.MOCK_HASH, config.ETHEREUM_SECRET)).throw(`0 is invalid amount.`);
    });

    it("moac secret is invalid", function () {
      expect(() => inst.depositToken(config.JINGTUM_ADDRESS, config.JC_CONTRACT, 18, 1, config.MOCK_HASH, config.ETHEREUM_SECRET.substring(1))).throw(`${config.ETHEREUM_SECRET.substring(1)} is invalid ethereum secret.`);
    });

    it("hash is invalid", function () {
      expect(() => inst.depositToken(config.JINGTUM_ADDRESS, config.JC_CONTRACT, 18, 1, config.MOCK_HASH.substring(1), config.ETHEREUM_SECRET)).throw(`${config.MOCK_HASH.substring(1)} is invalid hash.`);
    });

    it("contract address is invalid", function () {
      expect(() => inst.depositToken(config.JINGTUM_ADDRESS, config.JC_CONTRACT.substring(1), 18, 1, config.MOCK_HASH.substring(1), config.ETHEREUM_SECRET)).throw(`${config.JC_CONTRACT.substring(1)} is invalid ethereum address.`);
    });

    it("reject error", async function () {
      try {
        inst.depositToken(config.JINGTUM_ADDRESS, config.JC_CONTRACT, 18, 1, config.MOCK_HASH, config.ETHEREUM_SECRET);
      } catch (error) {
        expect(error).to.be.an("error");
      }
    });

    it("depositToken success without nonce", async function () {
      const stub1 = sandbox.stub(inst._ethereum.getWeb3().eth, "getGasPrice");
      stub1.resolves("20000000000");
      const stub2 = sandbox.stub(inst._ethereum.getWeb3().eth, "getTransactionCount");
      stub2.resolves(0);
      const stub3 = sandbox.stub(inst._ethereum.getWeb3().eth, "sendSignedTransaction");
      stub3.resolves({ transactionHash: config.MOCK_HASH });
      const stub4 = sandbox.stub(inst._ethereum.getWeb3().currentProvider, "send");
      stub4.yields(null, 0);
      const stub5 = sandbox.stub(inst._ethereum.getWeb3().eth, "getChainId");
      stub5.resolves(1);
      const stub6 = sandbox.stub(inst._ethereum.getWeb3().eth.net, "getId");
      stub6.resolves(1);
      const chainId = await inst._ethereum.getWeb3().eth.getChainId();
      const networkId = await inst._ethereum.getWeb3().eth.net.getId();
      const stub7 = sandbox.stub(inst._ethereum, "getTx");
      stub7.callsFake(function (...arg) {
        let tx = inst._ethereum.getTx.wrappedMethod.apply(this, arg);
        tx.chainId = chainId;
        tx.networkId = networkId;
        return tx;
      });
      const hash = await inst.depositToken(config.JINGTUM_ADDRESS, config.JC_CONTRACT, 18, "0.1", config.MOCK_TRANSFER_HASH, config.ETHEREUM_SECRET);
      expect(hash).to.equal(config.MOCK_HASH);
      expect(stub3.calledOnceWith(config.MOCK_DEPOSITTOKEN_SIGN)).to.true;
    });

    it("depositToken success with nonce", async function () {
      const stub1 = sandbox.stub(inst._ethereum.getWeb3().eth, "getGasPrice");
      stub1.resolves("20000000000");
      const stub3 = sandbox.stub(inst._ethereum.getWeb3().eth, "sendSignedTransaction");
      stub3.resolves({ transactionHash: config.MOCK_HASH });
      const stub4 = sandbox.stub(inst._ethereum.getWeb3().currentProvider, "send");
      stub4.yields(null, 0);
      const stub5 = sandbox.stub(inst._ethereum.getWeb3().eth, "getChainId");
      stub5.resolves(1);
      const stub6 = sandbox.stub(inst._ethereum.getWeb3().eth.net, "getId");
      stub6.resolves(1);
      const chainId = await inst._ethereum.getWeb3().eth.getChainId();
      const networkId = await inst._ethereum.getWeb3().eth.net.getId();
      const stub7 = sandbox.stub(inst._ethereum, "getTx");
      stub7.callsFake(function (...arg) {
        let tx = inst._ethereum.getTx.wrappedMethod.apply(this, arg);
        tx.chainId = chainId;
        tx.networkId = networkId;
        return tx;
      });
      const hash = await inst.depositToken(config.JINGTUM_ADDRESS, config.JC_CONTRACT, 18, "0.1", config.MOCK_TRANSFER_HASH, config.ETHEREUM_SECRET, 0);
      expect(hash).to.equal(config.MOCK_HASH);
      expect(stub3.calledOnceWith(config.MOCK_DEPOSITTOKEN_SIGN)).to.true;
    });
  });

  describe("test depositErc20", function () {
    let inst;
    before(function () {
      inst = new Fingate();
      const ethereum = new Ethereum(config.MOCK_NODE, true);
      ethereum.initWeb3();
      const erc20 = new ERC20();
      erc20.init(config.JC_CONTRACT, ethereum);
      inst.init(config.SC_ADDRESS, ethereum);
      inst.initErc20(erc20);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("depositToken success without nonce", async function () {
      const stub0 = sandbox.stub(inst._erc20, "decimals");
      stub0.resolves(18);
      const stub1 = sandbox.stub(inst._ethereum.getWeb3().eth, "getGasPrice");
      stub1.resolves("20000000000");
      const stub2 = sandbox.stub(inst._ethereum.getWeb3().eth, "getTransactionCount");
      stub2.resolves(0n);
      const stub3 = sandbox.stub(inst._ethereum.getWeb3().eth, "sendSignedTransaction");
      stub3.resolves({ transactionHash: config.MOCK_HASH });
      const stub4 = sandbox.stub(inst._ethereum.getWeb3().currentProvider, "send");
      stub4.yields(null, 0);
      const stub5 = sandbox.stub(inst._ethereum.getWeb3().eth, "getChainId");
      stub5.resolves(1);
      const stub6 = sandbox.stub(inst._ethereum.getWeb3().eth.net, "getId");
      stub6.resolves(1);
      const chainId = await inst._ethereum.getWeb3().eth.getChainId();
      const networkId = await inst._ethereum.getWeb3().eth.net.getId();
      const stub7 = sandbox.stub(inst._ethereum, "getTx");
      stub7.callsFake(function (...arg) {
        let tx = inst._ethereum.getTx.wrappedMethod.apply(this, arg);
        tx.chainId = chainId;
        tx.networkId = networkId;
        return tx;
      });
      const stub8 = sandbox.stub(Web3RequestManager.prototype, "sendBatch");

      stub8.resolves([
        {
          id: 1,
          jsonrpc: "2.0",
          result: "0xc93fe1983ef39bf9905b7ef60ea32946a44e07fcd540544f126033a256bbd8ea"
        },
        {
          id: 2,
          jsonrpc: "2.0",
          result: "0xcfb7a8bbc28bfba5e4d66fec70b822eb98213dcf5e65b7b50867b858997593fa"
        }
      ]);

      const hashes = await inst.depositErc20(config.ETHEREUM_SECRET, config.JINGTUM_ADDRESS, "1");
      expect(
        stub8.calledOnceWith([
          {
            jsonrpc: "2.0",
            id: 1,
            method: "eth_sendRawTransaction",
            params: [
              "0xf8aa808504a817c80083015f90949bd4810a407812042f938d2f69f673843301cfa680b844a9059cbb0000000000000000000000003907acb4c1818adf72d965c08e0a79af16e7ffb80000000000000000000000000000000000000000000000000de0b6b3a764000025a076ad1bb5bef18c238328d4bfad2778b0c2ef81444aa0e8928eeb4bdf56733b0ba0266a245e1dddd7d7ad76fe0230a4c68e73136964b62c1fcb1bb1cb24fe36c79e"
            ]
          },
          {
            jsonrpc: "2.0",
            id: 2,
            method: "eth_sendRawTransaction",
            params: [
              "0xf9014a018504a817c8008306ddd0943907acb4c1818adf72d965c08e0a79af16e7ffb880b8e4cc2c516400000000000000000000000000000000000000000000000000000000000000800000000000000000000000009bd4810a407812042f938d2f69f673843301cfa60000000000000000000000000000000000000000000000000de0b6b3a76400008e8503cd57cab1f456710e543b54bcd0ed54f90e2e9fb7b4c10beea8d09099b400000000000000000000000000000000000000000000000000000000000000226a776e714b70584a594a5065416e5564565576334c666278694a68355a565868373900000000000000000000000000000000000000000000000000000000000025a061c299e85cef3ba61399be3baf47a6adb6025e3afe9852ccd38672a193281b19a03fbcacb94d68d68e7a5182d893139dddb84fa6f2ba51c1cbf3f6c0114edb0e51"
            ]
          }
        ])
      ).to.true;
      expect(hashes).to.deep.equal(["0xc93fe1983ef39bf9905b7ef60ea32946a44e07fcd540544f126033a256bbd8ea", "0xcfb7a8bbc28bfba5e4d66fec70b822eb98213dcf5e65b7b50867b858997593fa"]);
    });

    it("depositToken success with nonce", async function () {
      const stub0 = sandbox.stub(inst._erc20, "decimals");
      stub0.resolves(18);
      const stub1 = sandbox.stub(inst._ethereum.getWeb3().eth, "getGasPrice");
      stub1.resolves("20000000000");
      const stub3 = sandbox.stub(inst._ethereum.getWeb3().eth, "sendSignedTransaction");
      stub3.resolves({ transactionHash: config.MOCK_HASH });
      const stub4 = sandbox.stub(inst._ethereum.getWeb3().currentProvider, "send");
      stub4.yields(null, 0);
      const stub5 = sandbox.stub(inst._ethereum.getWeb3().eth, "getChainId");
      stub5.resolves(1);
      const stub6 = sandbox.stub(inst._ethereum.getWeb3().eth.net, "getId");
      stub6.resolves(1);
      const chainId = await inst._ethereum.getWeb3().eth.getChainId();
      const networkId = await inst._ethereum.getWeb3().eth.net.getId();
      const stub7 = sandbox.stub(inst._ethereum, "getTx");
      stub7.callsFake(function (...arg) {
        let tx = inst._ethereum.getTx.wrappedMethod.apply(this, arg);
        tx.chainId = chainId;
        tx.networkId = networkId;
        return tx;
      });
      const stub8 = sandbox.stub(Web3RequestManager.prototype, "sendBatch");

      stub8.resolves([
        {
          id: 1,
          jsonrpc: "2.0",
          result: "0xc93fe1983ef39bf9905b7ef60ea32946a44e07fcd540544f126033a256bbd8ea"
        },
        {
          id: 2,
          jsonrpc: "2.0",
          result: "0xcfb7a8bbc28bfba5e4d66fec70b822eb98213dcf5e65b7b50867b858997593fa"
        }
      ]);

      const hashes = await inst.depositErc20(config.ETHEREUM_SECRET, config.JINGTUM_ADDRESS, "1", 0);
      expect(
        stub8.calledOnceWith([
          {
            jsonrpc: "2.0",
            id: 1,
            method: "eth_sendRawTransaction",
            params: [
              "0xf8aa808504a817c80083015f90949bd4810a407812042f938d2f69f673843301cfa680b844a9059cbb0000000000000000000000003907acb4c1818adf72d965c08e0a79af16e7ffb80000000000000000000000000000000000000000000000000de0b6b3a764000025a076ad1bb5bef18c238328d4bfad2778b0c2ef81444aa0e8928eeb4bdf56733b0ba0266a245e1dddd7d7ad76fe0230a4c68e73136964b62c1fcb1bb1cb24fe36c79e"
            ]
          },
          {
            jsonrpc: "2.0",
            id: 2,
            method: "eth_sendRawTransaction",
            params: [
              "0xf9014a018504a817c8008306ddd0943907acb4c1818adf72d965c08e0a79af16e7ffb880b8e4cc2c516400000000000000000000000000000000000000000000000000000000000000800000000000000000000000009bd4810a407812042f938d2f69f673843301cfa60000000000000000000000000000000000000000000000000de0b6b3a76400008e8503cd57cab1f456710e543b54bcd0ed54f90e2e9fb7b4c10beea8d09099b400000000000000000000000000000000000000000000000000000000000000226a776e714b70584a594a5065416e5564565576334c666278694a68355a565868373900000000000000000000000000000000000000000000000000000000000025a061c299e85cef3ba61399be3baf47a6adb6025e3afe9852ccd38672a193281b19a03fbcacb94d68d68e7a5182d893139dddb84fa6f2ba51c1cbf3f6c0114edb0e51"
            ]
          }
        ])
      ).to.true;
      expect(hashes).to.deep.equal(["0xc93fe1983ef39bf9905b7ef60ea32946a44e07fcd540544f126033a256bbd8ea", "0xcfb7a8bbc28bfba5e4d66fec70b822eb98213dcf5e65b7b50867b858997593fa"]);
    });
  });
});
