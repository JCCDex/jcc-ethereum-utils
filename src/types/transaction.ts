declare interface ILegacyTransaction {
  nonce: number;
  gasPrice: string;
  gas: string;
  from: string;
  to: string;
  value: any;
  data: string;
}

declare interface IEIP1559Transaction {
  from: string;
  to: string;
  nonce: number;
  value: any;
  gasLimit: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  data: string;
}

declare type EthereumTransaction = ILegacyTransaction | IEIP1559Transaction;
