const chai = require('chai');
const expect = chai.expect;
const Erc20Fingate = require('../lib').Erc20Fingate;
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const config = require("./config");
const Contract = require("web3-eth-contract");

describe('test EtherFingate', function() {
  describe('test constructor', function() {
    it("create successfully", function() {
      let inst = new Erc20Fingate(config.MOCK_NODE, true);
      inst.initErc20Contract(config.SC_ADDRESS, config.JC_CONTRACT);
      expect(inst.fingateAddress).to.equal(config.SC_ADDRESS);
      expect(inst._erc20ContractAddress).to.equal(config.JC_CONTRACT);
      expect(inst._erc20ContractInstance instanceof Contract).to.true;
      inst.decimals = 18;
      expect(inst._decimals).to.equal(18);
    });
  })

  describe("test close", function() {
    let inst = new Erc20Fingate(config.MOCK_NODE, false);
    inst.initErc20Contract(config.SC_ADDRESS, config.JC_CONTRACT);
    inst.close();
    expect(inst._erc20ContractInstance).to.equal(null);
  })

  describe("test initErc20Contract", function() {
    it("throw error if contract address is invalid", function() {
      let inst = new Erc20Fingate(config.MOCK_NODE, true);
      expect(() => inst.initErc20Contract(config.SC_ADDRESS, config.JC_CONTRACT.substring(1))).throw(`${config.JC_CONTRACT.substring(1)} is invalid ethereum address.`)
    })
  })

  describe("test balanceOf", function() {
    let inst;
    before(() => {
      inst = new Erc20Fingate(config.MOCK_NODE, true);
      inst.initErc20Contract(config.SC_ADDRESS, config.JC_CONTRACT);
      inst.decimals = 18;
    });

    afterEach(() => {
      sandbox.restore();
    })
    it("return 1 if resolve 1000000000000000000", async function() {
      const s1 = sandbox.stub(inst._erc20ContractInstance.methods, "balanceOf");
      s1.returns({
        call: function() {
          return new Promise((resolve, reject) => {
            resolve("1000000000000000000")
          })
        }
      })
      const s2 = sandbox.stub(s1, "call");
      s2.resolves();
      const balance = await inst.balanceOf(config.ETHEREUM_ADDRESS);
      expect(balance).to.equal("1");
    })

    it("return 0 if request failed", async function() {
      const s1 = sandbox.stub(inst._erc20ContractInstance.methods, "balanceOf");
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
      inst = new Erc20Fingate(config.MOCK_NODE, true);
      inst.initErc20Contract(config.SC_ADDRESS, config.JC_CONTRACT);
    })

    afterEach(() => {
      sandbox.restore();
    })

    it('amount is invalid', function done() {
      expect(() => inst.transfer(0, config.ETHEREUM_SECRET)).throw(`0 is invalid amount.`)
    })

    it('moac secret is invalid', function() {
      expect(() => inst.transfer(1, config.ETHEREUM_SECRET.substring(1))).throw(`${config.ETHEREUM_SECRET.substring(1)} is invalid ethereum secret.`)
    })

    it("throw error if not set decimals", async function() {
      try {
        await inst.transfer(1, config.ETHEREUM_SECRET)
      } catch (error) {
        expect(error.message).to.equal("Please set value of _decimals");
      }

      try {
        inst.decimals = -1;
        await inst.transfer(1, config.ETHEREUM_SECRET)
      } catch (error) {
        expect(error.message).to.equal("Please set value of _decimals");
      }
    })

    it('reject error', async function() {
      try {
        inst.decimals = 18;
        await inst.transfer(1, config.ETHEREUM_SECRET);
      } catch (error) {
        expect(error).to.be.an("error");
      }
    })

    it("transfer success", async function() {
      const s1 = sandbox.stub(inst._etherContractInstance.methods, "deposit");
      s1.returns({
        encodeABI: function() {
          return "0xa9059cbb0000000000000000000000003907acb4c1818adf72d965c08e0a79af16e7ffb8000000000000000000000000000000000000000000000000016345785d8a0000"
        }
      })
      const stub1 = sandbox.stub(inst._web3.eth, "getGasPrice");
      stub1.yields(null, "20000000000");
      const stub2 = sandbox.stub(inst._web3.eth, "getTransactionCount");
      stub2.yields(null, 0);
      const stub3 = sandbox.stub(inst._web3.eth, "sendSignedTransaction");
      stub3.yields(null, "1");
      const stub4 = sandbox.stub(inst._web3.currentProvider, "sendAsync");
      stub4.yields(null, 0);
      inst.decimals = 18;
      const hash = await inst.transfer(1, config.ETHEREUM_SECRET);
      expect(hash).to.equal("1");
      expect(stub3.calledOnceWith(config.MOCK_TRANSFER_SIGN)).to.true;
    })
  })

  describe("test depositToken", function() {
    let inst;
    before(function() {
      inst = new Erc20Fingate(config.MOCK_NODE, true);
      inst.initErc20Contract(config.SC_ADDRESS, config.JC_CONTRACT);
    })

    afterEach(() => {
      sandbox.restore();
    })

    it('amount is invalid', function done() {
      expect(() => inst.depositToken(config.JINGTUM_ADDRESS, 0, config.MOCK_HASH, config.ETHEREUM_SECRET)).throw(`0 is invalid amount.`)
    })

    it('moac secret is invalid', function() {
      expect(() => inst.depositToken(config.JINGTUM_ADDRESS, 1, config.MOCK_HASH, config.ETHEREUM_SECRET.substring(1))).throw(`${config.ETHEREUM_SECRET.substring(1)} is invalid ethereum secret.`)
    })

    it('hash is invalid', function() {
      expect(() => inst.depositToken(config.JINGTUM_ADDRESS, 1, config.MOCK_HASH.substring(1), config.ETHEREUM_SECRET)).throw(`${config.MOCK_HASH.substring(1)} is invalid hash.`)
    })

    it("throw error if not set decimals", async function() {
      try {
        await inst.depositToken(config.JINGTUM_ADDRESS, 1, config.MOCK_HASH, config.ETHEREUM_SECRET)
      } catch (error) {
        expect(error.message).to.equal("Please set value of _decimals");
      }

      try {
        inst.decimals = -1;
        await inst.depositToken(config.JINGTUM_ADDRESS, 1, config.MOCK_HASH, config.ETHEREUM_SECRET)
      } catch (error) {
        expect(error.message).to.equal("Please set value of _decimals");
      }
    })

    it('reject error', async function() {
      try {
        inst.decimals = 18;
        await inst.depositToken(config.JINGTUM_ADDRESS, 1, config.MOCK_HASH, config.ETHEREUM_SECRET)
      } catch (error) {
        expect(error).to.be.an("error");
      }
    })

    it("depositToken success", async function() {
      const s1 = sandbox.stub(inst._etherContractInstance.methods, "deposit");
      s1.returns({
        encodeABI: function() {
          return "0xcc2c516400000000000000000000000000000000000000000000000000000000000000800000000000000000000000009bd4810a407812042f938d2f69f673843301cfa6000000000000000000000000000000000000000000000000016345785d8a00006a7826f215bb65914c7676da64956e9bbf9c45c7c542a65dad80af8ebc355ed700000000000000000000000000000000000000000000000000000000000000226a776e714b70584a594a5065416e5564565576334c666278694a68355a5658683739000000000000000000000000000000000000000000000000000000000000"
        }
      })
      const stub1 = sandbox.stub(inst._web3.eth, "getGasPrice");
      stub1.yields(null, "20000000000");
      const stub2 = sandbox.stub(inst._web3.eth, "getTransactionCount");
      stub2.yields(null, 0);
      const stub3 = sandbox.stub(inst._web3.eth, "sendSignedTransaction");
      stub3.yields(null, config.MOCK_HASH);
      const stub4 = sandbox.stub(inst._web3.currentProvider, "sendAsync");
      stub4.yields(null, 0);
      const hash = await inst.depositToken(config.JINGTUM_ADDRESS, 0.1, config.MOCK_TRANSFER_HASH, config.ETHEREUM_SECRET);
      expect(hash).to.equal(config.MOCK_HASH);
      expect(stub3.calledOnceWith(config.MOCK_DEPOSITTOKEN_SIGN)).to.true;
    })
  })
});