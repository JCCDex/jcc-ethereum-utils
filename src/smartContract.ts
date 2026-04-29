import { Interface } from "@ethersproject/abi";
import { Contract } from "web3-eth-contract";
import Ethereum from "./ethereum";
import { ContractAbi } from "web3-types";

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
  private _contract: Contract<ContractAbi> | null;

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
  private _ethereum: Ethereum | null;

  /**
   * contract address of smart contract
   *
   * @private
   * @type {string}
   * @memberof SmartContract
   */
  private _address: string | null;

  /**
   * EthereumABI instance — set in init(), always present when callABI is invoked
   *
   * @private
   * @type {Interface}
   * @memberof SmartContract
   */
  private interface!: Interface;

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
    return this._ethereum!;
  }

  /**
   * return contract instance
   *
   * @readonly
   * @type {Contract}
   * @memberof SmartContract
   */
  public get contract(): Contract<ContractAbi> | null {
    return this._contract;
  }

  public get contractAddress(): string {
    return this._contract!.options.address!;
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
        this.interface = new Interface(this._abi);
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
    this._contract = null as unknown as Contract<ContractAbi>;
  }

  /**
   * call defined function in the abi
   *
   */
  public async callABI(name: string, ...args: unknown[]) {
    // Validate that `name` exists in the ABI before dynamic property access,
    // preventing injection of arbitrary method names.
    const fragment = this.interface.getFunction(name);
    if (!fragment) {
      throw new Error(`${name} is not defined in the contract ABI.`);
    }
    const { stateMutability } = fragment;
    if (stateMutability === "view" || stateMutability === "pure") {
      return await this._contract!.methods[name](...args).call();
    }
    return await this.interface.encodeFunctionData(name, args);
  }
}

export default SmartContract;
