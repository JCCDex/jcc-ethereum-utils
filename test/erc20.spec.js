const chai = require('chai');
const expect = chai.expect;
const ERC20 = require('../lib').ERC20;
const Ethereum = require('../lib').Ethereum;
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const config = require("./config");
const Contract = require("web3-eth-contract");

describe('test EtherFingate', function() {
  describe('test constructor', function() {
    it("create successfully", function() {
      let inst = new ERC20();
      const ethereum = new Ethereum(config.MOCK_NODE, true);
      ethereum.initWeb3();
      const spy = sandbox.spy(ethereum, "contract");
      inst.init(config.JC_CONTRACT, ethereum);
      expect(spy.calledOnce).to.true;
      inst.init(config.JC_CONTRACT, ethereum);
      expect(spy.calledOnce).to.true;
      expect(inst._address).to.equal(config.JC_CONTRACT);
      expect(inst._contract instanceof Contract).to.true;
      expect(inst._ethereum).to.deep.equal(ethereum);
      sandbox.restore();
    });
  })

  it("destroy and destroyWeb3 should be called once", function() {
    let inst = new ERC20();
    const ethereum = new Ethereum(config.MOCK_NODE, true);
    ethereum.initWeb3();
    inst.init(config.ETHEREUM_ADDRESS, ethereum);
    const spy = sandbox.spy(inst._ethereum, "destroyWeb3");
    inst.destroy();
    expect(spy.calledOnce).to.true;
    expect(inst._contract).to.equal(null);
    sandbox.restore();
  })

  describe("test balanceOf", function() {
    let inst;
    before(() => {
      inst = new ERC20();
      const ethereum = new Ethereum(config.MOCK_NODE, true);
      ethereum.initWeb3();
      inst.init(config.JC_CONTRACT, ethereum);
    });

    afterEach(() => {
      sandbox.restore();
    })

    it("return 1 if resolve 1000000000000000000", async function() {
      const s1 = sandbox.stub(inst._contract.methods, "balanceOf");
      s1.returns({
        call: function() {
          return new Promise((resolve, reject) => {
            resolve("1000000000000000000")
          })
        }
      })
      const s2 = sandbox.stub(s1, "call");
      s2.resolves();
      const s3 = sandbox.stub(inst._contract.methods, "decimals");
      s3.returns({
        call: function() {
          return new Promise((resolve, reject) => {
            resolve("18")
          })
        }
      })
      const s4 = sandbox.stub(s3, "call");
      s4.resolves();
      const balance = await inst.balanceOf(config.ETHEREUM_ADDRESS);
      expect(balance).to.equal("1");
    })

    it("return 0 if request failed", async function() {
      const s1 = sandbox.stub(inst._contract.methods, "balanceOf");
      s1.returns({
        call: function() {
          return new Promise((resolve, reject) => {
            reject(new Error("network error"))
          })
        }
      })
      const s2 = sandbox.stub(s1, "call");
      s2.rejects();
      const balance = await inst.balanceOf(config.ETHEREUM_ADDRESS);
      expect(balance).to.equal("0");
    })
  })

  describe("test transfer", function() {
    let inst;
    before(function() {
      inst = new ERC20();
      const ethereum = new Ethereum(config.MOCK_NODE, true);
      ethereum.initWeb3();
      inst.init(config.JC_CONTRACT, ethereum);
    })

    afterEach(() => {
      sandbox.restore();
    })

    it('amount is invalid', function done() {
      expect(() => inst.transfer(config.ETHEREUM_SECRET, config.SC_ADDRESS, "-1")).throw(`-1 is invalid amount.`)
    })

    it('moac secret is invalid', function() {
      expect(() => inst.transfer(config.ETHEREUM_SECRET.substring(1), config.SC_ADDRESS, 1)).throw(`${config.ETHEREUM_SECRET.substring(1)} is invalid ethereum secret.`)
    })

    it('destination address is invalid', function() {
      expect(() => inst.transfer(config.ETHEREUM_SECRET, config.SC_ADDRESS.substring(1), 1)).throw(`${config.SC_ADDRESS.substring(1)} is invalid ethereum address.`)
    })

    it('reject error', async function() {
      try {
        await inst.transfer(config.ETHEREUM_SECRET, config.JC_CONTRACT, 1);
      } catch (error) {
        expect(error).to.be.an("error");
      }
    })

    it("transfer success", async function() {
      const s2 = sandbox.stub(inst._contract.methods, "decimals");
      s2.returns({
        call: function() {
          return new Promise((resolve, reject) => {
            resolve("18")
          })
        }
      })
      const s3 = sandbox.stub(s2, "call");
      s3.resolves();
      const s1 = sandbox.stub(inst._contract.methods, "transfer");
      s1.returns({
        encodeABI: function() {
          return "0xa9059cbb0000000000000000000000003907acb4c1818adf72d965c08e0a79af16e7ffb8000000000000000000000000000000000000000000000000016345785d8a0000"
        }
      })
      const stub1 = sandbox.stub(inst._ethereum.getWeb3().eth, "getGasPrice");
      stub1.yields(null, "20000000000");
      const stub2 = sandbox.stub(inst._ethereum.getWeb3().eth, "getTransactionCount");
      stub2.yields(null, 0);
      const stub3 = sandbox.stub(inst._ethereum.getWeb3().eth, "sendSignedTransaction");
      stub3.yields(null, "1");
      const stub4 = sandbox.stub(inst._ethereum.getWeb3().currentProvider, "sendAsync");
      stub4.yields(null, 0);
      const hash = await inst.transfer(config.ETHEREUM_SECRET, config.SC_ADDRESS, "1");
      expect(hash).to.equal("1");
      expect(stub3.calledOnceWith(config.MOCK_TRANSFER_SIGN)).to.true;
    })
  })
});