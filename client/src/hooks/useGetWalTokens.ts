import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction, coinWithBalance } from "@mysten/sui/transactions";
import { parseStructTag, MIST_PER_SUI } from "@mysten/sui/utils";
import { TESTNET_WALRUS_PACKAGE_CONFIG } from "@mysten/walrus";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { suiClient } from "../lib/walrus";


export function useGetWalTokens() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!currentAccount) {
        throw new Error("No account connected");
      }

      const tx = new Transaction();
      tx.setSender(currentAccount.address);

      const exchange = await suiClient.getObject({
        id: TESTNET_WALRUS_PACKAGE_CONFIG.exchangeIds[0],
        options: {
          showType: true,
        },
      });

      if (!exchange.data?.type) {
        throw new Error("Exchange object type not found");
      }

      const exchangePackageId = parseStructTag(exchange.data.type).address;

      const wal = tx.moveCall({
        package: exchangePackageId,
        module: "wal_exchange",
        function: "exchange_all_for_wal",
        arguments: [
          tx.object(TESTNET_WALRUS_PACKAGE_CONFIG.exchangeIds[0]),
          coinWithBalance({
            balance: MIST_PER_SUI / 2n,
          }),
        ],
      });

      tx.transferObjects([wal], currentAccount.address);

      const { digest } = await signAndExecuteTransaction({
        transaction: tx,
      });

      const { effects } = await suiClient.waitForTransaction({
        digest,
        options: {
          showEffects: true,
        },
      });

      return { digest, effects };
    },
    onSuccess: () => {
      
      if (currentAccount) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.walBalance(currentAccount.address),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.suiBalance(currentAccount.address),
        });
      }
    },
  });
}