import Content from "./Content";
import { WagmiConfig } from "wagmi";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import { goerli, mainnet } from "viem/chains";
const chains = [mainnet];
const projectId = "f767cd91b4e882cab1822bf98d413809";
const metadata = {
  name: "Darknezz.",
  description: "Connect Darknezz",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });
createWeb3Modal({ wagmiConfig, projectId, chains });
function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <div className="app-container bg-grad ">
        <Content />
      </div>
    </WagmiConfig>
  );
}

export default App;
