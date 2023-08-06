import { EventType, OutboundAccountPosition } from 'binance-api-node';

/**
 * outboundAccountPosition
 * ==============================
 * is sent any time an account balance has changed and contains the assets
 * that were possibly changed by the event that generated the balance change.
 */

// Margin to spot transaction
export const outboundAccountPositionMarginToSpot: OutboundAccountPosition = {
  balances: [{ asset: 'USDT', free: '100.00000000', locked: '0.00000000' }],
  eventTime: 1631472686037,
  eventType: <EventType.OUTBOUND_ACCOUNT_POSITION>'outboundAccountPosition',
  lastAccountUpdate: 1631472686037,
};

// Spot to margin transaction
export const outboundAccountPositionSpotToMargin: OutboundAccountPosition = {
  balances: [{ asset: 'USDT', free: '0.00000000', locked: '0.00000000' }],
  eventTime: 1631472738675,
  eventType: <EventType.OUTBOUND_ACCOUNT_POSITION>'outboundAccountPosition',
  lastAccountUpdate: 1631472738674,
};

// Create limit order
export const outboundAccountPosition: OutboundAccountPosition = {
  balances: [{ asset: 'USDT', free: '0.16000000', locked: '99.84000000' }],
  eventTime: 1631473349358,
  eventType: <EventType.OUTBOUND_ACCOUNT_POSITION>'outboundAccountPosition',
  lastAccountUpdate: 1631473349358,
};
