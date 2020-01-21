export type AssetMap = Record<string, number>;

export type AssetCalculator = (asset: string, priceQty: number) => void;

export type OrderSideCalculator = (asset: string, calc: AssetCalculator, priceQty: number) => void;

export type OrderSideCalculators = Record<"ifBuy" | "ifSell", OrderSideCalculator>;
