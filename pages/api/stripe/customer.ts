import stripe from "../../../stripe";
import { requireAuth, users } from "@clerk/nextjs/api";

const handler = requireAuth(async (req, res) => {
  const customerId = await findOrCreateCustomerId({
    clerkUserId: req.auth.userId,
  });
  res.json(
    await stripe.customers.retrieve(customerId, { expand: ["subscriptions"] })
  );
});

export default handler;

// Colin was a rails dev and it shows
export const findOrCreateCustomerId = async ({
  clerkUserId,
}: {
  clerkUserId: string;
}) => {
  let user = await users.getUser(clerkUserId);
  if (user.publicMetadata.stripeCustomerId) {
    return user.publicMetadata.stripeCustomerId as string;
  }

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
  return user.publicMetadata.stripeCustomerId as string;
};
