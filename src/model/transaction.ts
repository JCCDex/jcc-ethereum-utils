export interface IEthereumTransaction {
  nonce: number;
  gasPrice: string;
  gasLimit: string;
  from: string;
  to: string;
  value: any;
  data: string;
  chainId: string;
}
