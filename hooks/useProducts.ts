import useSWR from "swr";

// returns products, error, hasMore
export default function useProducts(options: any = {}) {
  const qs = new URLSearchParams(options);
  const { data, error } = useSWR(
    "/api/stripe/products?" + qs.toString(),
    async (args) => {
      const data = await fetch(args);
      return await data.json();
    }
  );

  if (error) {
    return {
      error,
    };
  }

  if (!data) {
    return {};
  }

  return {
    products: data,
  };
}
