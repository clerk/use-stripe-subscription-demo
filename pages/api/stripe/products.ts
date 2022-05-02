import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: null });

export default async function handler(req, res) {
  // TODO: Find user-specific price with search API?

  // Retrieve products based on default billing portal config

  // First, retrieve the configuration
  const configurations = await stripe.billingPortal.configurations.list({
    is_default: true,
    expand: ["data.features.subscription_update.products"],
  });

  // Next, retrieve the products & prices
  const pricePromises = configurations.data[0].features.subscription_update.products.map(
    (x) => stripe.prices.retrieve(x.prices[0], { expand: ["product"] })
  );

  const prices = await Promise.all(pricePromises);

  const products = prices.map((price) => {
    return {
      // @ts-ignore
      price: { ...price, product: price.product.id },
      product: price.product,
    };
  });

  res.json(products);
}
