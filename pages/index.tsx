import { UserButton, UserProfile } from "@clerk/nextjs";
import Head from "next/head";
import { Gate, useSubscription } from "use-stripe-subscription";

export default function Home() {
  const {
    isLoaded,
    products,
    subscription,
    redirectToCheckout,
    redirectToCustomerPortal,
  } = useSubscription();

  if (!isLoaded) {
    return null;
  }

  const alertResponse = async (path) => {
    const res = await fetch(path);
    const body = await res.text();
    alert(`Path requested: ${path}\nResponse: ${body}`);
  };

  return (
    <main style={{ padding: "1rem 2rem" }}>
      <Head>
        <title>use-stripe-subscription</title>
      </Head>
      <h1>use-stripe-subscription demo</h1>
      <h2>Plans</h2>
      {products.map(({ product, prices }) => (
        <div key={product.id}>
          <h4>{product.name}</h4>
          <Gate unsubscribed>
            {prices.map((price) => (
              <button
                key={price.id}
                onClick={() => redirectToCheckout({ price: price.id })}
              >
                Purchase {price.unit_amount} {price.currency}
              </button>
            ))}
          </Gate>
          <Gate product={product}>Active plan</Gate>
          <Gate product={product} negate>
            <button onClick={() => redirectToCustomerPortal()}>
              Change plan
            </button>
          </Gate>
        </div>
      ))}
      <h2>Features</h2>
      <div>
        <Gate feature="feature1">Plan has "feature1"</Gate>
        <Gate feature="feature1" negate>
          Plan does not have "feature1"
        </Gate>{" "}
        <button onClick={() => alertResponse("/api/tryFeature1")}>
          Test the backend!
        </button>
      </div>
      <div>
        <Gate feature="feature2">Plan has "feature2"</Gate>
        <Gate feature="feature2" negate>
          Plan does not have "feature2"
        </Gate>{" "}
        <button onClick={() => alertResponse("/api/tryFeature2")}>
          Test the backend!
        </button>
      </div>
      <h2>Account management</h2>
      <UserButton />
    </main>
  );
}
