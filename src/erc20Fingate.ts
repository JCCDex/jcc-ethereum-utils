import BigNumber from "bignumber.js";
import * as Contract from "web3-eth-contract";
import erc20ABI from "./abi/erc20ABI";
import EthereumFingate from "./etherFingate";
import { isValidAmount, isValidEthereumAddress, isValidEthereumSecret, isValidHash, isValidJingtumAddress, validate } from "./validator";

/**
 * Toolkit of Erc20Fingate
 *
 * @export
 * @class Erc20Fingate
 * @extends {EthereumFingate}
 */
export default class Erc20Fingate extends EthereumFingate {

    /**
     * erc20 contract instance
     *
     * @private
     * @type {Contract}
     * @memberof Erc20Fingate
     */
    private _erc20ContractInstance: Contract;

    /**
     * erc20 contract address
     *
     * @private
     * @type {string}
     * @memberof Erc20Fingate
     */
    private _erc20ContractAddress: string;

    /**
     * decimals of erc20 token
     *
     * @private
     * @type {number}
     * @memberof Erc20Fingate
     */
    private _decimals: number;

    /**
     * Creates an instance of Erc20Fingate
     * @param {string} node http node
     * @param {boolean} mainnet production or test network
     * @memberof Erc20Fingate
     */
    constructor(node: string, mainnet: boolean) {
        /* istanbul ignore next */

        super(node, mainnet);
        this._erc20ContractInstance = null;
        this._erc20ContractAddress = null;
    }

    /**
     * set decimals of erc20 token, please set firstly.
     *
     * @memberof Erc20Fingate
     */
    public set decimals(v: number) {
        this._decimals = v;
    }

    /**
     * init erc20 contract
     *
     * @param {string} etherContractAddress ether fingate address
     * @param {string} tokenContractAddress contract address of erc20 token
     * @memberof Erc20Fingate
     */
    @validate
    public initErc20Contract(@isValidEthereumAddress etherContractAddress: string, @isValidEthereumAddress tokenContractAddress: string) {
        try {
            super.initEtherContract(etherContractAddress);
            if (!super.contractInitialied(this._erc20ContractInstance, tokenContractAddress)) {
                this._erc20ContractAddress = tokenContractAddress;
                this._erc20ContractInstance = super.contract(erc20ABI, this._erc20ContractAddress);
            }
        } catch (e) {
            /* istanbul ignore next */
            throw e;
        }
    }

    /**
     * destroy instance of erc20 contract
     *
     * @memberof Erc20Fingate
     */
    public close() {
        super.close();
        this._erc20ContractInstance = null;
    }

    /**
     * request balance of erc20 token
     *
     * @param {string} address ethereum address
     * @returns {Promise<string>} resolve "0" if request failed
     * @memberof Erc20Fingate
     */
    public async balanceOf(address: string): Promise<string> {
        let balance: string;
        try {
            const bnBalance = await this._erc20ContractInstance.methods.balanceOf(address).call();
            balance = new BigNumber(bnBalance).dividedBy(10 ** this._decimals).toString(10);
        } catch (error) {
            balance = "0";
        }
        return balance;
    }

    /**
     * transfer token to erc20 contract address
     *
     * @param {number} amount value of transfer
     * @param {string} secret ethereum secret
     * @returns {Promise<string>} resolve hash if success
     * @memberof Erc20Fingate
     */
    @validate
    public async transfer(@isValidAmount amount: number, @isValidEthereumSecret secret: string): Promise<string> {
        try {
            if (!Number.isInteger(this._decimals) || this._decimals < 0) {
                throw new Error("Please set value of _decimals");
            }
            const address = Erc20Fingate.getAddress(secret);
            const value = this._web3.utils.toHex(new BigNumber(amount).multipliedBy(10 ** this._decimals).toString(10));
            const erc20Data = this._erc20ContractInstance.methods.transfer(this.fingateAddress, value).encodeABI();
            const nonce = await this.getNonce(address);
            const gasPrice = await this.getGasPrice();
            const tx = this.getTx(this._erc20ContractAddress, nonce, 90000, gasPrice, "0x00", erc20Data);
            const sign = this.signTransaction(tx, secret);
            const hash = await this.sendSignedTransaction(sign);
            return hash;
        } catch (error) {
            throw error;
        }
    }

    /**
     * submit transfer info to ether fingate contract
     *
     * @param {string} jtAddress swtc address
     * @param {number} amount value of transfer
     * @param {string} hash transfer hash
     * @param {string} secret ethereum secret
     * @returns {Promise<string>} resolve hash if success
     * @memberof Erc20Fingate
     */
    @validate
    public async depositToken(@isValidJingtumAddress jtAddress: string, @isValidAmount amount: number, @isValidHash hash: string, @isValidEthereumSecret secret: string): Promise<string> {
        try {
            if (!Number.isInteger(this._decimals) || this._decimals < 0) {
                throw new Error("Please set value of _decimals");
            }
            const address = Erc20Fingate.getAddress(secret);
            const value = this._web3.utils.toHex(new BigNumber(amount).multipliedBy(10 ** this._decimals).toString(10));
            const gasPrice = await this.getGasPrice();
            const nonce = await this.getNonce(address);
            const calldata = this.etherContractInstance.methods.depositToken(jtAddress, this._erc20ContractAddress, value, hash).encodeABI();
            const tx = this.getTx(this.fingateAddress, nonce, 450000, gasPrice, "0x00", calldata);
            const sign = this.signTransaction(tx, secret);
            const depositHash = await this.sendSignedTransaction(sign);
            return depositHash;
        } catch (error) {
            throw error;
        }
    }
}
