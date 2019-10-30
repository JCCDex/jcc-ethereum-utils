const chai = require('chai');
const expect = chai.expect;
const SmartContract = require('../lib').smartContract;
const Ethereum = require('../lib').Ethereum;
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const BigNumber = require('bignumber.js');
const config = require("./config");
describe('test smartContract', function () {

  describe("test constructor", function () {
    it("create successfully", function () {
      let ethereum = new Ethereum(config.MOCK_NODE, true);
      ethereum.initWeb3();
      let inst = new SmartContract();
      inst.init(config.ETHEREUM_ADDRESS, ethereum, config.ETHEREUM_ERC20_ABI);
      expect(inst._address).to.equal(config.ETHEREUM_ADDRESS);
    })
  })

  describe('test init smartContract', function () {
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

    it("instance of contract had been not initialied", function () {
      inst.init(config.ETHEREUM_ADDRESS, ethereum, config.ETHEREUM_ERC20_ABI);
      let instance = inst._contract;
      expect(instance).to.not.null;
      inst.init(config.ETHEREUM_SMART_CONTRACT_ADDRESS, ethereum, config.ETHEREUM_ERC20_ABI);
      expect(inst._contract).to.not.null;
      expect(inst._contract).to.not.deep.equal(instance);
    })

    it("instance of contract had been initialied", function () {
      inst.init(config.ETHEREUM_ADDRESS, ethereum, config.ETHEREUM_ERC20_ABI);
      let instance = inst._contract;
      expect(instance).to.not.null;
      inst.init(config.ETHEREUM_ADDRESS, ethereum, config.ETHEREUM_ERC20_ABI);
      expect(inst._contract).to.not.null;
      expect(inst._contract).to.deep.equal(instance);
    })

    it('throws error if init error', function () {
      let stub = sandbox.stub(ethereum, "contract");
      stub.throws(new Error("create smart contract instance in error"));
      expect(() => inst.init(config.ETHEREUM_ERC20_ADDRESS, ethereum, config.ETHEREUM_ERC20_ABI)).throw("create smart contract instance in error");
    })
  })

  describe("test close", function () {
    it("close", function () {
      let ethereum = new Ethereum(config.MOCK_NODE, true);
      ethereum.initWeb3();
      let inst = new SmartContract()
      inst.init(config.ETHEREUM_ADDRESS, ethereum, config.ETHEREUM_ERC20_ABI);
      ethereum.destroyWeb3();
      inst.destroy();
      expect(inst._contract).to.null;
      expect(ethereum._web3).to.null;
    })
  })
});