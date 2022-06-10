import { customerHasFeature } from "use-stripe-subscription";
import { requireAuth } from "@clerk/nextjs/api";
import { findOrCreateCustomerId } from "../../utils/findOrCreateCustomerId";

const handler = requireAuth(async (req, res) => {
  // Determine the Stripe Customer ID for this request
  // use-stripe-subscription doesn't care how you implement this...
  // you can make it specific to the user, or specific to their organization
  // but we implemented it here with Clerk for user management
  const customerId = await findOrCreateCustomerId({
    clerkUserId: req.auth.userId,
  });

  if (await customerHasFeature({ customerId, feature: "feature2" })) {
    res.send("Customer has feature2");
  } else {
    res.send("Customer does not have feature2");
  }
});
export default handler;
