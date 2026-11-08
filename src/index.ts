export interface EDPayConfig {
  publicKey: string;
  privateKey: string;
  baseUrl?: string;
}

export class EDPayClient {
  public readonly publicKey: string;
  public readonly privateKey: string;
  public readonly baseUrl: string;

  constructor(config: EDPayConfig) {
    this.publicKey = config.publicKey;
    this.privateKey = config.privateKey;
    this.baseUrl = (config.baseUrl || "https://api-pay.edutecka.com").replace(/\/$/, "");
  }
}
