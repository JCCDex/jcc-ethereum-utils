"use strict";
/// <reference path = "./types/transaction.ts" />
/// <reference path = "./types/feeData.ts" />

import BigNumber from "bignumber.js";
import { ethWallet } from "jcc_wallet";
import { IWalletModel } from "jcc_wallet/lib/types";
import { Contract } from "web3-eth-contract";
const { Web3 } = require("web3");
// const contractClass = require("web3-eth-contract");
import { ContractAbi } from "web3-types";

/**
 * Toolkit of Ethereum
 *
 * @export
 * @class Ethereum
 */
export default class Ethereum {
  /**
   * instance of web3
   *
   * @protected
   * @type {*}
   * @memberof Ethereum
   */
  protected _web3: any;

  /**
   * http node
   *
   * @private
   * @type {string}
   * @memberof Ethereum
   */
  private _node: string;

  /**
   * gas limit
   *
   * @private
   * @type {number}
   * @memberof Ethereum
   */
  private _gasLimit: number;

  /**
   * min gas price
   *
   * @private
   * @type {number}
   * @memberof Ethereum
   */
  private _minGasPrice: number;

  /**
   * default gas price
   *
   * @private
   * @type {number}
   * @memberof Ethereum
   */
  private _defaultGasPrice: number;

  /**
   * min fee per gas
   *
   * @private
   * @type {number}
   * @memberof Ethereum
   */
  private _minFeePerGas: number;

  /**
   * min priority fee per gas
   *
   * @private
   * @type {number}
   * @memberof Ethereum
   */
  private _minPriorityFeePerGas: number;

  /**
   * Creates an instance of Ethereum
   * @param {string} node http node
   * @memberof Ethereum
   */
  constructor(node: string) {
    this._web3 = null;
    this._node = node;
    this._gasLimit = 200000;
    this._minGasPrice = 5 * 10 ** 9;
    this._defaultGasPrice = 10 ** 10;
    this._minFeePerGas = 5 * 10 ** 9;
    this._minPriorityFeePerGas = 10 ** 9;
  }

  /**
   * set & get _gasLimit
   *
   * @type {number}
   * @memberof Ethereum
   */
  public get gasLimit(): number {
    return this._gasLimit;
  }

  public set gasLimit(gas: number) {
    this._gasLimit = gas;
  }

  /**
   * set & get _minGasPrice
   *
   * @type {number}
   * @memberof Ethereum
   */
  public get minGasPrice(): number {
    return this._minGasPrice;
  }

  public set minGasPrice(value: number) {
    this._minGasPrice = value;
  }

  /**
   * set & get _defaultGasPrice
   *
   * @memberof Ethereum
   */
  public set defaultGasPrice(v: number) {
    this._defaultGasPrice = v;
  }

  public get defaultGasPrice(): number {
    return this._defaultGasPrice;
  }

  /**
   * set & get _minFeePerGas
   *
   * @type {number}
   * @memberof Ethereum
   */
  public set minFeePerGas(v: number) {
    this._minFeePerGas = v;
  }

  public get minFeePerGas(): number {
    return this._minFeePerGas;
  }

  /**
   * set & get _minPriorityFeePerGas
   *
   * @type {number}
   * @memberof Ethereum
   */
  public set minPriorityFeePerGas(v: number) {
    this._minPriorityFeePerGas = v;
  }

  public get minPriorityFeePerGas(): number {
    return this._minPriorityFeePerGas;
  }

  /**
   * validate ethereum address
   *
   * @static
   * @param {string} address ethereum address
   * @returns {boolean} return true if the address is valid
   * @memberof Ethereum
   */
  public static isValidAddress(address: string): boolean {
    return ethWallet.isValidAddress(address);
  }

  /**
   * validate ethereum secret
   *
   * @static
   * @param {string} secret ethereum secret
   * @returns {boolean} return true if the secret is valid
   * @memberof Ethereum
   */
  public static isValidSecret(secret: string): boolean {
    return ethWallet.isValidSecret(secret);
  }

  /**
   * retrieve ethereum address via secret
   *
   * @static
   * @param {string} secret ethereum secret
   * @returns {string} return address if the secret is valid, otherwise return null
   * @memberof Ethereum
   */
  public static getAddress(secret: string): string {
    return ethWallet.getAddress(secret);
  }

  /**
   * create ethereum wallet
   *
   * @static
   * @returns {IWalletModel}
   * @memberof Ethereum
   */
  public static createWallet(): IWalletModel {
    return ethWallet.createWallet();
  }

