import BigNumber from "bignumber.js";
import * as Contract from "web3-eth-contract";
import erc20ABI from "./abi/erc20ABI";
import Ethereum from "./ethereum";
import { isValidAmount, isValidEthereumAddress, isValidEthereumSecret, validate } from "./validator";

/**
 * toolkit of erc20
 *
 * @class ERC20
 */
export default class ERC20 {

    /**
     * instance of erc20 contract
     *
     * @private
     * @type {Contract}
     * @memberof ERC20
     */
    private _contract: Contract;

    /**
     * instance of Ethereum
     *
     * @private
     * @type {Ethereum}
     * @memberof ERC20
     */
    private _ethereum: Ethereum;

    /**
     * contract address of erc20 token
     *
     * @private
     * @type {string}
     * @memberof ERC20
     */
    private _address: string;

    /**
     * Creates an instance of ERC20.
     * @memberof ERC20
     */
    constructor() {
        this._contract = null;
        this._address = null;
        this._ethereum = null;
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
            if (!ethereum.contractInitialied(this._contract, contractAddress)) {
                this._address = contractAddress;
                this._ethereum = ethereum;
                this._contract = this._ethereum.contract(erc20ABI, this._address);
            }
        } catch (e) {
            /* istanbul ignore next */
            throw e;
        }
    }

    /**
     * destroy instance of erc20 contract
     *
     * @memberof ERC20
     */
    public destroy() {
        this._contract = null;
        this._ethereum.destroyWeb3();
    }

    /**
     * request decimals of erc20 token
     *
     * @returns {Promise<number>}
     * @memberof ERC20
     */
    public async decimals(): Promise<number> {
        const decimals = await this._contract.methods.decimals().call();
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
        let balance: string;
        try {
            const bnBalance = await this._contract.methods.balanceOf(address).call();
            const decimals = await this.decimals();
            balance = new BigNumber(bnBalance).dividedBy(10 ** decimals).toString(10);
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
        try {
            const decimals = await this.decimals();
            const sender = Ethereum.getAddress(secret);
            const value = this._ethereum.getWeb3().utils.toHex(new BigNumber(amount).multipliedBy(10 ** decimals).toString(10));
            const erc20Data = this._contract.methods.transfer(to, value).encodeABI();
            const nonce = await this._ethereum.getNonce(sender);
            const gasPrice = await this._ethereum.getGasPrice();
            const tx = this._ethereum.getTx(this._address, nonce, 90000, gasPrice, "0x00", erc20Data);
            const sign = this._ethereum.signTransaction(tx, secret);
            const hash = await this._ethereum.sendSignedTransaction(sign);
            return hash;
        } catch (error) {
            throw error;
        }
    }
}
