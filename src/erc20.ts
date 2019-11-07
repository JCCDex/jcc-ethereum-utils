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
        try {
            super.init(contractAddress, ethereum, erc20ABI);
        } catch (e) {
            throw e;
        }
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
        return await super.callABI("decimals");
    }

    /**
     * request balance of erc20 token
     *
     * @param {string} address ethereum address
     * @returns {Promise<string>} resolve "0" if request failed
     * @memberof ERC20
     */
    public async balanceOf(address: string): Promise<string> {
        let balance: string;
        try {
            const bnBalance = await super.callABI("balanceOf", address);
            const decimals = await this.decimals();
            balance = bnBalance.dividedBy(10 ** decimals).toString(10);
        } catch (error) {
            balance = "0";
        }
        return balance;
    }

    /**
     * transfer token to erc20 contract address
     *
     * @param {string} secret ethereum secret of sender address
     * @param {string} to address of destination
     * @param {string} amount amount
     * @returns {Promise<string>} resolve hash if success
     * @memberof ERC20
     */
    @validate
    public async transfer(@isValidEthereumSecret secret: string, @isValidEthereumAddress to: string, @isValidAmount amount: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const decimals = await this.decimals();
                const sender = Ethereum.getAddress(secret);
                const value = new BigNumber(amount).multipliedBy(10 ** decimals);
                const gasPrice = await this.ethereum.getGasPrice();
                const nonce = await this.ethereum.getNonce(sender);
                const calldata = await super.callABI("transfer", to, value.toString(10));
                const tx = this.ethereum.getTx(this.contract.address, nonce, 90000, gasPrice, "0x00", calldata);
                const sign = this.ethereum.signTransaction(tx, secret);
                const hash = await this.ethereum.sendSignedTransaction(sign);
                return resolve(hash);
            } catch (error) {
                return reject(error);
            }
        });
    }
}
export default ERC20;
