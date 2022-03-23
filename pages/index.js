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
  const getTotalTokensMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
      const balance = await tokenContract.totalSupply();
      console.log(balance);
      setTotalTokensMinted(balance);
    } catch (error) {
      console.log(error);
      setTotalTokensMinted(zero);
    }
  };
  const getBalanceOfOwner = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
      const signer = await getProviderOrSigner(true);
      const address = signer.getAddress();
      const balance = await tokenContract.balanceOf(address);
      setBalanceOfOwner(balance);
    } catch (error) {
      console.log(error);
      setBalanceOfOwner(zero);
    }
  };
  const mintCryptoDevToken = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      const value = 0.001 * amount;
      const tx = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString()),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Sucessfully minted Crypto Dev Tokens");
      await readAll();
    } catch (error) {
      console.log(error);
    }
  };
  const claimCryptoDevToken = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      const tx = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Sucessfully minted Crypto Dev Tokens");
      await readAll();
    } catch (error) {
      console.log(error);
    }
  };

  const getTokenDueToNFT = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        CRYPTO_DEVS_NFT_CONTRACT_ADDRESS,
        CRYPTO_DEVS_NFT_ABI,
        provider
      );
      const tokenContract = new Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
      const signer = await getProviderOrSigner(true);
      const address = signer.getAddress();
      const balance = await nftContract.balanceOf(address);
      console.log("no of nfts", balance);
      if (balance === zero) {
        setTokenDueToNFT(zero);
      } else {
        var amount = 0;
        for (var i = 0; i < balance; i++) {
          // get tokenId of user by index
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId);
          if (!claimed) {
            amount++;
          }
        }
        setTokenDueToNFT(BigNumber.from(amount));
      }
    } catch (error) {
      console.log(error);
      setTokenDueToNFT(zero);
    }
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
          <button className={styles.button} onClick={claimCryptoDevToken}>
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
          onClick={() => mintCryptoDevToken(inputAmount)}
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
  const readAll = async () => {
    await getBalanceOfOwner();
    await getTotalTokensMinted();
    await getTokenDueToNFT();
  };
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      readAll();
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
