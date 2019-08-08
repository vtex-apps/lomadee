import { getProductPrice, getProductAvable } from "./helpers/index";
import { PixelMessage } from "./typings/events";
import { canUseDOM } from "vtex.render-runtime";

function purchaseInjection(advertiserId: string, lomadeeEventId: string, transactionId: string, transactionTotalWithoutFreight: string) {
  const img = document.createElement("img");
  const url = `https://secure.lomadee.com/at/actionlog?adv=${advertiserId}&country=BR&transaction=${transactionId}&event1=${lomadeeEventId}&value1=${transactionTotalWithoutFreight}`;
  img.setAttribute("id", "lomadee-pixel");
  img.setAttribute("src", url);
  document.body.appendChild(img);
}

function handleMessages(e: PixelMessage) {
  let lomadee_datalayer: any;

  switch (e.data.eventName) {
    case "vtex:pageInfo": {
      lomadee_datalayer = {
        page: "home"
      };
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
          items: e.data.transactionProducts
        }
      };

      purchaseInjection(window.advertiserId, window.lomadeeEventId, e.data.transactionId, e.data.transactionSubtotal);
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
          available: getProductAvable(e.data.product)
        }
      };
      break;
    }

    case "vtex:addToCart": {
      lomadee_datalayer = {
        page: "cart",
        cart: {
          skus: e.data.items[0].skuId
        }
      };

      break;
    }

    case "vtex:internalSiteSearchView": {
      const category = e.data.products[0].categories[0].split("/");
      lomadee_datalayer = {
        page: "search",
        keyword: category[2]
      };
      break;
    }

    case "vtex:categoryView": {
      const category = e.data.products[0].categories[0].split("/");
      lomadee_datalayer = {
        page: "category",
        category: {
          name: category[2]
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

if (canUseDOM) {
  window.addEventListener("message", handleMessages);
}
