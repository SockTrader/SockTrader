import { Query } from '@datorama/akita';
import { Observable } from 'rxjs';
import { AssetMap } from './spotWallet.interfaces';
import { SpotWalletState } from './spotWallet.store';

export default class SpotWalletQuery extends Query<SpotWalletState> {

  reservedAssets$: Observable<AssetMap> = this.select(state => state.reservedAssets);

  assets$: Observable<AssetMap> = this.select(state => state.assets);

}
