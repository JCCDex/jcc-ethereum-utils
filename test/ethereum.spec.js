const chai = require("chai");
const expect = chai.expect;
const Ethereum = require("../lib").Ethereum;
const sinon = require("sinon");
const sandbox = sinon.createSandbox();
const config = require("./config");
const Contract = require("web3-eth-contract");
const fingateABI = require("../lib/abi/fingateABI").default;

describe("test Ethereum", function() {
  describe("test constructor", function() {
    it("create successfully", function() {
      let inst = new Ethereum(config.MOCK_NODE, true);
      expect(inst._node).to.equal(config.MOCK_NODE);
      expect(inst._network).to.equal(1);
      inst = new Ethereum(config.MOCK_NODE, false);
      expect(inst._network).to.equal(3);
    });
  });

  describe("test getWeb3、initWeb3 & destroyWeb3", function() {
    it("should be which we want", function() {
      let inst = new Ethereum(config.MOCK_NODE, true);
      inst.initWeb3();
      let web3 = inst._web3;
      expect(inst.getWeb3()).to.equal(web3);
      inst.initWeb3();
      expect(inst.getWeb3()).to.equal(web3);
      inst.destroyWeb3();
      expect(inst._web3).to.equal(null);
      inst.initWeb3();
      expect(inst._web3).to.not.equal(web3);
    });
  });

  describe("test isValidAddress", function() {
    it("return true if the ethereum address is valid", function() {
      let valid = Ethereum.isValidAddress(config.ETHEREUM_ADDRESS);
      expect(valid).to.equal(true);
    });

    it("return false if the ethereum address is invalid", function() {
      let valid = Ethereum.isValidAddress(config.ETHEREUM_ADDRESS.substring(1));
      expect(valid).to.equal(false);
    });
  });

  describe("test isValidSecret", function() {
    it("return true if the ethereum secret is valid", function() {
      let valid = Ethereum.isValidSecret(config.ETHEREUM_SECRET);
      expect(valid).to.equal(true);
    });

    it("return false if the ethereum secret is invalid", function() {
      let valid = Ethereum.isValidSecret(config.ETHEREUM_SECRET.substring(1));
      expect(valid).to.equal(false);
    });
  });

  describe("test getAddress", function() {
    it("return right address if the ethereum secret is valid", function() {
      let address = Ethereum.getAddress(config.ETHEREUM_SECRET);
      expect(address).to.equal(config.ETHEREUM_ADDRESS);
    });

    it("return null if the ethereum secret is invalid", function() {
      let address = Ethereum.getAddress(config.ETHEREUM_SECRET.substring(1));
      expect(address).to.equal(null);
    });
  });

  describe("test create wallet", function() {
    it("test create", function() {
      let wallet = Ethereum.createWallet();
      let valid = Ethereum.isValidSecret(wallet.secret);
      expect(valid).to.equal(true);
    });
  });

  describe("test prefix0x", function() {
    it('return "0x2995c1376a852e4040caf9dbae2c765e24c37a15"', function() {
      expect(Ethereum.prefix0x("2995c1376a852e4040caf9dbae2c765e24c37a15")).to.equal(config.ETHEREUM_ADDRESS);
    });

    it("return itself", function() {
      expect(Ethereum.prefix0x(config.ETHEREUM_ADDRESS)).to.equal(config.ETHEREUM_ADDRESS);
      expect(Ethereum.prefix0x(null)).to.equal(null);
    });
  });

  describe("test filter0x", function() {
    it('return "2995c1376a852e4040caf9dbae2c765e24c37a15"', function() {
      expect(Ethereum.filter0x(config.ETHEREUM_ADDRESS)).to.equal("2995c1376a852e4040caf9dbae2c765e24c37a15");
    });

    it("return itself", function() {
      expect(Ethereum.filter0x("2995c1376a852e4040caf9dbae2c765e24c37a15")).to.equal("2995c1376a852e4040caf9dbae2c765e24c37a15");
      expect(Ethereum.filter0x(null)).to.equal(null);
    });
  });

  describe("test setter and getter", function() {
    it("set and get correctly", function() {
      const inst = new Ethereum(config.MOCK_NODE, true);
      expect(inst.defaultGasPrice).to.equal(10 ** 10);
      expect(inst.gasLimit).to.equal(200000);
      expect(inst.minGasPrice).to.equal(5 * 10 ** 9);
      inst.gasLimit = 1;
      inst.minGasPrice = 1;
      inst.defaultGasPrice = 1;
      expect(inst.defaultGasPrice).to.equal(1);
      expect(inst.gasLimit).to.equal(1);
      expect(inst.minGasPrice).to.equal(1);
    });
  });

  describe("test getBlock", function() {
    let inst;
    before(() => {
      inst = new Ethereum(config.MOCK_NODE, true);
      inst.initWeb3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("if request success", async function() {
      const stub = sandbox.stub(inst._web3.eth, "getBlock");
      stub.resolves({ hash: "0x123" });
      const block = await inst.getBlock("latest");
      expect(block.hash).to.equal("0x123");
    });

    it("if request fail", async function() {
      const stub = sandbox.stub(inst._web3.eth, "getBlock");
      stub.yields(new Error(), null);
      const block = await inst.getBlock(1);
      expect(block).to.equal(null);
    });
  });

  describe("test getBalance", function() {
    let inst;
    before(() => {
      inst = new Ethereum(config.MOCK_NODE, true);
      inst.initWeb3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("if request success", async function() {
      const stub = sandbox.stub(inst._web3.eth, "getBalance");
      stub.resolves("1000000000000000000");
      const balance = await inst.getBalance(config.ETHEREUM_ADDRESS);
      expect(balance).to.equal("1");
    });
  });

  describe("test getGasPrice", function() {
    let inst;
    before(() => {
      inst = new Ethereum(config.MOCK_NODE, true);
      inst.initWeb3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("resolve default gas price", async function() {
      const stub = sandbox.stub(inst._web3.eth, "getGasPrice");
      stub.yields(new Error(), null);
      const gasPrice = await inst.getGasPrice();
      expect(gasPrice).to.equal(10 ** 10);
    });

    it("resolve min gas price", async function() {
      const stub = sandbox.stub(inst._web3.eth, "getGasPrice");
      stub.yields(null, 10 ** 9);
      const gasPrice = await inst.getGasPrice();
      expect(gasPrice).to.equal(5 * 10 ** 9);
    });
  });

  describe("test getNonce", function() {
    let inst;
    before(() => {
      inst = new Ethereum(config.MOCK_NODE, true);
      inst.initWeb3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("reject error if getTransactionCount failed", async function() {
      const stub = sandbox.stub(inst._web3.eth, "getTransactionCount");
      stub.yields(new Error("getTransactionCount failed"), null);
      const spy = sandbox.spy(inst._web3.currentProvider, "send");
      try {
        await inst.getNonce(config.ETHEREUM_ADDRESS);
      } catch (error) {
        expect(error.message).to.equal("getTransactionCount failed");
        expect(stub.calledOnceWith(config.ETHEREUM_ADDRESS)).to.true;
        expect(spy.calledOnce).to.false;
      }
    });

    it("reject error if send failed", async function() {
      const stub = sandbox.stub(inst._web3.eth, "getTransactionCount");
      stub.yields(null, 0);
      const s1 = sandbox.stub(inst._web3.currentProvider, "send");
      s1.yields(new Error("send failed"), null);
      try {
        await inst.getNonce(config.ETHEREUM_ADDRESS);
      } catch (error) {
        expect(error.message).to.equal("send failed");
      }
    });

    it("resolve 11", async function() {
      const stub = sandbox.stub(inst._web3.eth, "getTransactionCount");
      stub.yields(null, 10);
      const s1 = sandbox.stub(inst._web3.currentProvider, "send");
      s1.yields(null, { result: 11 });
      const nonce = await inst.getNonce("2995c1376a852e4040caf9dbae2c765e24c37a15");
      expect(stub.calledOnceWith(config.ETHEREUM_ADDRESS)).to.true;
      expect(
        s1.calledOnceWith({
          method: "parity_nextNonce",
          params: [config.ETHEREUM_ADDRESS],
          jsonrpc: "2.0",
          id: 1
        })
      ).to.true;
      expect(nonce).to.equal(11);
    });

    it("resolve 10", async function() {
      const stub = sandbox.stub(inst._web3.eth, "getTransactionCount");
      stub.yields(null, 10);
      const s1 = sandbox.stub(inst._web3.currentProvider, "send");
      s1.yields(null, { result: 9 });
      const nonce = await inst.getNonce("2995c1376a852e4040caf9dbae2c765e24c37a15");
      expect(stub.calledOnceWith(config.ETHEREUM_ADDRESS)).to.true;
      expect(
        s1.calledOnceWith({
          method: "parity_nextNonce",
          params: [config.ETHEREUM_ADDRESS],
          jsonrpc: "2.0",
          id: 1
        })
      ).to.true;
      expect(nonce).to.equal(10);
    });
  });

  describe("test signTransaction", function() {
    it("return correct result", function() {
      let inst = new Ethereum(config.MOCK_NODE, true);
      inst.initWeb3();
      const to = "0x3907acb4c1818adf72d965c08e0a79af16e7ffb8";
      const value = inst._web3.utils.numberToHex(inst._web3.utils.toWei("0.001", "ether"));
      const tx = inst.getTx(to, 0, 150000, "20000000000", value, config.CALLDATA);
      expect(tx).to.deep.equal({
        chainId: 1,
        data: config.CALLDATA,
        nonce: 0,
        gasPrice: "0x4a817c800",
        gasLimit: "0x249f0",
        to,
        value: "0x38d7ea4c68000"
      });
      const sign = inst.signTransaction(tx, config.ETHEREUM_SECRET);
      expect(sign).to.equal(config.MOCK_SIGN);
      inst = new Ethereum(config.MOCK_NODE, false);
      inst.initWeb3();
      expect(inst.getTx(to, 0, 150000, "20000000000", value, config.CALLDATA)).to.deep.equal({
        chainId: 3,
        data: config.CALLDATA,
        nonce: 0,
        gasPrice: "0x4a817c800",
        gasLimit: "0x249f0",
        to,
        value: "0x38d7ea4c68000"
      });
    });
  });

  describe("test sendSignedTransaction", async function() {
    let inst;
    before(() => {
      inst = new Ethereum(config.MOCK_NODE, true);
      inst.initWeb3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("resolve hash if success", async function() {
      const stub = sandbox.stub(inst._web3.eth, "sendSignedTransaction");
      stub.yields(null, "1");
      const hash = await inst.sendSignedTransaction("test");
      expect(stub.calledOnceWith("test")).to.true;
      expect(hash).to.equal("1");
    });

    it("reject error if failed", async function() {
      const stub = sandbox.stub(inst._web3.eth, "sendSignedTransaction");
      stub.yields(new Error("failed"), null);
      try {
        await inst.sendSignedTransaction("test");
      } catch (error) {
        expect(error.message).to.equal("failed");
      }
    });
  });

  describe("test contract", function() {
    it("should return contract instance", function() {
      let inst = new Ethereum(config.MOCK_NODE, true);
      inst.initWeb3();
      const spy = sandbox.spy(inst._web3.eth, "Contract");
      let contract = inst.contract(fingateABI, config.ETHEREUM_ADDRESS);
      expect(spy.calledOnceWith(fingateABI, config.ETHEREUM_ADDRESS)).to.true;
      expect(contract instanceof Contract).to.true;
    });
  });

  describe("test hasPendingTransactions", function() {
    let inst;
    before(() => {
      inst = new Ethereum(config.MOCK_NODE, true);
      inst.initWeb3();
    });

    afterEach(() => {
      sandbox.restore();
    });
    it("resolve true if has pending transaction", async function() {
      const s1 = sandbox.stub(inst._web3.currentProvider, "send");
      s1.yields(null, {
        result: [
          {
            from: config.ETHEREUM_ADDRESS
          }
        ]
      });
      let hasPending = await inst.hasPendingTransactions(config.ETHEREUM_ADDRESS.substring(2));
      expect(hasPending).to.true;
    });

    it("resolve false if has't pending transaction", async function() {
      const stub = sandbox.stub(inst._web3.currentProvider, "send");
      stub.yields(null, {
        result: [
          {
            from: "aaa"
          }
        ]
      });
      let hasPending = await inst.hasPendingTransactions(config.ETHEREUM_ADDRESS.substring(2));
      expect(hasPending).to.false;
      expect(
        stub.calledOnceWith({
          method: "parity_pendingTransactions",
          params: [],
          jsonrpc: "2.0",
          id: 1
        })
      ).to.true;
    });

    it("reject error", async function() {
      const stub = sandbox.stub(inst._web3.currentProvider, "send");
      stub.yields(new Error("failed"), null);
      try {
        await inst.hasPendingTransactions(config.ETHEREUM_ADDRESS.substring(2));
      } catch (error) {
        expect(error.message).to.equal("failed");
      }
    });
  });

  describe("test contractInitialied", function() {
    it("return true", function() {
      let inst = new Ethereum(config.MOCK_NODE, true);
      inst.initWeb3();
      let contract = inst.contract(fingateABI, config.ETHEREUM_ADDRESS);
      expect(inst.contractInitialied(contract, config.ETHEREUM_ADDRESS)).to.true;
    });

    it("return false", function() {
      let inst = new Ethereum(config.MOCK_NODE, true);
      inst.initWeb3();
      expect(
        inst.contractInitialied(
          {
            address: config.ETHEREUM_ADDRESS
          },
          config.ETHEREUM_ADDRESS
        )
      ).to.false;
    });
  });
});
