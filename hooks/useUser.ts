/**
 * This file is a monkey-patch of Clerk's official useUser
 *
 * We're using it here so we can test the developer experience
 * of a Stripe integration before actually building it
 */

import { useUser } from "@clerk/nextjs";
import useSWR from "swr";
import Stripe from "stripe";
import { useContext } from "react";
import { StripeContext } from "../stripeClient";

// Be warned: Lots of TS wrestling to make the monekey patch work
export default function useUserMonkeyPatch() {
  const stripeClientPromise = useContext(StripeContext);
  const standard = useUser();
  const { data: customer, error: customerError } = useSWR<
    Stripe.Response<Stripe.Customer>
  >("/api/stripe/customer");

  const {
    data: financialAccounts,
    mutate: financialAccountsMutate,
    error: financialAccountsError,
  } = useSWR("/api/stripe/financialConnectionAccounts");

  if (!standard.isLoaded || !standard.isSignedIn) {
    return {
      ...standard,
      redirectToCheckout: undefined,
      redirectToBillingPortal: undefined,
      connectFinancialAccounts: undefined,
      financialAccounts: undefined,
      stripeCustomer: undefined,
    } as
      | {
          isLoaded: false;
          isSignedIn: undefined;
          connectFinancialAccounts: undefined;
          financialAccounts: undefined;
          redirectToCheckout: undefined;
          redirectToBillingPortal: undefined;
          stripeCustomer: undefined;
        }
      | {
          isLoaded: true;
          isSignedIn: false;
          connectFinancialAccounts: undefined;
          financialAccounts: undefined;
          redirectToCheckout: undefined;
          redirectToBillingPortal: undefined;
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
      connectFinancialAccounts: undefined;
      financialAccounts: undefined;
      redirectToCheckout: undefined;
      redirectToBillingPortal: undefined;
      stripeCustomer: undefined;
    };
  }

  if (!financialAccounts) {
    return {
      isLoaded: false,
    } as {
      isLoaded: false;
      isSignedIn: undefined;
      connectFinancialAccounts: undefined;
      financialAccounts: undefined;
      redirectToCheckout: undefined;
      redirectToBillingPortal: undefined;
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

  const connectFinancialAccounts = async () => {
    const sessionResponse = await fetch("/api/stripe/financialConnection", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const session = await sessionResponse.json();
    const stripe = await stripeClientPromise;
    const accounts = await stripe.collectFinancialConnectionsAccounts({
      clientSecret: session.client_secret,
    });
    financialAccountsMutate();
  };

  for (var i = 0; i++; i < financialAccounts.data.length) {
    if (
      financialAccounts.data[i].balance_refresh === "null" ||
      financialAccounts.data[i].balance_refresh === "pending"
    ) {
      // Keep refreshing until it's not pending
      setTimeout(() => {
        financialAccountsMutate();
      }, 1000);
      console.log("refreshing");
    }
  }

  // Todo: find a better way than mashing stripeCustomer on
  // Wait until we determine what we actually need off it
  return {
    ...standard,
    redirectToCheckout,
    redirectToBillingPortal,
    connectFinancialAccounts,
    financialAccounts,
    stripeCustomer: customer,
  };
}
