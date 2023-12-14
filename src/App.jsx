import Content from "./Content";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";

import { WagmiConfig } from "wagmi";
import { goerli, mainnet } from "viem/chains";
const projectId = "f767cd91b4e882cab1822bf98d413809";
const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};
function App() {
  const chains = [goerli, mainnet];

  const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });
  createWeb3Modal({ wagmiConfig, projectId, chains });
  return (
    <WagmiConfig config={wagmiConfig}>
      <div className="app-container bg-grad ">
        <Content />
      </div>
    </WagmiConfig>
  );
}

export default App;
