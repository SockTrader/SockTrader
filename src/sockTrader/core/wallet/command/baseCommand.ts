import {Order} from "../../types/order";
import {AssetCollection} from "../assetCollection";

export default abstract class BaseCommand  {

    abstract apply(order: Order): void;

    abstract revert(order: Order): void;

    constructor(protected assets: AssetCollection, protected reservedAssets: AssetCollection) {
    }
}
