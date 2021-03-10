<!-- markdownlint-disable MD041 -->

# API of Ethereum

```javascript

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
private _node;

/**
 * production network
 *
 * @private
 * @type {number}
 * @memberof Ethereum
 */
private readonly MAINNET;

/**
 * test network
 *
 * @private
 * @type {number}
 * @memberof Ethereum
 */
private readonly TESTNET;

/**
 * gas limit
 *
 * @private
 * @type {number}
 * @memberof Ethereum
 */
private _gasLimit;

/**
 * min gas price
 *
 * @private
 * @type {number}
 * @memberof Ethereum
 */
private _minGasPrice;

/**
 * default gas price
 *
 * @private
 * @type {number}
 * @memberof Ethereum
 */
private _defaultGasPrice;

/**
 * set & get _gasLimit
 *
 * @type {number}
 * @memberof Ethereum
 */
gasLimit: number;

/**
 * set & get _minGasPrice
 *
 * @type {number}
 * @memberof Ethereum
 */
minGasPrice: number;

/**
 * set & get _defaultGasPrice
 *
 * @memberof Ethereum
 */
defaultGasPrice: number;

/**
 * validate ethereum address
 *
 * @static
 * @param {string} address ethereum address
 * @returns {boolean} return true if the address is valid
 * @memberof Ethereum
 */
static isValidAddress(address: string): boolean;

/**
 * validate ethereum secret
 *
 * @static
 * @param {string} secret ethereum secret
 * @returns {boolean} return true if the secret is valid
 * @memberof Ethereum
 */
static isValidSecret(secret: string): boolean;

/**
 * retrieve ethereum address via secret
 *
 * @static
 * @param {string} secret ethereum secret
 * @returns {string} return address if the secret is valid, otherwise return null
 * @memberof Ethereum
 */
static getAddress(secret: string): string;

/**
 * create ethereum wallet
 *
 * @static
 * @returns {IWalletModel}
 * @memberof Ethereum
 */
static createWallet(): IWalletModel;

/**
 * prefix `0x` if the given string not start with `0x`
 *
 * @static
 * @param {string} str
 * @returns {string}
 * @memberof Ethereum
 */
static prefix0x(str: string): string;

/**
 * filter `0x` if the given string starts with `0x`
 *
 * @static
 * @param {string} str
 * @returns {string}
 * @memberof Ethereum
 */
static filter0x(str: string): string;

/**
 * init instance of web3
 *
 * @memberof Ethereum
 */
initWeb3(): void;

/**
 * destroy instance of web3
 *
 * @memberof Ethereum
 */
destroyWeb3(): void;

/**
 * get instance of web3
 *
 * @memberof Ethereum
 */
getWeb3(): any;

/**
 * request balance of ether
 *
 * @param {string} address ethereum address
 * @returns {Promise<string>} resolve "0" if request failed
 * @memberof Ethereum
 */
getBalance(address: string): Promise<string>;

/**
 * request current gas price
 *
 * @returns {Promise<number>} resolve gas price if success
 * @memberof Ethereum
 */
getGasPrice(): Promise<number>;

/**
 * request nonce
 *
 * @param {string} address ethereum address
 * @returns {Promise<number>} resolve nonce if success
 * @memberof Ethereum
 */
getNonce(address: string): Promise<number>;

/**
 * check if has pending transaction
 *
 * @param {string} address
 * @returns {Promise<boolean>} resolve true if has pending transaction
 * @memberof Ethereum
 */
hasPendingTransactions(address: string): Promise<boolean>;

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
getTx(from: string, to: string, nonce: number, gasLimit: number, gasPrice: number, value: string, calldata: string): IEthereumTransaction;

/**
 * sign transaction with ethereum secret
 *
 * @param {IEthereumTransaction} tx transaction
 * @param {string} secret ethereum secret
 * @returns {string} return signed info
 * @memberof Ethereum
 */
signTransaction(tx: IEthereumTransaction, secret: string): Promise<string>;

/**
 * send signed transaction
 *
 * @param {string} sign
 * @returns {Promise<string>} resolve hash if success
 * @memberof Ethereum
 */
sendSignedTransaction(sign: string): Promise<string>;

/**
 * init instance of ethereum or erc20 contract
 *
 * @param {abitItem} abi definition of ethereum abi or erc20 abi
 * @param {string} address
 * @returns {Contract} return instance of ethereum or erc20 contract
 * @memberof Ethereum
 */
contract(abi: abitItem, address: string): Contract;

/**
 * check instance of contract if initialied
 *
 * @param {Contract} contract current contract instance
 * @param {string} address current contract address
 * @returns {boolean} return true if initialied
 * @memberof Ethereum
 */
contractInitialied(contract: Contract, address: string): boolean;

```

