"use strict";
/// <reference path = "./types/transaction.ts" />

import BigNumber from "bignumber.js";
import * as ethWallet from "jcc_wallet/lib/eth";
import { IWalletModel } from "jcc_wallet/lib/types";
import { Contract } from "web3-eth-contract";
const web3 = require("web3");
const contractClass = require("web3-eth-contract");

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
      this._web3 = new web3(new web3.providers.HttpProvider(this._node));
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
    const balance = this._web3.utils.fromWei(wei);
    return balance;
  }

  /**
   * request current gas price
   *
   * @returns {Promise<number>} resolve gas price if success
   * @memberof Ethereum
   */
  public async getGasPrice(): Promise<number> {
    return new Promise((resolve) => {
      this._web3.eth.getGasPrice((err, data) => {
        if (err) {
          data = this._defaultGasPrice;
        }
        const limit = this._minGasPrice;
        if (data < limit) {
          data = limit;
        }
        return resolve(data);
      });
    });
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
    return new Promise((resolve, reject) => {
      this._web3.eth.getTransactionCount(address, (err, res) => {
        if (err) {
          return reject(err);
        }
        const ethCount = res;
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
    });
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
   * @returns {IEthereumTransaction}
   * @memberof Ethereum
   */
  public getTx(from: string, to: string, nonce: number, gasLimit: number, gasPrice: number, value: string, calldata: string): IEthereumTransaction {
    const tx = {
      data: !calldata ? "0x0" : calldata,
      from,
      gas: this._web3.utils.toHex(gasLimit),
      gasPrice: this._web3.utils.toHex(gasPrice),
      nonce,
      to,
      value: value?.startsWith("0x") ? value : this._web3.utils.toHex(this._web3.utils.toWei(value + ""))
    };
    return tx;
  }

  /**
   * sign transaction with ethereum secret
   *
   * @param {IEthereumTransaction} tx transaction
   * @param {string} secret ethereum secret
   * @returns {Promise<string>} return signed info
   * @memberof Ethereum
   */
  public async signTransaction(tx: IEthereumTransaction, secret: string): Promise<string> {
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
    return new Promise((resolve, reject) => {
      this._web3.eth.sendSignedTransaction(sign, (err, hash) => {
        if (err) {
          return reject(err);
        }
        return resolve(hash);
      });
    });
  }

  /**
   * get transaction
   *
   * @param {string} hash transaction hash
   * @returns {any} null or transaction object
   * @memberof Ethereum
   */
  public getTransaction(hash: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._web3.eth.getTransaction(hash, (err: Error, data: any) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }
  /**
   * get transaction receipt
   *
   * @param {string} hash transaction hash
   * @returns {any} null or transaction receipt object
   * @memberof Ethereum
   */
  public getTransactionReceipt(hash: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._web3.eth.getTransactionReceipt(hash, (err: Error, data: any) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }

  /**
   * init instance of ethereum or erc20 contract
   *
   * @param {abitItem} abi definition of ethereum abi or erc20 abi
   * @param {string} address
   * @returns {Contract} return instance of ethereum or erc20 contract
   * @memberof Ethereum
   */
  public contract(abi, address: string): Contract {
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
  public contractInitialied(contract: Contract, address: string): boolean {
    return contract instanceof contractClass && contract.options.address.toLowerCase() === address.toLowerCase();
  }
}
