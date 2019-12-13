const chai = require('chai');
const expect = chai.expect;
const erc20ABI = require("../lib/abi/erc20ABI");
const SmartContract = require('../lib').smartContract;
const Ethereum = require('../lib').Ethereum;
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const BigNumber = require('bignumber.js');
const config = require("./config");
describe('test smartContract', function() {

  describe("test constructor", function() {
    it("create successfully", function() {
      let ethereum = new Ethereum(config.MOCK_NODE, true);
      ethereum.initWeb3();
      let inst = new SmartContract();
      inst.init(config.ETHEREUM_ADDRESS, ethereum, erc20ABI.default);
      expect(inst._address).to.equal(config.ETHEREUM_ADDRESS);
    })
  })

  describe('test init smartContract', function() {
    let inst
    let ethereum
    beforeEach(() => {
      ethereum = new Ethereum(config.MOCK_NODE, true);
      ethereum.initWeb3();
      inst = new SmartContract();
    })

    afterEach(() => {
      ethereum.destroyWeb3()
      inst.destroy();
    });

    it("instance of contract had been not initialied", function() {
      inst.init(config.ETHEREUM_ADDRESS, ethereum, erc20ABI.default);
      let instance = inst.contract;
      expect(instance).to.not.null;
      inst.init("0x9bd4810a407812042f938d2f69f673843301cfa6", ethereum, erc20ABI.default);
      expect(inst.contract).to.not.null;
      expect(inst.contract).to.not.deep.equal(instance);
    })

    it("instance of contract had been initialied", function() {
      inst.init(config.ETHEREUM_ADDRESS, ethereum, erc20ABI.default);
      let instance = inst._contract;
      expect(instance).to.not.null;
      inst.init(config.ETHEREUM_ADDRESS, ethereum, erc20ABI.default);
      expect(inst._contract).to.not.null;
      expect(inst._contract).to.deep.equal(instance);
    })

    it('throws error if init error', function() {
      let stub = sandbox.stub(ethereum, "contract");
      stub.throws(new Error("create smart contract instance in error"));
      expect(() => inst.init(config.ETHEREUM_ADDRESS, ethereum, erc20ABI.default)).throw("create smart contract instance in error");
    })
  })

  describe("test close", function() {
    it("close", function() {
      let ethereum = new Ethereum(config.MOCK_NODE, true);
      ethereum.initWeb3();
      let inst = new SmartContract()
      inst.init(config.ETHEREUM_ADDRESS, ethereum, erc20ABI.default);
      ethereum.destroyWeb3();
      inst.destroy();
      expect(inst._contract).to.null;
      expect(ethereum._web3).to.null;
    })
  })
});