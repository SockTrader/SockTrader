import { AssetDeltaUpdate, WalletUpdate } from '../interfaces/wallet.interfaces';
import WalletService from './wallet.service';

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(() => {
    service = new WalletService();
  });

  it('Should update store by wallet update', () => {
    const walletUpdate: WalletUpdate[] = [
      { asset: 'BTC', available: 10, reserved: 5 },
      { asset: 'ETH', available: 1, reserved: 0 }
    ];

    service.updateSpotByWalletUpdate(walletUpdate);

    expect(service.store.getValue().assets).toEqual({ 'BTC': 10, 'ETH': 1 });
    expect(service.store.getValue().reservedAssets).toEqual({ 'BTC': 5, 'ETH': 0 });
  });

  it('Should not overwrite previous state', () => {
    service.store.update({ reservedAssets: { 'ETH': 10 } });
    const walletUpdate: WalletUpdate = { asset: 'BTC', available: 10, reserved: 5 };

    service.updateSpotByWalletUpdate([walletUpdate]);

    expect(service.store.getValue().assets).toEqual({ 'BTC': 10 });
    expect(service.store.getValue().reservedAssets).toEqual({ 'BTC': 5, 'ETH': 10 });
  });

  it('Should update assets in store on - delta update', () => {
    service.store.update({
      assets: { 'ETH': 10 },
      reservedAssets: { 'ETH': 10 }
    });
    const deltaUpdate: AssetDeltaUpdate = { asset: 'ETH', assetDelta: -5 };

    service.updateSpotByAssetDeltaUpdate(deltaUpdate);

    expect(service.store.getValue().assets).toEqual({ 'ETH': 5 });
    expect(service.store.getValue().reservedAssets).toEqual({ 'ETH': 10 });
  });

  it('Should update assets in store on + delta update', () => {
    service.store.update({
      assets: { 'ETH': 10 },
      reservedAssets: { 'ETH': 10 }
    });
    const deltaUpdate: AssetDeltaUpdate = { asset: 'ETH', assetDelta: +5 };

    service.updateSpotByAssetDeltaUpdate(deltaUpdate);

    expect(service.store.getValue().assets).toEqual({ 'ETH': 15 });
    expect(service.store.getValue().reservedAssets).toEqual({ 'ETH': 10 });
  });
});
