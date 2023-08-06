import { BalanceUpdate, EventType } from 'binance-api-node';

/**
 * Balance update
 * =======================================
 * - Deposits or withdrawals from the account
 * - Transfer of funds between accounts (e.g. Spot to Margin)
 */

// Margin to spot transaction
export const balanceUpdateMarginToSpot: BalanceUpdate = {
  asset: 'USDT',
  balanceDelta: '100.00000000',
  clearTime: 1631472686037,
  eventTime: 1631472686037,
  eventType: <EventType.BALANCE_UPDATE>'balanceUpdate',
};

// Spot to margin transaction
export const balanceUpdateSpotToMargin: BalanceUpdate = {
  asset: 'USDT',
  balanceDelta: '-100.00000000',
  clearTime: 1631472738674,
  eventTime: 1631472738675,
  eventType: <EventType.BALANCE_UPDATE>'balanceUpdate',
};
