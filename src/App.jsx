import Content from "./Content";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { goerli, mainnet } from "wagmi/chains";

function App() {
  const chains = [goerli, mainnet];
  const projectId = "f767cd91b4e882cab1822bf98d413809";

  const { publicClient } = configureChains(chains, [
    w3mProvider({ projectId }),
  ]);
  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({ projectId, chains }),
    publicClient,
  });
  const ethereumClient = new EthereumClient(wagmiConfig, chains);
  return (
    <WagmiConfig config={wagmiConfig}>
      <div className="app-container bg-grad ">
        <Content />
      </div>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </WagmiConfig>
  );
}

export default App;
