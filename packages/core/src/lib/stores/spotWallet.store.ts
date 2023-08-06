import { createStore, select, Store } from '@ngneat/elf';
import {
  entitiesPropsFactory,
  getAllEntities,
  getEntity,
  upsertEntitiesById,
} from '@ngneat/elf-entities';
import { Subscription } from 'rxjs';
import { Asset } from '../interfaces';
import { log } from '../utils';

const { availableAssetEntitiesRef, withAvailableAssetEntities } =
  entitiesPropsFactory('availableAsset');
const { reservedAssetsEntitiesRef, withReservedAssetsEntities } =
  entitiesPropsFactory('reservedAssets');

export class SpotWalletStore {
  private logSubscription: Subscription;

  private store: Store = createStore(
    { name: 'spotWallet' },
    withAvailableAssetEntities<Asset, 'asset'>({ idKey: 'asset' }),
    withReservedAssetsEntities<Asset, 'asset'>({ idKey: 'asset' })
  );

  constructor() {
    this.logSubscription = this.store
      .pipe(
        select((v) => v),
        log('Wallet')
      )
      .subscribe();
  }

  getStoreInstance(): Store {
    return this.store;
  }

  destroy() {
    this.logSubscription.unsubscribe();
  }

  getAvailableAssets() {
    return this.store.query(getAllEntities({ ref: availableAssetEntitiesRef }));
  }

  getReservedAssets() {
    return this.store.query(getAllEntities({ ref: reservedAssetsEntitiesRef }));
  }

  setAsset(asset: string, quantity: number): void {
    this.applyTransactions([
      {
        asset: asset,
        quantity: quantity,
        update: false,
        type: EntityType.AVAILABLE,
      },
    ]);
  }

  setReservedAsset(asset: string, quantity: number): void {
    this.applyTransactions([
      {
        asset: asset,
        quantity: quantity,
        update: false,
        type: EntityType.RESERVED,
      },
    ]);
  }

  updateAsset(asset: string, quantity: number): void {
    this.applyTransactions([
      {
        asset: asset,
        quantity: quantity,
        update: true,
        type: EntityType.AVAILABLE,
      },
    ]);
  }

  /**
   * Moves a certain amount from the 'available' assets to the 'reserved' assets
   * @param {string} asset
   * @param {number} quantity
   */
  reserveAsset(asset: string, quantity: number): void {
    if (!this.hasEnough(EntityType.AVAILABLE, asset, quantity))
      throw new Error(
        `Could not reserve ${quantity} ${asset}: insufficient funds`
      );

    this.applyTransactions([
      {
        asset: asset,
        quantity: -quantity,
        update: true,
        type: EntityType.AVAILABLE,
      },
      {
        asset: asset,
        quantity: +quantity,
        update: true,
        type: EntityType.RESERVED,
      },
    ]);
  }

  /**
   * Moves a certain amount back to the 'available' assets
   * @param {string} asset
   * @param {number} quantity
   */
  revertReserveAsset(asset: string, quantity: number): void {
    if (!this.hasEnough(EntityType.RESERVED, asset, quantity))
      throw new Error(
        `Could not revert reservation of ${quantity} ${asset}: insufficient funds`
      );

    this.applyTransactions([
      {
        asset: asset,
        quantity: +quantity,
        update: true,
        type: EntityType.AVAILABLE,
      },
      {
        asset: asset,
        quantity: -quantity,
        update: true,
        type: EntityType.RESERVED,
      },
    ]);
  }

  /**
   * Converts a certain reserved asset to a corresponding 'available' asset
   * @param {string} baseAsset
   * @param {string} quoteAsset
   * @param {number} baseQuantity
   * @param {number} quoteQuantity
   */
  releaseAsset(
    baseAsset: string,
    quoteAsset: string,
    baseQuantity: number,
    quoteQuantity: number
  ): void {
    if (!this.hasEnough(EntityType.RESERVED, baseAsset, baseQuantity))
      throw new Error(
        `Could not release asset ${baseQuantity} ${baseAsset}: insufficient funds`
      );

    this.applyTransactions([
      {
        asset: quoteAsset,
        quantity: +quoteQuantity,
        update: true,
        type: EntityType.AVAILABLE,
      },
      {
        asset: baseAsset,
        quantity: -baseQuantity,
        update: true,
        type: EntityType.RESERVED,
      },
    ]);
  }

  private applyTransactions(transactions: Transaction[]): void {
    this.store.update(
      ...transactions.map((tx) => {
        return upsertEntitiesById(tx.asset, {
          creator: (): Asset => ({ asset: tx.asset, quantity: tx.quantity }),
          updater: (entity: Asset): Asset => ({
            ...entity,
            quantity: tx.update ? entity.quantity + tx.quantity : tx.quantity,
          }),
          ref:
            tx.type === EntityType.RESERVED
              ? reservedAssetsEntitiesRef
              : availableAssetEntitiesRef,
        });
      })
    );
  }

  private hasEnough(
    type: EntityType,
    asset: string,
    quantity: number
  ): boolean {
    const _asset = this.store.query(
      getEntity(asset, {
        ref:
          type === EntityType.RESERVED
            ? reservedAssetsEntitiesRef
            : availableAssetEntitiesRef,
      })
    );
    return (_asset?.quantity ?? 0) >= quantity;
  }
}

enum EntityType {
  AVAILABLE,
  RESERVED,
}

type Transaction = {
  asset: string;
  quantity: number;
  update: boolean;
  type: EntityType;
};