  /**
   * prefix `0x` if the given string not start with `0x`
   *
   * @static
   * @param {string} str
   * @returns {string}
   * @memberof Ethereum
   */
  public static prefix0x(str: string): string {
    if (str && !str.startsWith("0x")) {
      str = "0x" + str;
    }
    return str;
  }

  /**
   * filter `0x` if the given string starts with `0x`
   *
   * @static
   * @param {string} str
   * @returns {string}
   * @memberof Ethereum
   */
  public static filter0x(str: string): string {
    if (typeof str !== "string") {
      return str;
    }
    return str.startsWith("0x") ? str.substring(2) : str;
  }

  /**
   * init instance of web3
   *
   * @memberof Ethereum
   */
  public initWeb3() {
    if (!this._web3 || !this._web3.currentProvider) {
      this._web3 = new Web3(new Web3.providers.HttpProvider(this._node));
    }
  }

  /**
   * destroy instance of web3
   *
   * @memberof Ethereum
   */
  public destroyWeb3() {
    try {
      this._web3.setProvider(null);
    } catch (error) {
      /* istanbul ignore next */
    } finally {
      this._web3 = null;
    }
  }

  /**
   * get instance of web3
   *
   * @memberof Ethereum
   */
  public getWeb3() {
    return this._web3;
  }

  /**
   * request info of block
   *
   * @param {number|string} block number or string latest
   * @returns {Promise<any>} resolve null if request failed, return block info
   * @memberof Ethereum
   */
  public async getBlock(block: number | string): Promise<any> {
    let blockInfo;
    try {
      blockInfo = await this._web3.eth.getBlock(block);
    } catch (error) {
      blockInfo = null;
    }
    return blockInfo;
  }

  /**
   * request balance of ether
   *
   * @param {string} address ethereum address
   * @returns {Promise<string>} resolve "0" if request failed
   * @memberof Ethereum
   */
  public async getBalance(address: string): Promise<string> {
    const wei = await this._web3.eth.getBalance(address);
    const balance = this._web3.utils.fromWei(wei, "ether");
    return balance;
  }

  /**
   * request current gas price
   *
   * @returns {Promise<number>} resolve gas price if success
   * @memberof Ethereum
   */
  public async getGasPrice(): Promise<number> {
    try {
      const gasPrice = await this._web3.eth.getGasPrice();
      return gasPrice < this._minGasPrice ? this._minGasPrice : gasPrice;
    } catch (error) {
      return this._defaultGasPrice;
    }
  }

  /**
   * request current fee data
   *
   * @returns {Promise<IFeeData>} resolve gas price if success
   * @memberof Ethereum
   */
  public async getFeeData(): Promise<IFeeData> {
    try {
      const feeData = await this._web3.eth.calculateFeeData();
      feeData.gasPrice = feeData.gasPrice < this._minGasPrice ? this._minGasPrice : feeData.gasPrice;
      if (feeData.baseFeePerGas) {
        feeData.maxFeePerGas = feeData.maxFeePerGas < this._minGasPrice ? this._minGasPrice : feeData.maxFeePerGas;
        feeData.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas < this._minPriorityFeePerGas ? this._minPriorityFeePerGas : feeData.maxPriorityFeePerGas;
      }
      return feeData;
    } catch (error) {
      return { gasPrice: this._defaultGasPrice };
    }
  }

