import Head from "next/head";
import Stripe from "stripe";
import useProducts from "../hooks/useProducts";
import useUser from "../hooks/useUser";

export default function Home() {
  const {
    isLoaded,
    isSignedIn,
    redirectToCheckout,
    redirectToBillingPortal,
    stripeCustomer,
  } = useUser();
  const { products, error } = useProducts();

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }

  if (!products) {
    return null;
  }

  // TODO: Check whether `subscriptions` in this context only contains
  // active subscriptions. If not, filter appropriately.
  const productSubscriptions = stripeCustomer.subscriptions.data
    .map((x) => {
      return x.items.data.map((y) => y.price.product);
    })
    .flat()
    .map((x) => products.find((y) => y.product.id === x));

  return (
    <>
      <Head>
        <title>Clerk - Stripe integration POC</title>
      </Head>

      <h1>Clerk - Stripe integration POC</h1>

      {productSubscriptions.length === 0 ? (
        <ProductList
          products={products}
          redirectToCheckout={redirectToCheckout}
        />
      ) : (
        <>
          <h2>You already have a subscription</h2>
          {productSubscriptions.map((x) => (
            <div>Product: {x.product.name}</div>
          ))}
          <button onClick={() => redirectToBillingPortal()}>Manage</button>
        </>
      )}
    </>
  );
}

const ProductList = ({ products, redirectToCheckout }) => {
  return products.map(({ product, price }) => (
    <div key={product.id}>
      <h2>
        {product.name} - {price.unit_amount} {price.currency}
      </h2>
      <button
        onClick={() =>
          redirectToCheckout({
            // Server needs to validate that this subscription
            // can be purchased self-serve
            line_items: [{ price: price.id, quantity: 1 }],
          })
        }
      >
        Purchase
      </button>
    </div>
  ));
};
