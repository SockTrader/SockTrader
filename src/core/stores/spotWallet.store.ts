import { Store, StoreConfig } from '@datorama/akita';
import { Subscription } from 'rxjs';
import { log } from '../../utils/log';
import { AssetMap } from './spotWallet.interfaces';

export interface SpotWalletState {
  assets: AssetMap
  reservedAssets: AssetMap
}

function createInitialState(): SpotWalletState {
  return {
    assets: {},
    reservedAssets: {},
  };
}

@StoreConfig({ name: 'spotWallet', resettable: true })
export class SpotWalletStore extends Store<SpotWalletState> {

  private logSubscription: Subscription;

  constructor() {
    super(createInitialState());
    this.logSubscription = this._select(v => v).pipe(log('Wallet')).subscribe();
  }

  destroy() {
    super.destroy();
    this.logSubscription.unsubscribe();
  }

  setAsset(asset: string, quantity: number): void {
    this.update(state => ({
      assets: { ...state.assets, [asset]: quantity }
    }));
  }

  setReservedAsset(asset: string, quantity: number): void {
    this.update(state => ({
      reservedAssets: { ...state.reservedAssets, [asset]: quantity }
    }));
  }

  updateAsset(asset: string, quantity: number): void {
    this.update(state => ({
      assets: this._updateAsset(state.assets, asset, quantity)
    }));
  }

  /**
   * Moves a certain amount from the 'available' assets to the 'reserved' assets
   * @param {string} asset
   * @param {number} quantity
   */
  reserveAsset(asset: string, quantity: number): void {
    const state = this.getValue();
    if (!this.hasEnough(state.assets, asset, quantity)) throw new Error(`Could not reserve ${quantity} ${asset}: insufficient funds, only ${state.assets[asset]} available`);

    this.update(state => ({
      assets: this._updateAsset(state.assets, asset, -quantity),
      reservedAssets: this._updateAsset(state.reservedAssets, asset, +quantity),
    }));
  }

  /**
   * Moves a certain amount back to the 'available' assets
   * @param {string} asset
   * @param {number} quantity
   */
  revertReserveAsset(asset: string, quantity: number): void {
    const state = this.getValue();
    if (!this.hasEnough(state.reservedAssets, asset, quantity)) throw new Error(`Could not revert reservation of ${quantity} ${asset}: insufficient funds`);

    this.update(state => ({
      assets: this._updateAsset(state.assets, asset, +quantity),
      reservedAssets: this._updateAsset(state.reservedAssets, asset, -quantity),
    }));
  }

  /**
   * Converts a certain reserved asset to a corresponding 'available' asset
   * @param {string} baseAsset
   * @param {string} quoteAsset
   * @param {number} baseQuantity
   * @param {number} quoteQuantity
   */
  releaseAsset(baseAsset: string, quoteAsset: string, baseQuantity: number, quoteQuantity: number): void {
    const state = this.getValue();
    if (!this.hasEnough(state.reservedAssets, baseAsset, baseQuantity)) throw new Error(`Could not release asset ${baseQuantity} ${baseAsset}: insufficient funds`);

    this.update(state => ({
      assets: this._updateAsset(state.assets, quoteAsset, +quoteQuantity),
      reservedAssets: this._updateAsset(state.reservedAssets, baseAsset, -baseQuantity),
    }));
  }

  private hasEnough(assets: AssetMap, asset: string, quantity: number): boolean {
    return (assets[asset] ?? 0) >= quantity;
  }

  private _updateAsset(assetMap: AssetMap, asset: string, quantity: number): AssetMap {
    const assets = { ...assetMap };
    if (!assets[asset]) assets[asset] = 0;

    assets[asset] += quantity;

    return assets;
  }

}
