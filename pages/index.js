import Head from "next/head";
import useProducts from "../hooks/useProducts";
import useUser from "../hooks/useUser";

export default function Home() {
  const { redirectToCheckout } = useUser();
  const { products, error } = useProducts();

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }

  if (!products) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Clerk - Stripe integration POC</title>
      </Head>

      <h1>Clerk - Stripe integration POC</h1>

      {products.map(({ product, price }) => (
        <div key={product.id}>
          <h2>
            {product.name} - {price.unit_amount} {price.currency}
          </h2>
          <button
            onClick={() =>
              redirectToCheckout({
                line_items: [{ price: price.id, quantity: 1 }],
              })
            }
          >
            Purchase
          </button>
        </div>
      ))}
    </>
  );
}
