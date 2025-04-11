const chai = require("chai");
const expect = chai.expect;
const Ethereum = require("../lib").Ethereum;
const sinon = require("sinon");
const sandbox = sinon.createSandbox();
const config = require("./config");
const { Contract } = require("web3-eth-contract");
const fingateABI = require("../lib/abi/fingateABI").default;

describe("test Ethereum", function () {
  describe("test constructor", function () {
    it("create successfully", function () {
      let inst = new Ethereum(config.MOCK_NODE);
      expect(inst._node).to.equal(config.MOCK_NODE);
    });
  });

  describe("test getWeb3、initWeb3 & destroyWeb3", function () {
    it("should be which we want", function () {
      let inst = new Ethereum(config.MOCK_NODE);
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

  describe("test isValidAddress", function () {
    it("return true if the ethereum address is valid", function () {
      let valid = Ethereum.isValidAddress(config.ETHEREUM_ADDRESS);
      expect(valid).to.equal(true);
    });

    it("return false if the ethereum address is invalid", function () {
      let valid = Ethereum.isValidAddress(config.ETHEREUM_ADDRESS.substring(1));
      expect(valid).to.equal(false);
    });
  });

  describe("test isValidSecret", function () {
    it("return true if the ethereum secret is valid", function () {
      let valid = Ethereum.isValidSecret(config.ETHEREUM_SECRET);
      expect(valid).to.equal(true);
    });

    it("return false if the ethereum secret is invalid", function () {
      let valid = Ethereum.isValidSecret(config.ETHEREUM_SECRET.substring(1));
      expect(valid).to.equal(false);
    });
  });

  describe("test getAddress", function () {
    it("return right address if the ethereum secret is valid", function () {
      let address = Ethereum.getAddress(config.ETHEREUM_SECRET);
      expect(address).to.equal(config.ETHEREUM_ADDRESS);
    });

    it("return null if the ethereum secret is invalid", function () {
      let address = Ethereum.getAddress(config.ETHEREUM_SECRET.substring(1));
      expect(address).to.equal(null);
    });
  });

  describe("test create wallet", function () {
    it("test create", function () {
      let wallet = Ethereum.createWallet();
      let valid = Ethereum.isValidSecret(wallet.secret);
      expect(valid).to.equal(true);
    });
  });

  describe("test prefix0x", function () {
    it('return "0x2995c1376a852e4040caf9dbae2c765e24c37a15"', function () {
      expect(Ethereum.prefix0x("2995c1376a852e4040caf9dbae2c765e24c37a15")).to.equal(config.ETHEREUM_ADDRESS);
    });

    it("return itself", function () {
      expect(Ethereum.prefix0x(config.ETHEREUM_ADDRESS)).to.equal(config.ETHEREUM_ADDRESS);
      expect(Ethereum.prefix0x(null)).to.equal(null);
    });
  });

  describe("test filter0x", function () {
    it('return "2995c1376a852e4040caf9dbae2c765e24c37a15"', function () {
      expect(Ethereum.filter0x(config.ETHEREUM_ADDRESS)).to.equal("2995c1376a852e4040caf9dbae2c765e24c37a15");
    });

    it("return itself", function () {
      expect(Ethereum.filter0x("2995c1376a852e4040caf9dbae2c765e24c37a15")).to.equal("2995c1376a852e4040caf9dbae2c765e24c37a15");
      expect(Ethereum.filter0x(null)).to.equal(null);
    });
  });

  describe("test setter and getter", function () {
    it("set and get correctly", function () {
      const inst = new Ethereum(config.MOCK_NODE);
      expect(inst.defaultGasPrice).to.equal(10 ** 10);
      expect(inst.gasLimit).to.equal(200000);
      expect(inst.minGasPrice).to.equal(5 * 10 ** 9);
      expect(inst.minFeePerGas).to.equal(5 * 10 ** 9);
      expect(inst.minPriorityFeePerGas).to.equal(10 ** 9);
      inst.gasLimit = 1;
      inst.minGasPrice = 1;
      inst.defaultGasPrice = 1;
      inst.minFeePerGas = 1;
      inst.minPriorityFeePerGas = 1;
      expect(inst.defaultGasPrice).to.equal(1);
      expect(inst.gasLimit).to.equal(1);
      expect(inst.minGasPrice).to.equal(1);
      expect(inst.minFeePerGas).to.equal(1);
      expect(inst.minPriorityFeePerGas).to.equal(1);
    });
  });

  describe("test get Transaction", function () {
    let inst;
    before(() => {
      inst = new Ethereum(config.MOCK_NODE);
      inst.initWeb3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("get transaction successfully", function (done) {
      let stub = sandbox.stub(inst._web3.eth, "getTransaction");
      stub.resolves(config.MOCK_HASH_TRANSACTION);
      inst.getTransaction(config.MOCK_HASH).then((data) => {
        expect(data).to.equal(config.MOCK_HASH_TRANSACTION);
        done();
      });
    });

    it("get transaction in error", function (done) {
      let stub = sandbox.stub(inst._web3.eth, "getTransaction");
      stub.rejects(new Error("connect net in error"));
      inst.getTransaction(config.MOCK_HASH).catch((err) => {
        expect(err.message).to.equal("connect net in error");
        done();
      });
    });
  });

  describe("test get Transaction receipt", function () {
    let inst;
    before(() => {
      inst = new Ethereum(config.MOCK_NODE);
      inst.initWeb3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("get transaction receipt successfully", function (done) {
      let stub = sandbox.stub(inst._web3.eth, "getTransactionReceipt");
      stub.resolves(config.MOCK_HASH_TRANSACTION_RECEIPT);
      inst.getTransactionReceipt(config.MOCK_HASH).then((data) => {
        expect(data).to.equal(config.MOCK_HASH_TRANSACTION_RECEIPT);
        done();
      });
    });

    it("get transaction receipt in error", function (done) {
      let stub = sandbox.stub(inst._web3.eth, "getTransactionReceipt");
      stub.rejects(new Error("connect net in error"));
      inst.getTransactionReceipt(config.MOCK_HASH).catch((err) => {
        expect(err.message).to.equal("connect net in error");
        done();
      });
    });
  });

  describe("test getBlock", function () {
    let inst;
    before(() => {
      inst = new Ethereum(config.MOCK_NODE);
      inst.initWeb3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("if request success", async function () {
      const stub = sandbox.stub(inst._web3.eth, "getBlock");
      stub.resolves({ hash: "0x123" });
      const block = await inst.getBlock("latest");
      expect(block.hash).to.equal("0x123");
    });

    it("if request fail", async function () {
      const stub = sandbox.stub(inst._web3.eth, "getBlock");
      stub.rejects(new Error());
      const block = await inst.getBlock(1);
      expect(block).to.equal(null);
    });
  });

  describe("test getBalance", function () {
    let inst;
    before(() => {
      inst = new Ethereum(config.MOCK_NODE);
      inst.initWeb3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("if request success", async function () {
      const stub = sandbox.stub(inst._web3.eth, "getBalance");
      stub.resolves("1000000000000000000");
      const balance = await inst.getBalance(config.ETHEREUM_ADDRESS);
      expect(balance).to.equal("1");
    });
  });

  describe("test getGasPrice", function () {
    let inst;
    before(() => {
      inst = new Ethereum(config.MOCK_NODE);
      inst.initWeb3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("resolve default gas price", async function () {
      const stub = sandbox.stub(inst._web3.eth, "getGasPrice");
      stub.rejects(new Error());
      const gasPrice = await inst.getGasPrice();
      expect(gasPrice).to.equal(10 ** 10);
    });

    it("resolve min gas price", async function () {
      const stub = sandbox.stub(inst._web3.eth, "getGasPrice");
      stub.resolves(10 ** 9);
      const gasPrice = await inst.getGasPrice();
      expect(gasPrice).to.equal(5 * 10 ** 9);
    });
  });

  describe("test getFeeData", function () {
    let inst;
    const feeDataDemo = {
      gasPrice: 1,
      maxFeePerGas: 1,
      maxPriorityFeePerGas: 1,
      baseFeePerGas: 1
    };
    before(() => {
      inst = new Ethereum(config.MOCK_NODE);
      inst.initWeb3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("resolve default gas price", async function () {
      const stub = sandbox.stub(inst._web3.eth, "calculateFeeData");
      stub.rejects(new Error());
      const feeData = await inst.getFeeData();
      expect(feeData.gasPrice).to.equal(10 ** 10);
    });

    it("support EIP1559, resolve min info", async function () {
      const stub = sandbox.stub(inst._web3.eth, "calculateFeeData");
      stub.resolves(feeDataDemo);
      const getFeeData = await inst.getFeeData();
      expect(getFeeData.gasPrice).to.equal(5 * 10 ** 9);
      expect(getFeeData.maxFeePerGas).to.equal(5 * 10 ** 9);
      expect(getFeeData.maxPriorityFeePerGas).to.equal(10 ** 9);
      expect(getFeeData.baseFeePerGas).to.equal(1);
    });

    it("not support EIP1559, resolve min info", async function () {
      const stub = sandbox.stub(inst._web3.eth, "calculateFeeData");
      stub.resolves({ gasPrice: 1 });
      const getFeeData = await inst.getFeeData();
      expect(getFeeData.gasPrice).to.equal(5 * 10 ** 9);
      expect(getFeeData.maxFeePerGas).to.equal(undefined);
      expect(getFeeData.maxPriorityFeePerGas).to.equal(undefined);
      expect(getFeeData.baseFeePerGas).to.equal(undefined);
    });
  });

  describe("test getNonce", function () {
    let inst;
    before(() => {
      inst = new Ethereum(config.MOCK_NODE);
      inst.initWeb3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("reject error if getTransactionCount failed", async function () {
      const stub = sandbox.stub(inst._web3.eth, "getTransactionCount");
      stub.rejects(new Error("getTransactionCount failed"));
      try {
        await inst.getNonce(config.ETHEREUM_ADDRESS);
      } catch (error) {
        expect(error.message).to.equal("getTransactionCount failed");
        expect(stub.calledOnceWith(config.ETHEREUM_ADDRESS)).to.true;
      }
    });

    it("resolve 10", async function () {
      const stub = sandbox.stub(inst._web3.eth, "getTransactionCount");
      stub.resolves(10);
      const nonce = await inst.getNonce("2995c1376a852e4040caf9dbae2c765e24c37a15");
      expect(nonce).to.equal(10);
    });
  });

  describe("test signTransaction", function () {
    it("return correct result: legacy", async function () {
      let inst = new Ethereum(config.MOCK_NODE);
      inst.initWeb3();
      const to = "0x3907acb4c1818adf72d965c08e0a79af16e7ffb8";
      const tx = inst.getTx(config.ETHEREUM_ADDRESS, to, 0, 150000, "20000000000", "0.001", config.CALLDATA);
      expect(tx).to.deep.equal({
        data: config.CALLDATA,
        nonce: 0,
        gasPrice: "0x4a817c800",
        gas: "0x249f0",
        from: config.ETHEREUM_ADDRESS,
        to,
        value: "0x38d7ea4c68000"
      });
      const stub5 = sandbox.stub(inst._web3.eth, "getChainId");
      stub5.resolves(1);
      const stub6 = sandbox.stub(inst._web3.eth.net, "getId");
      stub6.resolves(1);
      tx.chainId = await inst._web3.eth.getChainId();
      tx.networkId = await inst._web3.eth.net.getId();
      const sign = await inst.signTransaction(tx, config.ETHEREUM_SECRET);
      expect(sign).to.equal(config.MOCK_SIGN);
      inst = new Ethereum(config.MOCK_NODE);
      inst.initWeb3();
      expect(inst.getTx(config.ETHEREUM_ADDRESS, to, 0, 150000, "20000000000", "0.001", "")).to.deep.equal({
        data: "0x0",
        nonce: 0,
        gasPrice: "0x4a817c800",
        gas: "0x249f0",
        from: config.ETHEREUM_ADDRESS,
        to,
        value: "0x38d7ea4c68000"
      });
    });

    it("return correct result: eip1559", async function () {
      let inst = new Ethereum(config.MOCK_NODE);
      inst.initWeb3();
      const to = "0x3907acb4c1818adf72d965c08e0a79af16e7ffb8";
      const tx = inst.get1559Tx(config.ETHEREUM_ADDRESS, to, 0, 150000, "30000000000", "2500000000", "0.001", config.CALLDATA);
      expect(tx).to.deep.equal({
        data: config.CALLDATA,
        nonce: 0,
        gasLimit: "0x249f0",
        maxFeePerGas: "0x6fc23ac00",
        maxPriorityFeePerGas: "0x9502f900",
        from: config.ETHEREUM_ADDRESS,
        to,
        value: "0x38d7ea4c68000"
      });
      const stub5 = sandbox.stub(inst._web3.eth, "getChainId");
      stub5.resolves(1);
      const stub6 = sandbox.stub(inst._web3.eth.net, "getId");
      stub6.resolves(1);
      tx.chainId = await inst._web3.eth.getChainId();
      tx.networkId = await inst._web3.eth.net.getId();
      const sign = await inst.signTransaction(tx, config.ETHEREUM_SECRET);
      expect(sign).to.equal(config.MOCK_SIGN_1559);

      expect(inst.get1559Tx(config.ETHEREUM_ADDRESS, to, 0, 150000, "30000000000", "2500000000", "0.001", "")).to.deep.equal({
        data: "0x0",
        nonce: 0,
        gasLimit: "0x249f0",
        maxFeePerGas: "0x6fc23ac00",
        maxPriorityFeePerGas: "0x9502f900",
        from: config.ETHEREUM_ADDRESS,
        to,
        value: "0x38d7ea4c68000"
      });
    });
  });

  describe("test sendSignedTransaction", async function () {
    let inst;
    before(() => {
      inst = new Ethereum(config.MOCK_NODE);
      inst.initWeb3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("resolve hash if success", async function () {
      const stub = sandbox.stub(inst._web3.eth, "sendSignedTransaction");
      stub.resolves({ transactionHash: "1" });
      const hash = await inst.sendSignedTransaction("test");
      expect(stub.calledOnceWith("test")).to.true;
      expect(hash).to.equal("1");
    });

    it("reject error if failed", async function () {
      const stub = sandbox.stub(inst._web3.eth, "sendSignedTransaction");
      stub.rejects(new Error("failed"));
      try {
        await inst.sendSignedTransaction("test");
      } catch (error) {
        expect(error.message).to.equal("failed");
      }
    });
  });

  describe("test contract", function () {
    it("should return contract instance", function () {
      let inst = new Ethereum(config.MOCK_NODE);
      inst.initWeb3();
      const spy = sandbox.spy(inst._web3.eth, "Contract");
      let contract = inst.contract(fingateABI, config.ETHEREUM_ADDRESS);
      expect(spy.calledOnceWith(fingateABI, config.ETHEREUM_ADDRESS)).to.true;
      expect(contract instanceof Contract).to.true;
    });
  });

  describe("test hasPendingTransactions", function () {
    let inst;
    before(() => {
      inst = new Ethereum(config.MOCK_NODE);
      inst.initWeb3();
    });

    afterEach(() => {
      sandbox.restore();
    });
    it("resolve true if has pending transaction", async function () {
      const s1 = sandbox.stub(inst._web3.eth, "getPendingTransactions");
      s1.resolves([{ from: config.ETHEREUM_ADDRESS }]);
      let hasPending = await inst.hasPendingTransactions(config.ETHEREUM_ADDRESS.substring(2));
      expect(hasPending).to.true;
    });

    it("resolve false if has't pending transaction", async function () {
      const stub = sandbox.stub(inst._web3.eth, "getPendingTransactions");
      stub.resolves([{ from: "aaa" }]);
      let hasPending = await inst.hasPendingTransactions(config.ETHEREUM_ADDRESS.substring(2));
      expect(hasPending).to.false;
      expect(stub.calledOnceWith()).to.true;
    });

    it("reject error", async function () {
      const stub = sandbox.stub(inst._web3.eth, "getPendingTransactions");
      stub.rejects(new Error("failed"));
      try {
        await inst.hasPendingTransactions(config.ETHEREUM_ADDRESS.substring(2));
      } catch (error) {
        expect(error.message).to.equal("failed");
      }
    });
  });

  describe("test hasPendingBlockTransactions", function () {
    let inst;
    before(() => {
      inst = new Ethereum(config.MOCK_NODE);
      inst.initWeb3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("resolve true if has pending block transaction", async function () {
      const s1 = sandbox.stub(inst._web3.eth, "getBlock");
      s1.resolves({ transactions: [{ from: config.ETHEREUM_ADDRESS }] });
      let hasPending = await inst.hasPendingBlockTransactions(config.ETHEREUM_ADDRESS.substring(2));
      expect(hasPending).to.true;
      expect(s1.calledOnceWith("pending", true)).to.true;
    });

    it("resolve false if has't pending block transaction", async function () {
      const stub = sandbox.stub(inst._web3.eth, "getBlock");
      stub.resolves({ transactions: [{ from: "aaa" }] });
      let hasPending = await inst.hasPendingBlockTransactions(config.ETHEREUM_ADDRESS.substring(2));
      expect(hasPending).to.false;
      expect(stub.calledOnceWith("pending", true)).to.true;
    });

    it("reject error", async function () {
      const stub = sandbox.stub(inst._web3.eth, "getBlock");
      stub.rejects(new Error("failed"));
      try {
        await inst.hasPendingBlockTransactions(config.ETHEREUM_ADDRESS.substring(2));
      } catch (error) {
        expect(error.message).to.equal("failed");
      }
    });
  });

  describe("test contractInitialied", function () {
    it("return true", function () {
      let inst = new Ethereum(config.MOCK_NODE);
      inst.initWeb3();
      let contract = inst.contract(fingateABI, config.ETHEREUM_ADDRESS);
      expect(inst.contractInitialied(contract, config.ETHEREUM_ADDRESS)).to.true;
    });

    it("return false", function () {
      let inst = new Ethereum(config.MOCK_NODE);
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

  // describe("test real network", function() {
  //   let inst;
  //   before(() => {
  //     inst = new Ethereum("http://192.168.66.254:8556", false);
  //     inst.initWeb3();
  //   });

  //   afterEach(() => {
  //     sandbox.restore();
  //   });

  //   it("send transacton", async function() {
  //     const balance = await inst.getBalance(config.ETHEREUM_ADDRESS1);
  //     console.log("wallet balance:", balance.toString());
  //     let nonce = await inst.getNonce(config.ETHEREUM_ADDRESS1);
  //     let gasPrice = await inst.getGasPrice();
  //     let tx1 = inst.getTx(config.ETHEREUM_ADDRESS1, "0xa60485fe5f685e2e37236495f36fa4e6f5b1f1f7", nonce, 50000, gasPrice, 1, "");
  //     let tx = {
  //       nonce: tx1.nonce,
  //       gasPrice: tx1.gasPrice,
  //       gasLimit: tx1.gasLimit,
  //       to: tx1.to,
  //       value: tx1.value,
  //       data: tx1.data
  //     }
  //     const sign = inst.signTransaction(tx, config.ETHEREUM_SECRET1);
  //     let hash = await inst.sendSignedTransaction(sign);
  //     console.log("transfer hash:", hash);
  //     // TODO: 此处异常，需要排查
  //     // inst.destroyWeb3();
  //   });
  // });
});
