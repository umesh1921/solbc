import React from "react";
import CreateToken from "./components/CreateToken";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function App() {
  const { connection } = useConnection();
  const wallet = useWallet();

  return (
    <div className="container">
      <h1>Solana Token Creator</h1>
      <p>Create an SPL token (mint) on Devnet and mint initial supply to your wallet.</p>

      <div style={{ margin: "1rem 0" }}>
        <WalletMultiButton />
      </div>

      <CreateToken connection={connection} wallet={wallet} />
    </div>
  );
}
