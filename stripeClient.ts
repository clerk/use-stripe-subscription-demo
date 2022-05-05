import { createContext } from "react";
import { loadStripe } from "@stripe/stripe-js";
export const stripeClient =
  typeof window !== "undefined"
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null;
export const StripeContext = createContext(null);
