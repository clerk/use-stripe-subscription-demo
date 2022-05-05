import "../styles/globals.css";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/nextjs";
import { SWRConfig } from "swr";

import { StripeContext, stripeClient } from "../stripeClient";

function MyApp({ Component, pageProps }) {
  return (
    <div style={{ paddingLeft: "40px" }}>
      {/* Loom video padding, lol */}
      <StripeContext.Provider value={stripeClient}>
        <SWRConfig
          value={{
            fetcher: async (args) => {
              const data = await fetch(args);
              return await data.json();
            },
          }}
        >
          <ClerkProvider>
            <SignedIn>
              <Component {...pageProps} />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </ClerkProvider>
        </SWRConfig>
      </StripeContext.Provider>
    </div>
  );
}

export default MyApp;
