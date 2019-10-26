import {IAssetMap} from "../../assets/wallet";

export interface IAssetAware {
    onUpdateAssets: (assets: IAssetMap, reservedAssets: IAssetMap) => void;
}

export const isAssetAware = (plugin: any): plugin is IAssetAware => plugin.onUpdateAssets !== undefined;
