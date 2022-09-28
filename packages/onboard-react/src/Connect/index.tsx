import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { state, helpers } from "@sovryn/onboard-core";
import { shareReplay, startWith } from "rxjs/operators";
import { useObservable } from "../hooks/useObservable";
import { WalletModule } from "@sovryn/onboard-common";

type ConnectProps = {
  module?: string;
};

export const Connect: FC<ConnectProps> = ({ module: autoSelect }) => {
  const connectedWallets = useObservable(
    state
      .select("wallets")
      .pipe(startWith(state.get().wallets), shareReplay(1)),
    state.get().wallets
  );

  const [walletModules, setWalletModules] = useState<WalletModule[]>([]);

  useEffect(() => {
    const sub = state
      .select("walletModules")
      .pipe(startWith(state.get().walletModules), shareReplay(1))
      .subscribe(async (modules) => {
        const wallets = await Promise.all(
          modules.map(async (module) => {
            const loadedIcon = await module.getIcon();
            return {
              ...module,
              loadedIcon,
            };
          })
        );
        setWalletModules(wallets);
      });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  const items = useMemo(() => {
    return walletModules.map((module) => {
      return {
        module,
        // @ts-ignore
        icon: module.loadedIcon,
        isSelected:
          connectedWallets.find((wallet) => wallet.label === module.label) !==
          undefined,
      };
    });
  }, [walletModules, connectedWallets]);

  const handleOnClick = useCallback(
    (label: string) => async () => {
      const wallet = walletModules.find(
        (m) => m.label === label
      ) as WalletModule;

      if (wallet) {
        helpers.connectWallet(wallet);
      }
    },
    [walletModules]
  );

  return (
    <div
      style={{ backgroundColor: "#dedede", padding: "14px", margin: "14px" }}
    >
      <h1>Choose Wallet</h1>
      <ul>
        {items.map(({ module, icon, isSelected }) => (
          <li key={module.label}>
            <button onClick={handleOnClick(module.label)}>
              <div
                dangerouslySetInnerHTML={{ __html: icon }}
                style={{ width: 32 }}
              />
              {module.label} {isSelected && " [connected]"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};