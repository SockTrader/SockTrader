import { select, Store } from '@ngneat/elf';
import { Observable } from 'rxjs';
import { AssetMap } from './spotWallet.interfaces';
import { SpotWalletStore } from './spotWallet.store';

export class SpotWalletQuery {
  reservedAssets$: Observable<AssetMap> = this.store.pipe(
    select((state) => state.reservedAssets)
  );

  assets$: Observable<AssetMap> = this.store.pipe(
    select((state) => state.assets)
  );

  constructor(private readonly spotWalletStore: SpotWalletStore) {}

  get store(): Store {
    return this.spotWalletStore.getStoreInstance();
  }
}
