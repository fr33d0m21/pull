export function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

export function generateOrderKey(order: RemovalOrder) {
  return `${order.orderId}-${order.sku}-${order.fnsku}-${order.id || generateUniqueId()}`;
}

export function generateTableKey(order: RemovalOrder) {
  return `${order.orderId}-${order.sku}-${order.fnsku}-${order.id || generateUniqueId()}`;
}