import React from "react";
import { createRoot } from "react-dom/client";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  BraveWalletAdapter
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import App from "./App";
import "./styles.css";

/* Default anchors to Devnet */
const endpoint = "https://api.devnet.solana.com";

/* Wallet adapters */
const wallets = [new PhantomWalletAdapter(), new BraveWalletAdapter()];

createRoot(document.getElementById("root")!).render(
  <ConnectionProvider endpoint={endpoint}>
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <App />
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
);
