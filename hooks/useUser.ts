/**
 * This file is a monkey-patch of Clerk's official useUser
 *
 * We're using it here so we can test the developer experience
 * of a Stripe integration before actually building it
 */

import { useUser } from "@clerk/nextjs";
import useSWR from "swr";
import Stripe from "stripe";

// Be warned: Lots of TS wrestling to make the monekey patch work
export default function useUserMonkeyPatch() {
  const standard = useUser();
  const { data: customer, error } = useSWR<Stripe.Response<Stripe.Customer>>(
    "/api/stripe/customer"
  );

  if (!standard.isLoaded || !standard.isSignedIn) {
    return {
      ...standard,
      redirectToCheckout: undefined,
      stripeCustomer: undefined,
    } as
      | {
          isLoaded: false;
          isSignedIn: undefined;
          redirectToCheckout: undefined;
          stripeCustomer: undefined;
        }
      | {
          isLoaded: true;
          isSignedIn: false;
          redirectToCheckout: undefined;
          stripeCustomer: undefined;
        };
  }

  // Also wait for customer to load
  if (!customer) {
    return {
      isLoaded: false,
    } as {
      isLoaded: false;
      isSignedIn: undefined;
      redirectToCheckout: undefined;
      stripeCustomer: undefined;
    };
  }

  const redirectToCheckout = async (args: any) => {
    const sessionResponse = await fetch("/api/stripe/checkout", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
    const session = await sessionResponse.json();
    window.location.href = session.url;
  };

  const redirectToBillingPortal = async () => {
    const sessionResponse = await fetch("/api/stripe/billingPortal", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const session = await sessionResponse.json();
    window.location.href = session.url;
  };

  // Todo: find a better way than mashing stripeCustomer on
  // Wait until we determine what we actually need off it
  return {
    ...standard,
    redirectToCheckout,
    redirectToBillingPortal,
    stripeCustomer: customer,
  };
}
