import { useQuery } from "@tanstack/react-query";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { queryKeys } from "./queryKeys";

export function useSuiBalance() {
  const client = useSuiClient();
  const account = useCurrentAccount();

  return useQuery({
    queryKey: queryKeys.suiBalance(account?.address),
    queryFn: async () => {
      if (!account?.address) throw new Error("No address provided");

      const balance = await client.getBalance({
        owner: account.address,
        coinType: "0x2::sui::SUI",
      });

      return (parseInt(balance.totalBalance) / 10 ** 9).toPrecision(2);
    },
    enabled: !!account?.address,
    staleTime: 10 * 1000, 
    refetchInterval: 10 * 1000, 
  });
}