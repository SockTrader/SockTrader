import { AssetDeltaUpdate, WalletUpdate } from '../interfaces';
import { WalletService } from './wallet.service';

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(() => {
    service = new WalletService();
  });

  it('Should update store by wallet update', () => {
    const walletUpdate: WalletUpdate[] = [
      { asset: 'BTC', available: 10, reserved: 5 },
      { asset: 'ETH', available: 1, reserved: 0 },
    ];

    service.updateSpotByWalletUpdate(walletUpdate);
    expect(service.store.getAvailableAssets()).toEqual([
      { asset: 'BTC', quantity: 10 },
      { asset: 'ETH', quantity: 1 },
    ]);
    expect(service.store.getReservedAssets()).toEqual([
      { asset: 'BTC', quantity: 5 },
      { asset: 'ETH', quantity: 0 },
    ]);
  });

  it('Should not overwrite previous state', () => {
    service.store.setReservedAsset('ETH', 10);
    const walletUpdate: WalletUpdate = {
      asset: 'BTC',
      available: 10,
      reserved: 5,
    };

    service.updateSpotByWalletUpdate([walletUpdate]);

    expect(service.store.getAvailableAssets()).toEqual([
      { asset: 'BTC', quantity: 10 },
    ]);
    expect(service.store.getReservedAssets()).toEqual(
      expect.arrayContaining([
        { asset: 'BTC', quantity: 5 },
        {
          asset: 'ETH',
          quantity: 10,
        },
      ])
    );
  });

  it('Should update assets in store on - delta update', () => {
    service.store.setAsset('ETH', 10);
    service.store.setReservedAsset('ETH', 10);

    const deltaUpdate: AssetDeltaUpdate = { asset: 'ETH', assetDelta: -5 };

    service.updateSpotByAssetDeltaUpdate(deltaUpdate);

    expect(service.store.getAvailableAssets()).toEqual([
      { asset: 'ETH', quantity: 5 },
    ]);
    expect(service.store.getReservedAssets()).toEqual([
      { asset: 'ETH', quantity: 10 },
    ]);
  });

  it('Should update assets in store on + delta update', () => {
    service.store.setAsset('ETH', 10);
    service.store.setReservedAsset('ETH', 10);

    const deltaUpdate: AssetDeltaUpdate = { asset: 'ETH', assetDelta: +5 };

    service.updateSpotByAssetDeltaUpdate(deltaUpdate);

    expect(service.store.getAvailableAssets()).toEqual([
      { asset: 'ETH', quantity: 15 },
    ]);
    expect(service.store.getReservedAssets()).toEqual([
      { asset: 'ETH', quantity: 10 },
    ]);
  });
});
