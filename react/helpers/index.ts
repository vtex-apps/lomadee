import { Product } from "../typings/events";

export function getProductPrice(product: Product) {
  let price;
  try {
    price = product.items[0].sellers[0].commertialOffer.Price;
  } catch {
    price = undefined;
  }
  return price;
}

export function getProductAvailable(product: Product) {
  let quantity;
  try {
    quantity = product.items[0].sellers[0].commertialOffer.AvailableQuantity;
  } catch {
    quantity = 0;
  }
  return quantity > 0;
}
