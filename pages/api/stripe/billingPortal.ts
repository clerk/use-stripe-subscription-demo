import stripe from "../../../stripe";
import { requireAuth, users } from "@clerk/nextjs/api";
import { findOrCreateCustomerId } from "./customer";

const handler = requireAuth(async (req, res) => {
  const customerId = await findOrCreateCustomerId({
    clerkUserId: req.auth.userId,
  });

  // Authenticate your user.
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: "http://localhost:3000",
  });

  res.json(session);
});

export default handler;
