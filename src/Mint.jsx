import {
  useContractWrite,
  usePrepareContractWrite,
  useContractRead,
  useWaitForTransaction,
  useAccount,
  useNetwork,
} from "wagmi";

import { useState, useEffect, useRef } from "react";

import AppConfig from "../config.json";

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
  const [proofWl, setProofWl] = useState("");
  const [error, setError] = useState("");

  const [mintCount, setMintCount] = useState(1);

  const { address, isConnecting, isDisconnected, isConnected } = useAccount();
  const { chain, chains } = useNetwork();
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
  }, [address]);

  //   Cut error message string
  function cutString(inputString) {
    const dotIndex = inputString.indexOf(".");
    const regex =
      /The contract function "[^"]+" reverted with the following reason:\n(.*?)\n/;
    const match = inputString.match(regex);
    if (match && match[1]) {
      const extractedString = match[1];
      return extractedString;
    }
    if (dotIndex !== -1) {
      return inputString.substring(0, dotIndex);
    } else {
      return inputString;
    }
  }

  //   Read If wl minting active
  const {
    data: mintingStatusWl,
    isError: isWlMintingStatusError,
    isLoading: isWlMintingStatusLoading,
  } = useContractRead({
    address: AppConfig.contractAddress,
    abi: AppConfig.abi,
    functionName: `wlMintActive`,
    watch: true,
    chainId: 5,
  });
  //   Read If og minting active

  //   Read If public minting active
  const {
    data: mintingStatusPublic,
    isError: isPublicMintingStatusError,
    isLoading: isPublicMintingStatusLoading,
  } = useContractRead({
    address: AppConfig.contractAddress,
    abi: AppConfig.abi,
    functionName: `mintActive`,
    watch: true,
    chainId: 5,
  });
  // max Per Wl user
  const {
    data: maxPerWl,
    isError: isMaxPerWlError,
    isLoading: isMaxPerWlLoading,
  } = useContractRead({
    address: AppConfig.contractAddress,
    abi: AppConfig.abi,
    functionName: `MAX_PER_WALLET_WL`,
    chainId: 5,
  });

  // max Per pub user
  const {
    data: maxPerPublic,
    isError: isMaxPerPublicError,
    isLoading: isMaxPerPublicLoading,
  } = useContractRead({
    address: AppConfig.contractAddress,
    abi: AppConfig.abi,
    functionName: `MAX_PER_WALLET`,
    chainId: 5,
  });

  //   Read Mint Price wl
  const {
    data: priceWl,
    isError: isPriceWlError,
    isLoading: isPriceWlLoading,
  } = useContractRead({
    address: AppConfig.contractAddress,
    abi: AppConfig.abi,
    functionName: `WL_PRICE`,
    chainId: 5,
  });

  //   read mint price PUBLIC
  const {
    data: pricePublic,
    isError: isPricePublicError,
    isLoading: isPricePublicLoading,
  } = useContractRead({
    address: AppConfig.contractAddress,
    abi: AppConfig.abi,
    functionName: `PRICE`,
    chainId: 5,
  });
  //   read totalSup
  const {
    data: totalSupply,
    isError: isTotalSupplyError,
    isLoading: isTotalSupplyLoading,
  } = useContractRead({
    address: AppConfig.contractAddress,
    abi: AppConfig.abi,
    functionName: `TOTAL_SUPPLY`,
    watch: true,
    chainId: 5,
  });

  //read max supp
  const {
    data: maxSupply,
    isError: isMaxSupplyError,
    isLoading: isMaxSupplyLoading,
  } = useContractRead({
    address: AppConfig.contractAddress,
    abi: AppConfig.abi,
    functionName: `MAX_SUPPLY`,
    chainId: 5,
  });
  //read user public balance
  const {
    data: userBalance,
    isError: isUserBalanceError,
    isLoading: isUserBalanceLoading,
  } = useContractRead({
    address: AppConfig.contractAddress,
    abi: AppConfig.abi,
    args: [address],
    functionName: `getBalance`,
    watch: true,
    chainId: 5,
  });
  //read user wl public balance
  const {
    data: userWlBalance,
    isError: isUserWlBalanceError,
    isLoading: isUserWlBalanceLoading,
  } = useContractRead({
    address: AppConfig.contractAddress,
    abi: AppConfig.abi,
    args: [address],
    functionName: `getWlBalance`,
    watch: true,
    chainId: 5,
  });
  // -------------------------------------------------

  const whitelistMint = () => {
    const { config: config } = usePrepareContractWrite({
      address: AppConfig.contractAddress,
      abi: AppConfig.abi,
      functionName: "wlMint",
      chainId: 5,
      args: [mintCount, [...proofWl]],
      value: BigInt(isPriceWlLoading ? 0 : priceWl) * BigInt(mintCount),
      onError(error) {
        setError(error.message);
      },
    });
    const { data, isLoading, isSuccess, write } = useContractWrite(config);
    // Track tx
    const {
      data: watchTx,
      isError: isWaitTxError,
      isLoading: isWaitTxLoading,
    } = useWaitForTransaction({
      hash: data?.hash,
    });

    if (!mintingStatusWl) {
      return (
        <button disabled={true} className="mint-button">
          Soon !
        </button>
      );
    }
    if (
      isLoading ||
      isWlMintingStatusLoading ||
      isPriceWlLoading ||
      isWaitTxLoading
    ) {
      return (
        <button disabled={true} className="mint-button">
          <AiOutlineLoading />
        </button>
      );
    }
    if (!proofWl) {
      return (
        <button disabled={true} className="mint-button">
          {` Not WL`}
        </button>
      );
    } else {
      return (
        <>
          <button
            onClick={() => write?.()}
            className="mint-button"
            disabled={
              (mintingStatusWl && userWlBalance >= maxPerWl) || !address
            }
          >
            Mint
          </button>
          <div className="error-box">
            {(mintingStatusWl && userWlBalance >= maxPerWl) ||
            (mintingStatusPublic && userBalance >= maxPerPublic) ? (
              <span className="warning-text">Minting limit reached !</span>
            ) : (
              <span className="warning-text">
                {error && address ? `${cutString(error)}` : ""}
                {watchTx?.status == "reverted"
                  ? "⚠️ Error While Minting !"
                  : ""}
              </span>
            )}
            <span className="success-text">
              {isSuccess ? ` Transaction Succesful !` : ""}
            </span>
          </div>
        </>
      );
    }
  };

  // PUBLIC MINT TX
  const publicMint = () => {
    const { config: config } = usePrepareContractWrite({
      address: AppConfig.contractAddress,
      abi: AppConfig.abi,
      functionName: "mint",
      chainId: 5,
      args: [mintCount],
      value: BigInt(isPricePublicLoading ? 0 : pricePublic) * BigInt(mintCount),
      onError(error) {
        setError(error.message);
      },
    });
    const { data, isLoading, isSuccess, write } = useContractWrite(config);
    // Track tx
    const {
      data: watchTx,
      isError: isWaitTxError,
      isLoading: isWaitTxLoading,
    } = useWaitForTransaction({
      hash: data?.hash,
    });

    if (!mintingStatusPublic) {
      return (
        <button disabled={true} className="mint-button">
          Soon !
        </button>
      );
    }
    if (
      isLoading ||
      isPublicMintingStatusLoading ||
      isPricePublicLoading ||
      isWaitTxLoading
    ) {
      return (
        <button disabled={true} className="mint-button">
          <AiOutlineLoading />
        </button>
      );
    } else {
      return (
        <>
          <button
            onClick={() => write?.()}
            className="mint-button"
            disabled={
              (mintingStatusPublic && userBalance >= maxPerPublic) || !address
            }
          >
            Mint
          </button>
          <div className="error-box fstandard">
            {(mintingStatusWl && userWlBalance >= maxPerWl) ||
            (mintingStatusPublic && userBalance >= maxPerPublic) ? (
              <span className="warning-text">Minting limit reached !</span>
            ) : (
              <span className="warning-text">
                {error && address ? `${cutString(error)}` : ""}
                {watchTx?.status == "reverted"
                  ? "⚠️ Error While Minting !"
                  : ""}
              </span>
            )}
            <span className="success-text">
              {isSuccess ? ` Transaction Succesful !` : ""}
            </span>
          </div>
        </>
      );
    }
  };

  const handleMintCount = (newMintCount) => {
    const max =
      (mintingStatusWl
        ? Number(maxPerWl)
        : mintingStatusPublic
        ? Number(maxPerPublic)
        : 8) - (mintingStatusWl ? userWlBalance : userBalance);

    if (newMintCount > 0 && newMintCount <= max) {
      setMintCount(newMintCount);
    }
  };

  return (
    <>
      {mintingStatusWl || mintingStatusPublic ? (
        <div>{`${totalSupply} / ${maxSupply} Minted !`}</div>
      ) : (
        ""
      )}
      {mintingStatusWl ? whitelistMint() : publicMint()}
      <div
        className="flex mint-button-container
        "
      >
        {(mintingStatusWl || mintingStatusPublic) && address ? (
          <>
            <button
              onClick={() => handleMintCount(mintCount + 1)}
              className="counter-button"
            >
              +
            </button>
            <div>{mintCount}</div>
            <button
              onClick={() => handleMintCount(mintCount - 1)}
              className="counter-button"
            >
              -
            </button>
          </>
        ) : (
          ""
        )}
      </div>
      {mintingStatusWl && address ? (
        proofWl ? (
          <div>You are whitelisted !</div>
        ) : (
          <div>You are not whitelisted :/</div>
        )
      ) : (
        ""
      )}
    </>
  );
};

export default Mint;
