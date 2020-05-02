import { v4 as uuidv4 } from "uuid";

export class BaseApi {
  private _mode: "DEV" | "TEST" | "PROD";
  private _protocol: string;
  private _ip: string;
  private _floonet: boolean;
  private _ports: {
    node: number;
    foreignRPC: number;
    owner: number;
    ownerRPC: number;
  } = { node: 3413, foreignRPC: 3415, owner: 3420, ownerRPC: 3421 };

  constructor(
    floonet: boolean = true,
    protocol: string = "http",
    ip: string = "127.0.0.1",
    mode: "DEV" | "TEST" | "PROD" = "DEV"
  ) {
    this._protocol = protocol;
    this._ip = ip;
    this._floonet = floonet;
    this._mode = mode;
  }

  public get mode() {
    return this._mode;
  }
  public get protocol() {
    return this._protocol;
  }
  public get ip() {
    return this._ip;
  }
  public get floonet() {
    return this._floonet;
  }
  public get ports() {
    return this._ports;
  }

  public isMainnet(): boolean {
    return !this._floonet;
  }

  private _getPort(port: number): number {
    return this.isMainnet() ? port : 10000 + port;
  }

  protected getURL(api: "node" | "foreignRPC" | "owner" | "ownerRPC"): string {
    let port = -1;
    let version = "";
    switch (api) {
      case "node":
        port = this._getPort(this._ports.node);
        version = "v1";
        break;
      case "foreignRPC":
        port = this._getPort(this._ports.foreignRPC);
        version = "v1/wallet/foreign";
        break;
      case "owner":
        port = this._getPort(this._ports.owner);
        version = "v1/wallet/owner";
        break;
      case "ownerRPC":
        port = this._ports.ownerRPC;
        version = "v2";
        break;
    }
    return `${this._protocol}://${this._ip}:${port}/${version}`;
  }

  private _getNodeURL(): string {
    return this.getURL("node");
  }

  private _getForeignRPCURL(): string {
    return this.getURL("foreignRPC");
  }

  private _getOwnerURL(): string {
    return this.getURL("owner");
  }

  private _getOwnerRPCURL(): string {
    return this.getURL("ownerRPC");
  }

  protected getRequestURL(
    call:
      | "shutdown"
      | "node_status"
      | "resync_blockchain"
      | "connected_peers"
      | "accounts"
      | "tx_receive"
      | "tx_send"
      | "tx_finalize"
      | "tor_address"
      | "tx_details"
      | "login"
      | "logout"
      | "create_wallet"
      | "restore_wallet"
      | "wallet_summary"
      | "scan_outputs"
      | "tx_estimate_fee"
      | "tx_cancel"
      | "tx_repost"
      | "retrieve_outputs"
  ): string {
    switch (call) {
      case "node_status":
        return `${this._getNodeURL()}/status`;
      case "resync_blockchain":
        return `${this._getNodeURL()}/resync`;
      case "connected_peers":
        return `${this._getNodeURL()}/peers/connected`;
      case "accounts":
        return `${this._getOwnerURL()}/accounts`;
      case "shutdown":
        return `${this._getNodeURL()}/shutdown`;
      case "tx_send":
        return `${this._getOwnerRPCURL()}`;
      case "tx_finalize":
        return `${this._getOwnerRPCURL()}`;
      case "tx_receive":
        return `${this._getOwnerRPCURL()}`;
      case "tor_address":
        return `${this._getOwnerRPCURL()}`;
      case "tx_details":
        return `${this._getForeignRPCURL()}`;
      case "login":
        return `${this._getOwnerRPCURL()}`;
      case "logout":
        return `${this._getOwnerURL()}/logout`;
      case "create_wallet":
        return `${this._getOwnerURL()}/create_wallet`;
      case "restore_wallet":
        return `${this._getOwnerURL()}/restore_wallet`;
      case "scan_outputs":
        return `${this._getOwnerURL()}/update_wallet`;
      case "wallet_summary":
        return `${this._getOwnerURL()}/retrieve_summary_info`;
      case "tx_estimate_fee":
        return `${this._getOwnerURL()}/estimate_fee`;
      case "tx_cancel":
        return `${this._getOwnerURL()}/cancel_tx`;
      case "tx_repost":
        return `${this._getOwnerURL()}/repost_tx`;
      case "retrieve_outputs":
        return `${this._getOwnerURL()}/retrieve_outputs`;
      default:
        return "";
    }
  }

  protected async makeRESTRequest(
    url: string,
    method: string,
    headers?: {},
    body?: {}
  ): Promise<string> {
    let request = window.require("request");
    let options = {
      timeout: 5000,
      pool: { maxSockets: 100 },
      url: url,
      method: method,
      headers: headers,
      body: JSON.stringify(body),
    };
    return new Promise((resolve, reject) => {
      request(options, (error: any, response: any, body: string) => {
        if (error) reject(error);
        else if (body === undefined) reject(error);
        else resolve(body);
      });
    });
  }

  protected async makeRPCRequest(
    url: string,
    method: string,
    params: {} | []
  ): Promise<any> {
    const request = window.require("request");
    let options = {
      timeout: 60000,
      url: url,
      agent: false,
      pool: { maxSockets: 100 },
      headers: {
        Accept: "application/json, text/plain, */*",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: uuidv4(),
        method: method,
        params: params,
      }),
    };
    return new Promise((resolve, reject) => {
      request.post(options, (error: string, response: {}, body: string) => {
        if (error) {
          reject(error);
        } else if (body === undefined) reject(error);
        else resolve(JSON.parse(body));
      });
    });
  }
}
