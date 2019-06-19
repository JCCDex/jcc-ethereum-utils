const chai = require('chai');
const expect = chai.expect;
const EtherFingate = require('../lib').EtherFingate;
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const config = require("./config");
const Contract = require("web3-eth-contract");

describe('test EtherFingate', function() {
  describe('test constructor', function() {
    it("create successfully", function() {
      let inst = new EtherFingate(config.MOCK_NODE, true);
      inst.initEtherContract(config.ETHEREUM_ADDRESS);
      expect(inst.fingateAddress).to.equal(config.ETHEREUM_ADDRESS);
      expect(inst.etherContractInstance instanceof Contract).to.true;
      expect(inst.etherGasLimit).to.equal(150000);
      inst.etherGasLimit = 1;
      expect(inst.etherGasLimit).to.equal(1);
    });
  })

  describe("test close", function() {
    let inst = new EtherFingate(config.MOCK_NODE, true);
    inst.initEtherContract(config.ETHEREUM_ADDRESS);
    const spy = sandbox.spy(inst, "clearWeb3");
    inst.close();
    expect(spy.calledOnce).to.true;
    expect(inst._etherContractInstance).to.equal(null);
  })

  describe("test depositState", async function() {
    let inst;
    before(() => {
      inst = new EtherFingate(config.MOCK_NODE, true);
      inst.initEtherContract(config.ETHEREUM_ADDRESS);
    });

    afterEach(() => {
      sandbox.restore();
    })

    it("request success", async function() {
      const s1 = sandbox.stub(inst._etherContractInstance.methods, "depositState");
      s1.returns({
        call: function() {
          return new Promise((resolve, reject) => {
            resolve({
              '0': '0',
              '1': '',
              '2': '0',
              amount: '0',
              jtaddress: '',
              state: '0'
            })
          })
        }
      })
      const s2 = sandbox.stub(s1, "call");
      s2.resolves();
      const state = await inst.depositState(config.ETHEREUM_ADDRESS);
      expect(state).to.deep.equal({
        '0': '0',
        '1': '',
        '2': '0',
        amount: '0',
        jtaddress: '',
        state: '0'
      });
      expect(s1.calledOnceWith("0x0000000000000000000000000000000000000000", config.ETHEREUM_ADDRESS)).to.true;
    })

    it("request failed", async function() {
      const s1 = sandbox.stub(inst._etherContractInstance.methods, "depositState");
      s1.returns({
        call: function() {
          return new Promise((resolve, reject) => {
            reject(new Error("network error"))
          })
        }
      })
      const s2 = sandbox.stub(s1, "call");
      s2.rejects();
      try {
        await inst.depositState(config.ETHEREUM_ADDRESS, "0x0000000000000000000000000000000000000000");
      } catch (error) {
        expect(error.message).to.equal("network error");
      }
    })
  })

  describe("test isPending", function() {
    it("return false if not pending", function() {
      inst = new EtherFingate(config.MOCK_NODE, true);
      inst.initEtherContract(config.ETHEREUM_ADDRESS);
      const state = {
        '0': '0',
        '1': '',
        '2': '0',
        amount: '0',
        jtaddress: '',
        state: '0'
      }
      expect(inst.isPending(state)).to.false;
    })

    it("return true if pending", function() {
      inst = new EtherFingate(config.MOCK_NODE, true);
      inst.initEtherContract(config.ETHEREUM_ADDRESS);
      const state = {
        '0': '1000000000000000',
        '1': 'jwnqKpXJYJPeAnUdVUv3LfbxiJh5ZVXh79',
        '2': '0',
        amount: '1000000000000000',
        jtaddress: 'jwnqKpXJYJPeAnUdVUv3LfbxiJh5ZVXh79',
        state: '0'
      }
      expect(inst.isPending(state)).to.true;
    })
  })

  describe("test deposit", function() {
    let inst;
    before(function() {
      inst = new EtherFingate(config.MOCK_NODE, true)
      inst.initEtherContract("0x3907acb4c1818adf72d965c08e0a79af16e7ffb8");
    })

    afterEach(() => {
      sandbox.restore();
    })

    it("deposit success", async function() {
      const s1 = sandbox.stub(inst._etherContractInstance.methods, "deposit");
      s1.returns({
        encodeABI: function() {
          return "0xa26e1186000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000226a776e714b70584a594a5065416e5564565576334c666278694a68355a5658683739000000000000000000000000000000000000000000000000000000000000"
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
      const hash = await inst.deposit(config.ETHEREUM_SECRET, config.JINGTUM_ADDRESS, "0.001");
      expect(hash).to.equal("1");
      expect(stub3.calledOnceWith(config.MOCK_SIGN)).to.true;
    })

    it('jingtum address is invalid', function() {
      expect(() => inst.deposit(config.ETHEREUM_SECRET, config.JINGTUM_ADDRESS.substring(1), 1)).throw(`${config.JINGTUM_ADDRESS.substring(1)} is invalid jingtum address.`);
    })

    it('amount is invalid', function done() {
      expect(() => inst.deposit(config.ETHEREUM_SECRET, config.JINGTUM_ADDRESS, 0)).throw(`0 is invalid amount.`)
    })

    it('moac secret is invalid', function() {
      expect(() => inst.deposit(config.ETHEREUM_SECRET.substring(1), config.JINGTUM_ADDRESS, 1)).throw(`${config.ETHEREUM_SECRET.substring(1)} is invalid ethereum secret.`)
    })

    it('reject error', async function() {
      try {
        await inst.deposit(config.ETHEREUM_SECRET, config.JINGTUM_ADDRESS, 0.001);
      } catch (error) {
        expect(error).to.be.an("error");
      }
    })
  })
});