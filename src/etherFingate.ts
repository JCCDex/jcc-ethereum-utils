"use strict";

import BigNumber from "bignumber.js";
import * as Contract from "web3-eth-contract";
import etherABI from "./abi/etherABI";
import Ethereum from "./ethereum";
import { isValidAmount, isValidEthereumAddress, isValidEthereumSecret, isValidJingtumAddress, validate } from "./validator";

/**
 * Toolkit of EtherFingate
 *
 * @export
 * @class EtherFingate
 * @extends {Ethereum}
 */
export default class EtherFingate extends Ethereum {

    /**
     * ether contract instance
     *
     * @private
     * @type {Contract}
     * @memberof EtherFingate
     */
    private _etherContractInstance: Contract;

    /**
     * ether fingate address
     *
     * @private
     * @type {string}
     * @memberof EtherFingate
     */
    private _fingateAddress: string;

    /**
     * ether gas limit
     *
     * @private
     * @type {number}
     * @memberof EtherFingate
     */
    private _etherGasLimit: number;

    /**
     * Creates an instance of EtherFingate
     * @param {string} node http node
     * @param {boolean} mainnet production or test network
     * @memberof EtherFingate
     */
    constructor(node: string, mainnet: boolean) {
        super(node, mainnet);
        this._etherGasLimit = 150000;
        this._etherContractInstance = null;
        this._fingateAddress = null;
    }

    /**
     * get _fingateAddress
     *
     * @readonly
     * @type {string}
     * @memberof EtherFingate
     */
    public get fingateAddress(): string {
        return this._fingateAddress;
    }

    /**
     * get _etherContractInstance
     *
     * @readonly
     * @type {Contract}
     * @memberof EtherFingate
     */
    public get etherContractInstance(): Contract {
        return this._etherContractInstance;
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
     * init ether contract instance
     *
     * @param {string} fingateAddress
     * @memberof EtherFingate
     */
    @validate
    public initEtherContract(@isValidEthereumAddress fingateAddress: string) {
        try {
            super.initWeb3();
            if (!super.contractInitialied(this._etherContractInstance, fingateAddress)) {
                this._fingateAddress = fingateAddress;
                this._etherContractInstance = super.contract(etherABI, this._fingateAddress);
            }
        } catch (e) {
            /* istanbul ignore next */
            throw e;
        }
    }

    /**
     * destroy ether contract instance
     *
     * @memberof EtherFingate
     */
    public close() {
        this.clearWeb3();
        this._etherContractInstance = null;
    }

    /**
     * request deposit state
     *
     * @param {string} address ethereum address
     * @param {string} [contractAddress="0x0000000000000000000000000000000000000000"] contract address
     * @returns {(Promise<Array<BigNumber | string>>)}
     * @memberof EtherFingate
     */
    @validate
    public depositState(@isValidEthereumAddress address: string, @isValidEthereumAddress contractAddress = "0x0000000000000000000000000000000000000000"): Promise<Array<BigNumber | string>> {
        return new Promise(async (resolve, reject) => {
            try {
                address = Ethereum.prefix0x(address);
                const state = await this._etherContractInstance.methods.depositState(contractAddress, address).call();
                return resolve(state);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * check state if pending
     *
     * @param {(Array<BigNumber | string>)} state
     * @returns {boolean} return true if state is pending
     * @memberof EtherFingate
     */
    public isPending(state: Array<BigNumber | string>): boolean {
        return state[0].toString(10) !== "0" || state[1] !== "";
    }

    /**
     * deposit ether
     *
     * @param {string} secret ethereum secret
     * @param {string} jingtumAddress jingtum address
     * @param {number} amount deposit value
     * @returns {Promise<string>} resolve hash if success
     * @memberof EtherFingate
     */
    @validate
    public async deposit(@isValidEthereumSecret secret: string, @isValidJingtumAddress jingtumAddress: string, @isValidAmount amount: number): Promise<string> {
        try {
            const address = Ethereum.getAddress(secret);
            const calldata = this._etherContractInstance.methods.deposit(jingtumAddress).encodeABI();
            const gasPrice = await super.getGasPrice();
            const nonce = await super.getNonce(address);
            const value = this._web3.utils.numberToHex(this._web3.utils.toWei(new BigNumber(amount).toString(10), "ether"));
            const tx = super.getTx(this._fingateAddress, nonce, this.etherGasLimit, gasPrice, value, calldata);
            const sign = super.signTransaction(tx, secret);
            const hash = await super.sendSignedTransaction(sign);
            return hash;
        } catch (err) {
            throw err;
        }
    }
}
