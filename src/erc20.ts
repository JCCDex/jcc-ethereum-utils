import BigNumber from "bignumber.js";
import erc20ABI from "./abi/erc20ABI";
import Ethereum from "./ethereum";
import SmartContract from "./smartContract";
import { isValidAmount, isValidEthereumAddress, isValidEthereumSecret, validate } from "./validator";

/**
 * toolkit of erc20
 *
 * @class ERC20
 */

class ERC20 extends SmartContract {
  /**
   * Creates an instance of ERC20
   * @memberof ERC20
   */
  constructor() {
    super();
  }

  /**
   * init instance of erc20 contract
   *
   * @param {string} contractAddress contract address of erc20 token
   * @memberof ERC20
   */
  @validate
  public init(@isValidEthereumAddress contractAddress: string, ethereum: Ethereum) {
    super.init(contractAddress, ethereum, erc20ABI);
  }

  /**
   * destroy instance of erc20 contract
   *
   * @memberof ERC20
   */
  public destroy() {
    super.destroy();
  }

  /**
   * request decimals of erc20 token
   *
   * @returns {Promise<number>}
   * @memberof ERC20
   */
  public async decimals(): Promise<number> {
    const decimals = await super.callABI("decimals");
    return parseInt(decimals, 10);
  }

  /**
   * request balance of erc20 token
   *
   * @param {string} address ethereum address
   * @returns {Promise<string>} resolve "0" if request failed
   * @memberof ERC20
   */
  public async balanceOf(address: string): Promise<string> {
    const bnBalance = await super.callABI("balanceOf", address);
    const decimals = await this.decimals();
    const balance = new BigNumber(bnBalance).dividedBy(10 ** decimals).toString(10);
    return balance;
  }

  /**
   * transfer token to erc20 contract address
   *
   * @param {string} secret ethereum secret of sender address
   * @param {string} to address of destination
   * @param {string} amount amount
   * @param {string} [nonce] nonce
   * @returns {Promise<string>} resolve hash if success
   * @memberof ERC20
   */
  @validate
  public async transfer(@isValidEthereumSecret secret: string, @isValidEthereumAddress to: string, @isValidAmount amount: string, nonce?: number): Promise<string> {
    const decimals = await this.decimals();
    const sender = Ethereum.getAddress(secret);
    const value = this.ethereum.getWeb3().utils.toHex(new BigNumber(amount).multipliedBy(10 ** decimals).toString(10));
    const gasPrice = await this.ethereum.getGasPrice();
    nonce = new BigNumber(nonce).isInteger() ? nonce : await this.ethereum.getNonce(sender);
    const calldata = await super.callABI("transfer", to, value);
    const tx = this.ethereum.getTx(sender, this.contractAddress, nonce, 90000, gasPrice, "0", calldata);
    const sign = await this.ethereum.signTransaction(tx, secret);
    const hash = await this.ethereum.sendSignedTransaction(sign);
    return hash;
  }
}
export default ERC20;
