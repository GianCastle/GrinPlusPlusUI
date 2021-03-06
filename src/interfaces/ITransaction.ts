export interface ITransaction {
  Id: number;
  address?: string;
  amountCredited: number;
  amountDebited: number;
  creationDate: Date;
  type: string;
  confirmedHeight: number;
  fee: number;
  slateId: string;
  slateMessage?: string;
  ouputs?: []
}
