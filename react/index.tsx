import { PixelMessage, Product } from "./typings/events"
import { canUseDOM } from "vtex.render-runtime"

function purchaseInjection(advertiserId: string, transactionId: string, transactionTotalWithoutFreight: number) {
  const img = document.createElement("img");
  const url = `https://secure.lomadee.com/at/actionlog?adv=${advertiserId}&country=BR&transaction=${transactionId}&value1=${transactionTotalWithoutFreight}`;
  img.setAttribute("id", "lomadee-pixel");
  img.setAttribute("src", url);
  document.body.appendChild(img);
}

function handleMessages(e: PixelMessage) {
  let lomadee_datalayer: any;

  switch (e.data.eventName) {
    case "vtex:pageInfo": {
      switch (e.data.eventType) {
        case 'homeView': {
          lomadee_datalayer = {
            page: "home"
          };
        }
        case 'categoryView': {
          lomadee_datalayer = {
            page: 'category',
            category: {
              name: e.data.category?.name,
            }
          }
        }
        case 'departmentView': {
          lomadee_datalayer = {
            page: 'category',
            category: {
              name: e.data.category?.name,
            }
          }
        }
        case 'internalSiteSearchView': {
          lomadee_datalayer = {
            page: 'search',
            keyword: e.data.search?.term,
          }
        }
      }
      break;
    }

    case "vtex:orderPlaced": {
      lomadee_datalayer = {
        page: "conversion",
        conversion: {
          transactionId: e.data.transactionId,
          amount: e.data.transactionSubtotal,
          currency: "BRL",
          paymentType: e.data.transactionPaymentType[0].paymentSystemName,
          items: e.data.transactionProducts.map(product => ({
            sku: product.sku,
            name: product.name,
            category: product.categoryId,
            price: product.price,
            quantity: product.quantity,
          }))
        }
      };

      purchaseInjection(window.advertiserId, e.data.transactionId, e.data.transactionSubtotal);
      break;
    }

    case "vtex:productView": {
      const {
        product: { productId, productName }
      } = e.data;
      lomadee_datalayer = {
        page: "product",
        product: {
          sku: productId,
          name: productName,
          price: getProductPrice(e.data.product),
          available: getProductAvailable(e.data.product)
        }
      };
      break;
    }

    default: {
      lomadee_datalayer = {
        page: "visit"
      };
      break;
    }
  }
}

function getProductPrice(product: Product) {
  let price;
  try {
    price = product.items[0].sellers[0].commertialOffer.Price;
  } catch {
    price = undefined;
  }
  return price;
}

function getProductAvailable(product: Product) {
  let quantity;
  try {
    quantity = product.items[0].sellers[0].commertialOffer.AvailableQuantity;
  } catch {
    quantity = 0;
  }
  return quantity > 0;
}


if (canUseDOM) {
  window.addEventListener("message", handleMessages);
}
