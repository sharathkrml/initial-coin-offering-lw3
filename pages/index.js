import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useEffect, useState, useRef } from "react";
import Web3Modal from "web3modal";
import { providers, Contract, BigNumber, utils } from "ethers";
import {
  CRYPTO_DEVS_NFT_CONTRACT_ADDRESS,
  CRYPTO_DEVS_NFT_ABI,
  TOKEN_ADDRESS,
  TOKEN_ABI,
} from "../constants";
export default function Home() {
  const zero = BigNumber.from(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [balanceOfOwner, setBalanceOfOwner] = useState(zero);
  const [totalTokensMinted, setTotalTokensMinted] = useState(zero);
  const [loading, setLoading] = useState(false);
  const [tokenDueToNFT, setTokenDueToNFT] = useState(zero);
  const [inputAmount, setInputAmount] = useState(zero);
  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    const connection = await web3ModalRef.current.connect();
    const provider = new providers.Web3Provider(connection);
    const { chainId } = await provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }
    if (needSigner) {
      const signer = provider.getSigner();
      return signer;
    }
    return provider;
  };
  const renderButton = () => {
    if (loading) {
      return (
        <div>
          <button className={styles.button}>Loading...</button>
        </div>
      );
    }
    if (tokenDueToNFT > 0) {
      return (
        <div>
          <div className={styles.description}>
            {tokenDueToNFT * 10} Tokens can be claimed!
          </div>
          <button className={styles.button} onClick={claimCryptoDevTokens}>
            Claim Tokens
          </button>
        </div>
      );
    }
    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="Amount of Tokens"
            // BigNumber.from converts the `e.target.value` to a BigNumber
            onChange={(e) => {
              if (e.target.value === "") {
                return setInputAmount(BigNumber.from(0));
              }
              return setInputAmount(BigNumber.from(e.target.value));
            }}
            className={styles.input}
          />
        </div>

        <button
          className={styles.button}
          disabled={!(inputAmount > 0)}
          onClick={() => mintCryptoDevToken(tokenAmount)}
        >
          Mint Tokens
        </button>
      </div>
    );
  };
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="ICO-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs ICO!</h1>
          <div className={styles.description}>
            You can claim or mint Crypto Dev tokens here
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                You have minted {utils.formatEther(balanceOfOwner)} Crypto Dev
                Tokens
              </div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                Overall {utils.formatEther(totalTokensMinted)}/10000 have been
                minted!!!
              </div>
              {renderButton()}
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>
        <div>
          <img className={styles.image} src="./0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
