import { RemovalOrder } from '../types';

export function generateUniqueId() {
  return crypto.randomUUID();
}

export function generateOrderKey(order: RemovalOrder) {
  return `${order.orderId}-${order.sku}-${order.fnsku}-${order.id || generateUniqueId()}`;
}

export function generateTableKey(order: RemovalOrder) {
  return `${order.orderId}-${order.sku}-${order.fnsku}-${order.id || generateUniqueId()}`;
}