# API of ERC20

```javascript

/**
 * instance of erc20 contract
 *
 * @private
 * @type {Contract}
 * @memberof ERC20
 */
private _contract;

/**
 * instance of Ethereum
 *
 * @private
 * @type {Ethereum}
 * @memberof ERC20
 */
private _ethereum;

/**
 * contract address of erc20 token
 *
 * @private
 * @type {string}
 * @memberof ERC20
 */
private _address;

/**
 * init instance of erc20 contract
 *
 * @param {string} contractAddress contract address of erc20 token
 * @memberof ERC20
 */
init(contractAddress: string, ethereum: Ethereum): void;

/**
 * destroy instance of erc20 contract
 *
 * @memberof ERC20
 */
destroy(): void;

/**
 * request decimals of erc20 token
 *
 * @returns {Promise<number>}
 * @memberof ERC20
 */
decimals(): Promise<number>;

/**
 * request balance of erc20 token
 *
 * @param {string} address ethereum address
 * @returns {Promise<string>} resolve "0" if request failed
 * @memberof ERC20
 */
balanceOf(address: string): Promise<string>;

/**
 * transfer token to erc20 contract address
 *
 * @param {string} secret ethereum secret of sender address
 * @param {string} to address of destination
 * @param {string} amount amount
 * @param {string} [nonce] nonce
 * @returns {Promise<string>} resolve hash if success
 * @memberof ERC20
 */
transfer(secret: string, to: string, amount: string, nonce?: number): Promise<string>;

```

# API of Fingate

```javascript

/**
 * instance of contract
 *
 * @private
 * @type {Contract}
 * @memberof Fingate
 */
private _contract;

/**
 * instance of Ethereum
 *
 * @private
 * @type {Ethereum}
 * @memberof Fingate
 */
private _ethereum;

/**
 * fingate address
 *
 * @private
 * @type {string}
 * @memberof Fingate
 */
private _address;

/**
 * ether gas limit
 *
 * @private
 * @type {number}
 * @memberof Fingate
 */
private _etherGasLimit;

/**
 * set & get _etherGasLimit
 *
 * @memberof EtherFingate
 */
etherGasLimit: number;

/**
 * init erc20 contract
 *
 * @param {string} etherContractAddress ether fingate address
 * @param {string} tokenContractAddress contract address of erc20 token
 * @memberof Erc20Fingate
 */
init(fingateAddress: string, ethereum: Ethereum): void;

/**
 * destroy instance of contract
 *
 * @memberof Fingate
 */
destroy(): void;

/**
 * check state if pending
 *
 * @param {(Array<BigNumber | string>)} state
 * @returns {boolean} return true if state is pending
 * @memberof Fingate
 */
isPending(state: Array<BigNumber | string>): boolean;

/**
 * request deposit state
 *
 * @param {string} address ethereum address
 * @param {string} [contractAddress="0x0000000000000000000000000000000000000000"] contract address
 * @returns {(Promise<Array<BigNumber | string>>)}
 * @memberof Fingate
 */
depositState(address: string, contractAddress?: string): Promise<Array<BigNumber | string>>;

/**
 * deposit ether
 *
 * @param {string} secret ethereum secret
 * @param {string} jingtumAddress jingtum address
 * @param {string} amount deposit value
 * @param {string} [nonce] nonce
 * @returns {Promise<string>} resolve hash if success
 * @memberof Fingate
 */
deposit(secret: string, jingtumAddress: string, amount: string, nonce?: number): Promise<string>;

/**
 * deposit erc20 token
 *
 * @param {string} jtAddress swtc address
 * @param {string} tokenAddress erc20 contract address
 * @param {number} decimals token decimals
 * @param {string} amount amount of deposit
 * @param {string} hash generated by `transfer` api of ERC20
 * @param {string} secret ethereum secret
 * @param {string} [nonce] nonce
 * @returns {Promise<string>} reslove hash of transaction if success
 * @memberof Fingate
 */
depositToken(jtAddress: string, tokenAddress: string, decimals: number, amount: string, hash: string, secret: string, nonce?: number): Promise<string>;

```
