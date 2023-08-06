import { SpotWalletStore } from './spotWallet.store';

describe('SpotWalletStore', () => {
  let store: SpotWalletStore;

  beforeEach(() => {
    store = new SpotWalletStore();
  });

  it('Should add available assets', () => {
    store.updateAsset('BTC', +10);
    expect(store.getAvailableAssets()).toEqual([
      { asset: 'BTC', quantity: 10 },
    ]);
  });

  it('Should subtract available assets', () => {
    store.updateAsset('BTC', -10);
    expect(store.getAvailableAssets()).toEqual([
      { asset: 'BTC', quantity: -10 },
    ]);
  });

  it('Should handle consecutive updates on available assets', () => {
    store.updateAsset('BTC', -10);
    store.updateAsset('BTC', +20);
    expect(store.getAvailableAssets()).toEqual([
      { asset: 'BTC', quantity: 10 },
    ]);
  });

  it('Should overwrite previously set state when setting assets', () => {
    store.updateAsset('BTC', +10);
    store.setAsset('BTC', 150);

    expect(store.getAvailableAssets()).toEqual([
      { asset: 'BTC', quantity: 150 },
    ]);
  });

  it('Should overwrite previously set state when setting reserved assets', () => {
    store.setReservedAsset('BTC', 10);
    store.setReservedAsset('BTC', 150);

    expect(store.getReservedAssets()).toEqual([
      { asset: 'BTC', quantity: 150 },
    ]);
  });

  it('Should move assets from available to reserved', () => {
    store.updateAsset('BTC', +10);
    store.reserveAsset('BTC', 10);

    expect(store.getAvailableAssets()).toEqual([{ asset: 'BTC', quantity: 0 }]);
    expect(store.getReservedAssets()).toEqual([{ asset: 'BTC', quantity: 10 }]);
  });

  it("Should not reserve assets if 'insufficient funds'", () => {
    expect(() => store.reserveAsset('BTC', 10)).toThrowError(
      'insufficient funds'
    );
  });

  it('Should revert reserved assets to available assets', () => {
    store.setReservedAsset('BTC', 10);
    store.revertReserveAsset('BTC', 5);

    expect(store.getAvailableAssets()).toEqual([{ asset: 'BTC', quantity: 5 }]);
    expect(store.getReservedAssets()).toEqual([{ asset: 'BTC', quantity: 5 }]);
  });

  it("Should not revert assets if 'insufficient funds'", () => {
    store.setReservedAsset('BTC', 10);
    expect(() => store.revertReserveAsset('BTC', 100)).toThrowError(
      'insufficient funds'
    );
  });

  it('Should release assets to available assets', () => {
    store.setReservedAsset('BTC', 10);
    store.releaseAsset('BTC', 'ETH', 5, 10);

    expect(store.getAvailableAssets()).toEqual([
      { asset: 'ETH', quantity: 10 },
    ]);
    expect(store.getReservedAssets()).toEqual([{ asset: 'BTC', quantity: 5 }]);
  });

  it("Should not release assets if 'insufficient funds'", () => {
    store.setReservedAsset('BTC', 10);
    expect(() => store.releaseAsset('BTC', 'ETH', 500, 10)).toThrowError(
      'insufficient funds'
    );
  });
});
