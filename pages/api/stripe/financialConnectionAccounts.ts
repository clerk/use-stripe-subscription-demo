import { requireAuth, users } from "@clerk/nextjs/api";
import { findOrCreateCustomerId } from "./customer";

const handler = requireAuth(async (req, res) => {
  const customerId = await findOrCreateCustomerId({
    clerkUserId: req.auth.userId,
  });

  // This isn't in the Stripe SDK yet
  const accounts = await fetch(
    `https://api.stripe.com/v1/financial_connections/accounts?account_holder[customer]=${customerId}`,
    {
      headers: new Headers({
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      }),
    }
  ).then((x) => x.json());

  accounts.data.forEach(async (x) => {
    // TODO: Add some built-in throttling here (to be configured in Clerk dashboard)
    // We can't refresh every time since it incurs a fee
    if (x.balance_refresh === null) {
      // fire this off to refresh if we need
      // sdk will pull back down in a few seconds automatically
      const refresh = await fetch(
        `https://api.stripe.com/v1/financial_connections/accounts/${x.id}/refresh`,
        {
          headers: new Headers({
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            "Content-Type": `application/x-www-form-urlencoded`,
          }),
          method: "post",
          body: "features[]=balance",
        }
      ).then((x) => x.json());
      console.log("refresh", refresh);
    }
  });

  res.json(accounts);
});

export default handler;
