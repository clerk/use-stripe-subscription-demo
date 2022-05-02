import Stripe from "stripe";
import { requireAuth, users } from "@clerk/nextjs/api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: null });

const handler = requireAuth(async (req, res) => {
  let user = await users.getUser(req.auth.userId);
  if (1 === 1 || !user.publicMetadata.stripeCustomerId) {
    const customerCreate = await stripe.customers.create(
      {
        name: user.firstName + " " + user.lastName,
        email: user.emailAddresses.find(
          (x) => x.id === user.primaryEmailAddressId
        ).emailAddress,
        metadata: {
          clerkUserId: user.id,
        },
      },
      {
        idempotencyKey: "A" + user.id,
      }
    );
    user = await users.updateUser(user.id, {
      publicMetadata: {
        stripeCustomerId: customerCreate.id,
      },
    });
  }

  console.log(user.publicMetadata.stripeCustomerId);

  const session = await stripe.checkout.sessions.create({
    customer: user.publicMetadata.stripeCustomerId as string,
    success_url: "http://localhost:3000",
    cancel_url: "http://localhost:3000",
    line_items: req.body.line_items,
    mode: "subscription",
  });

  res.json(session);
});

export default handler;
