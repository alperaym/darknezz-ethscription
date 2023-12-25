import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useEffect } from "react";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";

export default function Connect() {
  const { open } = useWeb3Modal();
  const { address, isConnecting, isDisconnected, isConnected } = useAccount();
  const { chain, chains } = useNetwork();
  const { error, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork();

  return (
    <>
      {address ? (
        chain?.id == 5 ? (
          <w3m-account-button />
        ) : (
          <button className="connect" onClick={() => switchNetwork(5)}>
            Switch to Mainnet
          </button>
        )
      ) : (
        <button
          className="connect"
          onClick={() => {
            open();
          }}
        >
          Connect Wallet
        </button>
      )}
    </>
  );
}