  /**
   * request nonce
   *
   * @param {string} address ethereum address
   * @returns {Promise<number>} resolve nonce if success
   * @memberof Ethereum
   */
  public async getNonce(address: string): Promise<number> {
    address = Ethereum.prefix0x(address);
    try {
      const ethCount = await this._web3.eth.getTransactionCount(address);

      return new Promise((resolve, reject) => {
        this._web3.currentProvider.send(
          {
            id: 1,
            jsonrpc: "2.0",
            method: "parity_nextNonce",
            params: [address]
          },
          (error, response) => {
            if (error) {
              return reject(error);
            }

            const count = new BigNumber(response.result).toNumber();
            const nonce = count > ethCount ? count : ethCount;
            return resolve(nonce);
          }
        );
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * check if has pending transaction
   *
   * @param {string} address
   * @returns {Promise<boolean>} resolve true if has pending transaction
   * @memberof Ethereum
   */
  public async hasPendingTransactions(address: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._web3.currentProvider.send(
        {
          id: 1,
          jsonrpc: "2.0",
          method: "parity_pendingTransactions",
          params: []
        },
        (err, res) => {
          if (err) {
            return reject(err);
          }
          address = Ethereum.prefix0x(address).toLowerCase();
          let i = 0;
          let hasPending = false;
          for (i = 0; i < res.result.length; i++) {
            const pending = res.result[i];
            if (address.includes(pending.from.toLowerCase())) {
              hasPending = true;
              break;
            }
          }
          return resolve(hasPending);
        }
      );
    });
  }

  /**
   * format transaction info
   *
   * @param {string} from sender address
   * @param {string} to destination address
   * @param {number} nonce nonce
   * @param {number} gasLimit gas limit
   * @param {number} gasPrice gas price
   * @param {string} value value
   * @param {string} calldata call data
   * @returns {EthereumTransaction}
   * @memberof Ethereum
   */
  public getTx(from: string, to: string, nonce: number, gasLimit: number, gasPrice: number, value: string, calldata: string): EthereumTransaction {
    const tx = {
      data: !calldata ? "0x0" : calldata,
      from,
      gas: this._web3.utils.numberToHex(gasLimit),
      gasPrice: this._web3.utils.numberToHex(gasPrice),
      nonce,
      to,
      value: value?.startsWith("0x") ? value : this._web3.utils.numberToHex(this._web3.utils.toWei(value + "", "ether"))
    };
    // 在判断uint类型时，toHex条件判断似乎有问题，所以这里使用numberToHex
    return tx;
  }

  /**
   * format EIP1559 transaction info
   *
   * @param {string} from sender address
   * @param {string} to destination address
   * @param {number} nonce nonce
   * @param {number} gasLimit gas limit
   * @param {number} maxFeePerGas max fee per gas
   * @param {number} maxPriorityFeePerGas max priority fee per gas
   * @param {string} value value
   * @param {string} calldata call data
   * @returns {EthereumTransaction}
   * @memberof Ethereum
   */
  public get1559Tx(from: string, to: string, nonce: number, gasLimit: number, maxFeePerGas: number, maxPriorityFeePerGas: number, value: string, calldata: string): EthereumTransaction {
    const tx = {
      from,
      to,
      nonce,
      value: value?.startsWith("0x") ? value : this._web3.utils.numberToHex(this._web3.utils.toWei(value + "", "ether")),
      gasLimit: this._web3.utils.numberToHex(gasLimit),
      maxFeePerGas: this._web3.utils.numberToHex(maxFeePerGas),
      maxPriorityFeePerGas: this._web3.utils.numberToHex(maxPriorityFeePerGas),
      data: !calldata ? "0x0" : calldata
    };
    return tx;
  }

  /**
   * sign transaction with ethereum secret
   *
   * @param {EthereumTransaction} tx transaction
   * @param {string} secret ethereum secret
   * @returns {Promise<string>} return signed info
   * @memberof Ethereum
   */
  public async signTransaction(tx: EthereumTransaction, secret: string): Promise<string> {
    const signed = await this._web3.eth.accounts.signTransaction(tx, secret);
    return signed.rawTransaction;
  }

  /**
   * send signed transaction
   *
   * @param {string} sign
   * @returns {Promise<string>} resolve hash if success
   * @memberof Ethereum
   */
  public async sendSignedTransaction(sign: string): Promise<string> {
    // TODO: https://web3js.readthedocs.io/en/v1.2.4/callbacks-promises-events.html#promievent
    // sendSignedTransaction会自动绑定receipt等事件，在销毁实例时会抛出错误
    try {
      const txInfo = await this._web3.eth.sendSignedTransaction(sign);
      return txInfo.transactionHash;
    } catch (error) {
      throw error;
    }
  }

  /**
   * get transaction
   *
   * @param {string} hash transaction hash
   * @returns {any} null or transaction object
   * @memberof Ethereum
   */
  public async getTransaction(hash: string): Promise<any> {
    try {
      const data = await this._web3.eth.getTransaction(hash);
      return data;
    } catch (error) {
      throw error;
    }
  }
  /**
   * get transaction receipt
   *
   * @param {string} hash transaction hash
   * @returns {any} null or transaction receipt object
   * @memberof Ethereum
   */
  public async getTransactionReceipt(hash: string): Promise<any> {
    try {
      const data = await this._web3.eth.getTransactionReceipt(hash);
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * init instance of ethereum or erc20 contract
   *
   * @param {abitItem} abi definition of ethereum abi or erc20 abi
   * @param {string} address
   * @returns {Contract} return instance of ethereum or erc20 contract
   * @memberof Ethereum
   */
  public contract(abi, address: string): Contract<ContractAbi> {
    return new this._web3.eth.Contract(abi, address);
  }

  /**
   * check instance of contract if initialied
   *
   * @param {Contract} contract current contract instance
   * @param {string} address current contract address
   * @returns {boolean} return true if initialied
   * @memberof Ethereum
   */
  public contractInitialied(contract: Contract<ContractAbi>, address: string): boolean {
    return contract instanceof Contract && contract.options.address.toLowerCase() === address.toLowerCase();
  }
}
