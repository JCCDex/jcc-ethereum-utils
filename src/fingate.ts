import BigNumber from "bignumber.js";
import fingateABI from "./abi/fingateABI";
import Ethereum from "./ethereum";
import SmartContract from "./smartContract";
import { isValidAmount, isValidEthereumAddress, isValidEthereumSecret, isValidHash, isValidJingtumAddress, validate } from "./validator";

/**
 * Toolkit of Erc20Fingate
 *
 * @export
 * @class Erc20Fingate
 * @extends {EthereumFingate}
 */
class Fingate extends SmartContract {


    /**
     * Creates an instance of ERC20
     * @memberof Fingate
     */
    constructor() {
        super();
    }

    /**
     * ether gas limit
     *
     * @private
     * @type {number}
     * @memberof Fingate
     */
    private _etherGasLimit: number;

    /**
     * set & get _etherGasLimit
     *
     * @memberof EtherFingate
     */
    public set etherGasLimit(v: number) {
        this._etherGasLimit = v;
    }

    public get etherGasLimit(): number {
        return this._etherGasLimit;
    }

    /**
     * init erc20 contract
     *
     * @param {string} etherContractAddress ether fingate address
     * @param {string} tokenContractAddress contract address of erc20 token
     * @memberof Erc20Fingate
     */
    @validate
    public init(@isValidEthereumAddress fingateAddress: string, ethereum: Ethereum) {
        try {
            super.init(fingateAddress, ethereum, fingateABI);
        } catch (e) {
            throw e;
        }
    }

    /**
     * destroy instance of contract
     *
     * @memberof Fingate
     */
    public destroy() {
        super.destroy();
    }

    /**
     * check state if pending
     *
     * @param {(Array<BigNumber | string>)} state
     * @returns {boolean} return true if state is pending
     * @memberof Fingate
     */
    public isPending(state: Array<BigNumber | string>): boolean {
        return state[0].toString(10) !== "0" || state[1] !== "";
    }

    /**
     * request deposit state
     *
     * @param {string} address ethereum address
     * @param {string} [contractAddress="0x0000000000000000000000000000000000000000"] contract address
     * @returns {(Promise<Array<BigNumber | string>>)}
     * @memberof Fingate
     */
    @validate
    public depositState(@isValidEthereumAddress address: string, @isValidEthereumAddress contractAddress = "0x0000000000000000000000000000000000000000"): Promise<Array<BigNumber | string>> {
        return new Promise(async (resolve, reject) => {
            try {
                address = Ethereum.prefix0x(address);
                const state = await super.callABI("depositState", contractAddress);
                return resolve(state);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * deposit ether
     *
     * @param {string} secret ethereum secret
     * @param {string} jingtumAddress jingtum address
     * @param {string} amount deposit value
     * @returns {Promise<string>} resolve hash if success
     * @memberof Fingate
     */
    @validate
    public async deposit(@isValidEthereumSecret secret: string, @isValidJingtumAddress jingtumAddress: string, @isValidAmount amount: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const address = Ethereum.getAddress(secret);
                const calldata = await super.callABI("deposit", jingtumAddress);
                const gasPrice = await this.ethereum.getGasPrice();
                const nonce = await this.ethereum.getNonce(address);
                const value = this.ethereum.getWeb3().utils.numberToHex(this.ethereum.getWeb3().utils.toWei(new BigNumber(amount).toString(10), "ether"));
                const tx = this.ethereum.getTx(this.contract.address, nonce, this.etherGasLimit, gasPrice, value, calldata);
                const sign = this.ethereum.signTransaction(tx, secret);
                const hash = await this.ethereum.sendSignedTransaction(sign);
                return resolve(hash);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * deposit erc20 token
     *
     * @param {string} jtAddress swtc address
     * @param {string} tokenAddress erc20 contract address
     * @param {number} decimals token decimals
     * @param {string} amount amount of deposit
     * @param {string} hash generated by `transfer` api of ERC20
     * @param {string} secret ethereum secret
     * @returns {Promise<string>} reslove hash of transaction if success
     * @memberof Fingate
     */
    @validate
    public async depositToken(@isValidJingtumAddress jtAddress: string, @isValidEthereumAddress tokenAddress: string, decimals: number, @isValidAmount amount: string, @isValidHash hash: string, @isValidEthereumSecret secret: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const value = new BigNumber(amount).multipliedBy(10 ** decimals);
                const address = Ethereum.getAddress(secret);
                const nonce = await this.ethereum.getNonce(address);
                const gasPrice = await this.ethereum.getGasPrice();
                const calldata = await super.callABI("depositToken", jtAddress, tokenAddress, value, hash);
                const tx = this.ethereum.getTx(this.contract.address, nonce, 450000, gasPrice, "0x00", calldata);
                const sign = this.ethereum.signTransaction(tx, secret);
                const txHash = await this.ethereum.sendSignedTransaction(sign);
                return resolve(txHash);
            } catch (error) {
                return reject(error);
            }
        });
    }
}
export default Fingate;