import { requireAuth, users } from "@clerk/nextjs/api";
import { subscriptionHandler, stripeApiClient } from "use-stripe-subscription";

const handler = requireAuth(async (req, res) => {
  // Determine the Stripe Customer ID for this request
  // use-stripe-subscription doesn't care how you implement this...
  // you can make it specific to the user, or specific to their organization
  // but we implemented it here with Clerk for user management
  const customerId = await findOrCreateCustomerId({
    clerkUserId: req.auth.userId,
  });

  res.json(
    await subscriptionHandler({ customerId, query: req.query, body: req.body })
  );
});

export default handler;

const findOrCreateCustomerId = async ({
  clerkUserId,
}: {
  clerkUserId: string;
}) => {
  let user = await users.getUser(clerkUserId);
  if (user.publicMetadata.stripeCustomerId) {
    return user.publicMetadata.stripeCustomerId as string;
  }

  const customerCreate = await stripeApiClient.customers.create(
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
      idempotencyKey: user.id,
    }
  );
  user = await users.updateUser(user.id, {
    publicMetadata: {
      stripeCustomerId: customerCreate.id,
    },
  });
  return user.publicMetadata.stripeCustomerId as string;
};
