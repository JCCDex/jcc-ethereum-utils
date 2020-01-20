const chai = require("chai");
const expect = chai.expect;
const erc20ABI = require("../lib/abi/erc20ABI");
const ensABI = require("../lib/abi/ensABI");
const SmartContract = require("../lib").smartContract;
const Ethereum = require("../lib").Ethereum;
const sinon = require("sinon");
const sandbox = sinon.createSandbox();
const BigNumber = require("bignumber.js");
const config = require("./config");
const namehash = require("eth-ens-namehash").hash;

describe("test smartContract", function() {
  describe("test constructor", function() {
    it("create successfully", function() {
      let ethereum = new Ethereum(config.MOCK_NODE, true);
      ethereum.initWeb3();
      let inst = new SmartContract();
      inst.init(config.ETHEREUM_ADDRESS, ethereum, erc20ABI.default);
      expect(inst._address).to.equal(config.ETHEREUM_ADDRESS);
    });
  });

  describe("test init smartContract", function() {
    let inst;
    let ethereum;
    beforeEach(() => {
      ethereum = new Ethereum(config.MOCK_NODE, true);
      ethereum.initWeb3();
      inst = new SmartContract();
    });

    afterEach(() => {
      ethereum.destroyWeb3();
      inst.destroy();
    });

    it("instance of contract had been not initialied", function() {
      inst.init(config.ETHEREUM_ADDRESS, ethereum, erc20ABI.default);
      let instance = inst.contract;
      expect(instance).to.not.null;
      inst.init("0x9bd4810a407812042f938d2f69f673843301cfa6", ethereum, erc20ABI.default);
      expect(inst.contract).to.not.null;
      expect(inst.contract).to.not.deep.equal(instance);
    });

    it("instance of contract had been initialied", function() {
      inst.init(config.ETHEREUM_ADDRESS, ethereum, erc20ABI.default);
      let instance = inst._contract;
      expect(instance).to.not.null;
      inst.init(config.ETHEREUM_ADDRESS, ethereum, erc20ABI.default);
      expect(inst._contract).to.not.null;
      expect(inst._contract).to.deep.equal(instance);
    });

    it("throws error if init error", function() {
      let stub = sandbox.stub(ethereum, "contract");
      stub.throws(new Error("create smart contract instance in error"));
      expect(() => inst.init(config.ETHEREUM_ADDRESS, ethereum, erc20ABI.default)).throw("create smart contract instance in error");
    });
  });

  describe("test close", function() {
    it("close", function() {
      let ethereum = new Ethereum(config.MOCK_NODE, true);
      ethereum.initWeb3();
      let inst = new SmartContract();
      inst.init(config.ETHEREUM_ADDRESS, ethereum, erc20ABI.default);
      ethereum.destroyWeb3();
      inst.destroy();
      expect(inst._contract).to.null;
      expect(ethereum._web3).to.null;
    });
  });
  describe("test real call", function() {
    it("call function", async function(done) {
      let ethereum = new Ethereum("http://192.168.66.254:8556", false);
      ethereum.initWeb3();

      let inst = new SmartContract();
      inst.init("0x8F12edfdf36658ca69E18F0D65a5A9f6e2f1A583", ethereum, ensABI.default);

      let ret = await inst.callABI("owner", namehash("BTC"));
      console.log(ret, ethereum._web3.utils.sha3("BTC"), namehash("BTC"));

      calldata = await inst.callABI("setSubnodeOwner", "0x0", ethereum._web3.utils.sha3("BTC"), config.ETHEREUM_ADDRESS1);
      console.log(calldata);

      let nonce = await ethereum.getNonce(config.ETHEREUM_ADDRESS1);

      let gasPrice = await ethereum.getGasPrice();
      let tx = ethereum.getTx(config.ETHEREUM_ADDRESS1, "0x8F12edfdf36658ca69E18F0D65a5A9f6e2f1A583", nonce, 50000, gasPrice, "0", calldata);
      const hash = await ethereum.sendSignedTransaction(ethereum.signTransaction(tx, config.ETHEREUM_SECRET1));
      console.log("hash:", hash);
      done();
      ethereum.destroyWeb3();
      inst.destroy();
    });
  });
});
