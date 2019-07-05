import BigNumber from "bignumber.js";
import * as Contract from "web3-eth-contract";
import fingateABI from "./abi/fingateABI";
import Ethereum from "./ethereum";
import { isValidAmount, isValidEthereumAddress, isValidEthereumSecret, isValidHash, isValidJingtumAddress, validate } from "./validator";

/**
 * Toolkit of Erc20Fingate
 *
 * @export
 * @class Erc20Fingate
 * @extends {EthereumFingate}
 */
export default class Fingate {

    /**
     * instance of contract
     *
     * @private
     * @type {Contract}
     * @memberof Fingate
     */
    private _contract: Contract;

    /**
     * instance of Ethereum
     *
     * @private
     * @type {Ethereum}
     * @memberof Fingate
     */
    private _ethereum: Ethereum;

    /**
     * fingate address
     *
     * @private
     * @type {string}
     * @memberof Fingate
     */
    private _address: string;

    /**
     * ether gas limit
     *
     * @private
     * @type {number}
     * @memberof Fingate
     */
    private _etherGasLimit: number;

    /**
     * Creates an instance of Fingate.
     * @memberof Fingate
     */
    constructor() {
        this._contract = null;
        this._ethereum = null;
        this._address = null;
        this._etherGasLimit = 150000;
    }

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
            if (!ethereum.contractInitialied(this._contract, fingateAddress)) {
                this._address = fingateAddress;
                this._ethereum = ethereum;
                this._contract = ethereum.contract(fingateABI, this._address);
            }
        } catch (e) {
            /* istanbul ignore next */
            throw e;
        }
    }

    /**
     * destroy instance of contract
     *
     * @memberof Fingate
     */
    public destroy() {
        this._contract = null;
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
                const state = await this._contract.methods.depositState(contractAddress, address).call();
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
        try {
            const address = Ethereum.getAddress(secret);
            const calldata = this._contract.methods.deposit(jingtumAddress).encodeABI();
            const gasPrice = await this._ethereum.getGasPrice();
            const nonce = await this._ethereum.getNonce(address);
            const value = this._ethereum.getWeb3().utils.numberToHex(this._ethereum.getWeb3().utils.toWei(new BigNumber(amount).toString(10), "ether"));
            const tx = this._ethereum.getTx(this._address, nonce, this.etherGasLimit, gasPrice, value, calldata);
            const sign = this._ethereum.signTransaction(tx, secret);
            const hash = await this._ethereum.sendSignedTransaction(sign);
            return hash;
        } catch (err) {
            throw err;
        }
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
        try {
            const address = Ethereum.getAddress(secret);
            const value = this._ethereum.getWeb3().utils.toHex(new BigNumber(amount).multipliedBy(10 ** decimals).toString(10));
            const gasPrice = await this._ethereum.getGasPrice();
            const nonce = await this._ethereum.getNonce(address);
            const calldata = this._contract.methods.depositToken(jtAddress, tokenAddress, value, hash).encodeABI();
            const tx = this._ethereum.getTx(this._address, nonce, 450000, gasPrice, "0x00", calldata);
            const sign = this._ethereum.signTransaction(tx, secret);
            const depositHash = await this._ethereum.sendSignedTransaction(sign);
            return depositHash;
        } catch (error) {
            throw error;
        }
    }
}
