import { requireAuth, users } from "@clerk/nextjs/api";
import { findOrCreateCustomerId } from "./customer";

const handler = requireAuth(async (req, res) => {
  const customerId = await findOrCreateCustomerId({
    clerkUserId: req.auth.userId,
  });

  console.log({
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
    },
    method: "post",
    body: `permissions[]=balances&account_holder[customer]=${customerId}`,
  });
  // This isn't in the Stripe SDK yet
  const session = await fetch(
    "https://api.stripe.com/v1/financial_connections/sessions",
    {
      headers: new Headers({
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": `application/x-www-form-urlencoded`,
      }),
      method: "post",
      body: `account_holder[type]=customer&permissions[]=balances&account_holder[customer]=${customerId}`,
    }
  ).then((x) => x.json());

  res.json(session);
});

export default handler;
