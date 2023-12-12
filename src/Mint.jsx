import { ethers } from "ethers";
import config from "../config.json";
import { useState, useEffect } from "react";
import { useWaitForTransaction, useAccount } from "wagmi";
import { AiOutlineLoading } from "react-icons/ai";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "ethscription-c3ed4.firebaseapp.com",
  databaseURL:
    "https://ethscription-c3ed4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ethscription-c3ed4",
  storageBucket: "ethscription-c3ed4.appspot.com",
  messagingSenderId: "227604428730",
  appId: "1:227604428730:web:7f74242bff7403d5accf83",
};
const app = initializeApp(firebaseConfig);

const Mint = () => {
  const [data, setData] = useState(null);
  const [proofWl, setProofWl] = useState("");
  const [mintCount, setMintCount] = useState(1);
  const [tx, setTx] = useState(null);
  const { address, isConnecting, isDisconnected, isConnected } = useAccount();

  const firebaseWl = (address) => {
    const db = getDatabase(app);

    const reference = ref(db, `/${address}`);

    onValue(reference, (snapshot) => {
      const data = snapshot.val();

      if (data) setProofWl(data);
    });
  };

  //   track address change and get proofs

  useEffect(() => {
    firebaseWl(address);
    getInfo();
  }, [address]);

  const getInfo = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        config.contractAddress,
        config.abi,
        signer
      );
      const wlStatus = await contract.wlMintActive();
      const publicStatus = await contract.mintActive();
      const wlPrice = await contract.WL_PRICE();
      const publicPrice = await contract.PRICE();
      const maxPerPub = await contract.MAX_PER_WALLET();
      const maxPerWl = await contract.MAX_PER_WALLET_WL();
      const maxSupply = await contract.MAX_SUPPLY();
      const totalSupply = await contract.TOTAL_SUPPLY();

      setData({
        wlStatus,
        publicStatus,
        wlPrice,
        publicPrice,
        maxPerPub,
        maxPerWl,
        maxSupply,
        totalSupply,
      });
    } catch (e) {
      console.log(e);
    }
  };

  //   type 2 pending
  //   type 1 success

  //PUBLIC MINT
  const publicMint = async () => {
    try {
      const tx = await contract.mint(6666, {
        value:
          BigInt(data?.publicPrice ? data?.publicPrice : 0) * BigInt(mintCount),
      });
      setTx(tx);
      const receipt = await tx.wait();
      setTx(tx);
      console.log("Transaction mined:", receipt);
    } catch (error) {
      console.error("Error minting:", error);
      setTx(error);
    }
  };
  //WL MINT
  const wlMint = async () => {
    console.log(
      "value:",
      ethers.BigNumber.from(data?.wlPrice).mul(ethers.BigNumber.from(mintCount))
    );

    try {
      const tx = await contract.wlMint(mintCount, proofWl, {
        value: data?.wlPrice
          ? ethers.BigNumber.from(data?.wlPrice).mul(
              ethers.BigNumber.from(mintCount)
            )
          : 0,
      });
      console.log(tx);
      setTx(tx);
      const receipt = await tx.wait();
      setTx(tx);
      console.log("Transaction mined:", receipt);
    } catch (error) {
      console.error("Error minting:", error);
      setTx(error);
    }
  };

  const renderMintButton = () => {
    if (!data)
      return (
        <button>
          <AiOutlineLoading />
        </button>
      );
    // WL MINT
    if (data?.wlStatus) {
      return (
        <>
          <button
            disabled={proofWl ? false : true}
            onClick={async () => {
              await wlMint();
            }}
            className=""
          >
            {proofWl ? "Mint!" : "Not Whitelisted"}
          </button>
        </>
      );
    }
    // PUBLIC MINT
    if (!data?.wlStatus && data?.publicStatus) {
      return (
        <button
          onClick={async () => {
            await publicMint();
          }}
          className=""
        >
          Mint
        </button>
      );
    } else {
      return <button disabled={true}>Soon</button>;
    }
  };

  //RENDER NOTIFICATION

  const renderNotification = () => {
    if (!tx) return;
    if (tx.status == 1) {
      return <div className="success-text">You have succesfully Minted! </div>;
    }
    if (tx.status == 2) {
      return <div>Transaction pending...</div>;
    } else {
      return (
        <div className="warning-text">Something unexpected happened !</div>
      );
    }
  };

  const handleMintCount = (newMintCount) => {
    if (!data?.maxPerPub || !data?.maxPerWl) return 0;
    const maxAmount = data?.wlStatus ? data?.maxPerWl : data?.maxPerPub;
    setMintCount(
      newMintCount > 0 && newMintCount <= maxAmount ? newMintCount : mintCount
    );
  };

  const counter = () => {
    return (
      <div
        className="mint-button-container
  "
      >
        <button
          onClick={() => handleMintCount(mintCount + 1)}
          className="counter-button"
        >
          +
        </button>
        <div className="fstandard jc-center">{mintCount}</div>
        <button
          onClick={() => handleMintCount(mintCount - 1)}
          className="counter-button"
        >
          -
        </button>
      </div>
    );
  };

  return (
    <>
      {address ? (
        <>
          <div>{`${data?.totalSupply} / ${data?.maxSupply} Minted`}</div>
          {renderMintButton()}

          {counter()}
          {
            <div className="info">
              <div>
                {data?.wlStatus
                  ? proofWl
                    ? "You are whitelisted !!"
                    : "Not whitelisted !"
                  : ""}
              </div>
              <div>{renderNotification()}</div>
            </div>
          }
        </>
      ) : (
        " "
      )}
    </>
  );
};
export default Mint;
