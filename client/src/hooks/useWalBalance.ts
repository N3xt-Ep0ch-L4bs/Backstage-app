import { useQuery } from "@tanstack/react-query";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { queryKeys } from "./queryKeys";

export function useWalBalance() {
  const client = useSuiClient();
  const account = useCurrentAccount();

  return useQuery({
    queryKey: queryKeys.walBalance(account?.address),
    queryFn: async () => {
      if (!account?.address) throw new Error("No address provided");

      const balance = await client.getBalance({
        owner: account.address,
        coinType:
          "0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL",
      });

      return (parseInt(balance.totalBalance) / 10 ** 9).toPrecision(2);
    },
    enabled: !!account?.address,
    staleTime: 10 * 1000, 
    refetchInterval: 60 * 1000, 
  });
}