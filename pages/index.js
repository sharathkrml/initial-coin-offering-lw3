import { BigNumber, Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {
  CRYPTO_DEVS_NFT_CONTRACT_ADDRESS,
  CRYPTO_DEVS_NFT_ABI,
  TOKEN_ADDRESS,
  TOKEN_ABI,
} from "../constants";
import styles from "../styles/Home.module.css";
export default function Home() {
  const zero = BigNumber.from(0);
  // keep track of whether wallet connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // set true if transaction processing
  const [loading, setLoading] = useState(false);
  // Keep track of balance of an account
  const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] =
    useState(zero);
  // amount of token user wants to mint
  const [tokenAmount, setTokenAmount] = useState(zero);
  // tokensMinted is the total number of tokens that have been minted till now out of 10000(max total supply)
  const [tokensMinted, setTokensMinted] = useState(zero);
  const web3ModalRef = useRef();
  const getProviderOrSigner = async (needSigner = false) => {
    const connection = web3ModalRef.current.connect();
    const provider = new providers.Web3Provider(connection);
    // If user is not connected to the Rinkeby network, let them know and throw an error
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
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    // if wallet is not connected
    //  create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getTotalTokensMinted();
      getBalanceOfCryptoDevTokens();
      getTokensToBeClaimed();
    }
  }, [walletConnected]);
  return <h1>Hello</h1>;
}
