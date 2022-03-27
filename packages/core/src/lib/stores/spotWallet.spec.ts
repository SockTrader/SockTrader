import { SpotWalletStore } from './spotWallet.store'

describe('SpotWalletStore', () => {
  let store: SpotWalletStore

  beforeEach(() => {
    store = new SpotWalletStore()
  })

  it('Should add available assets', () => {
    store.updateAsset('BTC', +10)
    expect(store.getValue().assets).toEqual({ 'BTC': 10 })
  })

  it('Should subtract available assets', () => {
    store.updateAsset('BTC', -10)
    expect(store.getValue().assets).toEqual({ 'BTC': -10 })
  })

  it('Should handle consecutive updates on available assets', () => {
    store.updateAsset('BTC', -10)
    store.updateAsset('BTC', +20)
    expect(store.getValue().assets).toEqual({ 'BTC': 10 })
  })

  it('Should overwrite previously set state when setting assets', () => {
    store.updateAsset('BTC', +10)
    store.setAsset('BTC', 150)

    expect(store.getValue().assets).toEqual({ 'BTC': 150 })
  })

  it('Should overwrite previously set state when setting reserved assets', () => {
    store.update({ reservedAssets: { 'BTC': 10 } })
    store.setReservedAsset('BTC', 150)

    expect(store.getValue().reservedAssets).toEqual({ 'BTC': 150 })
  })

  it('Should move assets from available to reserved', () => {
    store.updateAsset('BTC', +10)
    store.reserveAsset('BTC', 10)

    expect(store.getValue().assets).toEqual({ 'BTC': 0 })
    expect(store.getValue().reservedAssets).toEqual({ 'BTC': 10 })
  })

  it('Should not reserve assets if \'insufficient funds\'', () => {
    expect(() => store.reserveAsset('BTC', 10)).toThrowError('insufficient funds')
  })

  it('Should reverted reserved assets to available assets', () => {
    store.update({ reservedAssets: { 'BTC': 10 } })
    store.revertReserveAsset('BTC', 5)

    expect(store.getValue().assets).toEqual({ 'BTC': 5 })
    expect(store.getValue().reservedAssets).toEqual({ 'BTC': 5 })
  })

  it('Should not revert assets if \'insufficient funds\'', () => {
    store.update({ reservedAssets: { 'BTC': 10 } })
    expect(() => store.revertReserveAsset('BTC', 100)).toThrowError('insufficient funds')
  })

  it('Should release assets to available assets', () => {
    store.update({ reservedAssets: { 'BTC': 10 } })
    store.releaseAsset('BTC', 'ETH', 5, 10)

    expect(store.getValue().reservedAssets).toEqual({ 'BTC': 5 })
    expect(store.getValue().assets).toEqual({ 'ETH': 10 })
  })

  it('Should not release assets if \'insufficient funds\'', () => {
    store.update({ reservedAssets: { 'BTC': 10 } })
    expect(() => store.releaseAsset('BTC', 'ETH', 500, 10)).toThrowError('insufficient funds')
  })
})
