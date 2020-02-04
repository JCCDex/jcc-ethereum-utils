const ensABI = require("./ensABI");
const SmartContract = require("../lib").smartContract;
const Ethereum = require("../lib").Ethereum;
const config = require("./config");
const namehash = require("eth-ens-namehash").hash;

(async () => {
  console.log("ropsten");
  try {
    let ethereum = new Ethereum("http://192.168.66.254:8556", false);
    ethereum.initWeb3();

    let inst = new SmartContract();
    inst.init("0x8F12edfdf36658ca69E18F0D65a5A9f6e2f1A583", ethereum, ensABI);

    let ret = await inst.callABI("owner", namehash("BTC"));
    console.log(ret, ethereum._web3.utils.sha3("BTC"), namehash("BTC"));

    let calldata = await inst.callABI("setSubnodeOwner", "0x0", ethereum._web3.utils.sha3("BTC"), config.ETHEREUM_ADDRESS);
    console.log("calldata: ", calldata);

    let nonce = await ethereum.getNonce(config.ETHEREUM_ADDRESS);

    let gasPrice = await ethereum.getGasPrice();
    let tx = ethereum.getTx(config.ETHEREUM_ADDRESS, "0x8F12edfdf36658ca69E18F0D65a5A9f6e2f1A583", nonce, 50000, gasPrice, "0", calldata);
    const hash = await ethereum.sendSignedTransaction(ethereum.signTransaction(tx, config.ETHEREUM_SECRET));
    console.log("hash:", hash);
    ethereum.destroyWeb3();
    inst.destroy();
  } catch (error) {
    console.log(error);
  }
})();
