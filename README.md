# use-stripe-integration-demo

This is a demo implementation of [`use-stripe-subscription`](https://github.com/clerkinc/use-stripe-subscription)

To test it locally, **.env.local** must be populated with Stripe and Clerk environment variables according to the template in **.env.local.example**.

In addition to subscription management, this repository incorporates feature-gating via Stripe metadata.

In React, feature gating works via: `<Gate feature="feature1">`

In an API route, feature gating works via: `customerHasFeature({customerId, "feature2"})`

Both gates will deny the user unless you configure your Stripe Product's metadata with **features** set to **feature1,feature2**. Feature gating works with arbitrary strings.
