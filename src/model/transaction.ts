export interface IEthereumTransaction {
  nonce: number;
  gasPrice: string;
  gasLimit: string;
  to: string;
  value: string;
  data: string;
  chainId: number;
}
