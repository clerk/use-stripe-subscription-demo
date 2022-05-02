# Stripe integration POC

This repo is a proof-of-concept for [Clerk](https://clerk.dev)'s integration with Stripe.

## Goal

We want to make it easier to integrate Stripe.

Since Clerk is responsible for Authentication, User management, and Organization management, we can solve many tedious aspects of integrating Stripe, including:

1. Creating and syncing Stripe Customer objects with Clerk User and Organization objects
2. Starting a Checkout Session for the currently signed in User (or their Organization)
3. Starting a Billing Portal Session for the currently signed in User (or their Organization)
4. Retrieving Stripe Customer data (e.g. subscriptions, purchase history, payment methods) for the currently signed in User (or their Organization)

## Philosophy

This proof-of-concept is focused on security and developer experience, not on performance or reliability.

- From a security perspective, we want to ensure that strong access control measures are in place, or at least feasible. As an example, a signed in user should not be able to generate a Checkout Session for a different user.
- From a developer experience perspective, we're particularly interested in finding a flexible hook design that works across many different types of businesses.

We have a strong preference for solutions that are complementary to Stripe's API, instead of ones that only use Stripe for its payments primitives. As an example, we prefer to leverage Stripe's existing Product and Price modeling instead of creating our own.

Lastly, this is meant to be fun. Code will not be reviewed except for security and developer experience issues. Expect ts-ignores and console.logs littered about.

## Future

Our final integration with Stripe will ask developers to connect their Stripe account in Clerk's dashboard, and the functionality in this repo will move to our core product:

- The React hooks in [`hooks`](./hooks) will be added to Clerk's React SDKs.
- The API endpoints in [`pages/api/stripe/*`](./pages/api/stripe) will be added to Clerk's Frontend API.

## Contributing

Anyone can run this repo by creating a `.env.local` file (rename the example).

Pull requests, issues, and discussions are all welcome. If you'd like to contribute a pull request, we recommend starting a discussion first.
