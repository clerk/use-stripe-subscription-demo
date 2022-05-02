/**
 * This file is a monkey-patch of Clerk's official useUser
 *
 * We're using it here so we can test the developer experience
 * of a Stripe integration before actually building it
 */

import { useUser } from "@clerk/nextjs";

export default function useUserMonkeyPatch() {
  const standard = useUser();

  if (!standard.isLoaded || !standard.isSignedIn) {
    return standard;
  }

  const redirectToCheckout = async (args: { prices: string[] }) => {
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

  return { standard, redirectToCheckout };
}
