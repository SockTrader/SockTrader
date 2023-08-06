import { emitOnce } from '@ngneat/elf';
import {
  Asset,
  AssetDeltaUpdate,
  Candle,
  OrderCommand,
  OrderSide,
  OrderType,
  Pair,
  Trade,
  WalletUpdate,
} from '../interfaces';
import { SpotWalletQuery, SpotWalletStore } from '../stores';

export class WalletService {
  store = new SpotWalletStore();

  query = new SpotWalletQuery(this.store);

  /**
   * Will sync the available and reserved assets with the balance update.
   * @param {WalletUpdate[]} walletUpdates
   */
  updateSpotByWalletUpdate(walletUpdates: WalletUpdate[]): void {
    emitOnce(() => {
      walletUpdates.forEach((update) => {
        this.store.setAsset(update.asset, update.available);
        this.store.setReservedAsset(update.asset, update.reserved);
      });
    });
  }

  setInitialWallet(assets: Asset[]): void {
    assets.forEach((asset) => {
      this.store.setAsset(asset.asset, asset.quantity);
    });
  }

  /**
   * Will update the "available assets" based on a positive / negative delta update.
   * @param {number} assetDelta
   * @param {string} symbol
   */
  updateSpotByAssetDeltaUpdate({ assetDelta, asset }: AssetDeltaUpdate): void {
    this.store.updateAsset(asset, assetDelta);
  }

  updateSpotByOrderCommand(
    pair: Pair,
    orderCommand: OrderCommand,
    candle: Candle
  ): void {
    const price: number =
      orderCommand.type === OrderType.LIMIT
        ? <number>orderCommand.price
        : candle.close;

    if (orderCommand.side === OrderSide.BUY) {
      this.store.reserveAsset(pair[1], price * orderCommand.quantity);
    } else if (orderCommand.side === OrderSide.SELL) {
      this.store.reserveAsset(pair[0], orderCommand.quantity);
    }
  }

  updateSpotByTrade(trade: Trade, pair: Pair): void {
    if (trade.side === OrderSide.BUY) {
      this.store.releaseAsset(
        pair[1],
        pair[0],
        trade.price * trade.quantity,
        trade.quantity
      );
    } else if (trade.side === OrderSide.SELL) {
      this.store.releaseAsset(
        pair[0],
        pair[1],
        trade.quantity,
        trade.price * trade.quantity
      );
    }
  }
}
