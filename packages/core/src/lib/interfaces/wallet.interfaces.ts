export interface WalletUpdate {
  asset: string;
  available: number;
  reserved: number;
}

export interface AssetDeltaUpdate {
  asset: string;
  assetDelta: number;
}

export interface Asset {
  asset: string;
  quantity: number;
}
