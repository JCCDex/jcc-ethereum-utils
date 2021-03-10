declare interface IEthereumTransaction {
  nonce: number;
  gasPrice: string;
  gas: string;
  from: string;
  to: string;
  value: any;
  data: string;
}
