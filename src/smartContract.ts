import * as Contract from "web3-eth-contract";
import EthereumABI from "jcc-ethereum-abi";
import Ethereum from "./ethereum";
/**
 * toolkit of smart contract
 *
 * @class SmartContract
 */
class SmartContract {

    /**
     * instance of smart contract
     *
     * @private
     * @type {Contract}
     * @memberof SmartContract
     */
    private _contract: Contract;

    /**
     * instance of abi
     *
     * @private
     * @type {any}
     * @memberof SmartContract
     */
    private _abi: any;

    /**
     * instance of ethereum
     *
     * @private
     * @type {Ethereum}
     * @memberof SmartContract
     */
    private _ethereum: Ethereum;

    /**
     * contract address of smart contract
     *
     * @private
     * @type {string}
     * @memberof SmartContract
     */
    private _address: string;

    /**
     * EthereumABI instance
     *
     * @private
     * @type {EthereumABI}
     * @memberof SmartContract
     */
    private _ethereumABI: EthereumABI;

    /**
     * Creates an instance of SmartContract
     * @memberof SmartContract
     */
    constructor() {
        this._contract = null;
        this._address = null;
        this._ethereum = null;
    }

    /**
     * return ethereum instance
     *
     * @readonly
     * @type {Ethereum}
     * @memberof SmartContract
     */
    public get ethereum(): Ethereum {
        return this._ethereum;
    }

    /**
     * return contract instance
     *
     * @readonly
     * @type {Contract}
     * @memberof SmartContract
     */
    public get contract(): Contract {
        return this._contract;
    }

    /**
     * init instance of smart contract
     *
     * @param {string} tokenContractAddress contract address of smart contract
     * @param {Ethereum} ethereum instance
     * @param {any} abi
     * @memberof SmartContract
     */
    public init(tokenContractAddress: string, ethereum: Ethereum, abi: any) {
        try {
            if (!ethereum.contractInitialied(this._contract, tokenContractAddress)) {
                this._address = tokenContractAddress;
                this._ethereum = ethereum;
                this._abi = abi;
                this._contract = this._ethereum.contract(this._abi, this._address);
                this._ethereumABI = new EthereumABI(this._contract);
            }
        } catch (e) {
            throw e;
        }
    }

    /**
     * destroy instance of smart contract
     *
     * @memberof SmartContract
     */
    public destroy() {
        this._contract = null;
    }

    /**
     * call defined function in the abi
     *
     */
    public async callABI(name, ...args) {
        const abiItem = this._ethereumABI.getAbiItem.apply(null, [name, ...args]);
        const { stateMutability } = abiItem;

        if (stateMutability === "view" || stateMutability === "pure") {
            return await this._contract.methods[name].apply(null, args).call();
        }
        return this._ethereumABI.encode.apply(null, [name, ...args]);
    }
}

export default SmartContract;
