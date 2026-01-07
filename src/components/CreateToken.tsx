import React, { useState } from "react";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToCheckedInstruction
} from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";

/**
 * Props:
 * - connection: Connection (from useConnection)
 * - wallet: WalletContextState (from useWallet)
 */
export default function CreateToken({ connection, wallet }: { connection: Connection; wallet: WalletContextState; }) {
  const [name, setName] = useState("MyToken");
  const [symbol, setSymbol] = useState("MTK");
  const [decimals, setDecimals] = useState<number>(6);
  const [initialSupply, setInitialSupply] = useState<number>(1000);
  const [freeze, setFreeze] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [result, setResult] = useState<string>("");

  const handleCreate = async () => {
    setStatus("");
    setResult("");
    if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
      setStatus("Please connect your wallet.");
      return;
    }

    try {
      setStatus("Preparing mint creation...");

      // Generate a new mint Keypair (we'll keep it only client-side; the secret is not stored)
      const mintKeypair = window.solana?.isPhantom ? await (await import("@solana/web3.js")).Keypair.generate() : (await import("@solana/web3.js")).Keypair.generate(); // typing fallback

      const mintPubkey = mintKeypair.publicKey;

      // Calculate size & rent (MINT account size is 82)
      const MINT_SIZE = 82;
      const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

      // Build transaction:
      const tx = new Transaction();

      // 1) create mint account
      tx.add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintPubkey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID
        })
      );

      // 2) initialize mint
      // mint authority and freeze authority: set to connected wallet.publicKey (or null for freeze)
      const mintAuthority = wallet.publicKey;
      const freezeAuthority = freeze ? wallet.publicKey : null;

      tx.add(
        createInitializeMintInstruction(
          mintPubkey,
          decimals,
          mintAuthority,
          freezeAuthority,
          TOKEN_PROGRAM_ID
        )
      );

      // 3) create associated token account for wallet and mint initial supply there
      const ata = await getAssociatedTokenAddress(mintPubkey, wallet.publicKey);

      tx.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey, // payer
          ata,
          wallet.publicKey,
          mintPubkey
        )
      );

      // 4) mint initial supply (we will use mintToChecked; amount must be in base units)
      const supplyInBaseUnits = BigInt(Math.floor(initialSupply)) * BigInt(10 ** decimals);
      tx.add(
        createMintToCheckedInstruction(
          mintPubkey,
          ata,
          wallet.publicKey, // authority
          supplyInBaseUnits,
          decimals,
          TOKEN_PROGRAM_ID
        )
      );

      // Partial sign with mint keypair (mint account must sign)
      tx.feePayer = wallet.publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;

      tx.partialSign(mintKeypair);

      // Ask wallet to sign (connect wallet will sign)
      const signed = await wallet.signTransaction(tx);

      // Send and confirm
      setStatus("Sending transaction...");
      const raw = signed.serialize();
      const txid = await connection.sendRawTransaction(raw);
      setStatus(`Tx sent: ${txid}. Confirming...`);
      await connection.confirmTransaction(txid, "confirmed");

      setStatus("Confirmed. Token created!");
      setResult(`Mint Address: ${mintPubkey.toBase58()}\nAssociated Token Account: ${ata.toBase58()}\nTransaction: ${txid}\nSymbol(Name) are not on-chain by default.`);

      // Note: to store name/symbol/URI on-chain, integrate Metaplex Token Metadata program
      // (mpl-token-metadata) — create metadata PDA and call createMetadata instruction.
    } catch (err: any) {
      console.error(err);
      setStatus("Error: " + (err.message || String(err)));
    }
  };

  return (
    <div>
      <div className="field">
        <label>Token Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="field">
        <label>Symbol</label>
        <input value={symbol} onChange={(e) => setSymbol(e.target.value)} />
      </div>

      <div className="field">
        <label>Decimals</label>
        <input type="number" value={decimals} onChange={(e) => setDecimals(Number(e.target.value))} />
      </div>

      <div className="field">
        <label>Initial supply (human-readable)</label>
        <input type="number" value={initialSupply} onChange={(e) => setInitialSupply(Number(e.target.value))} />
      </div>

      <div className="field">
        <label>
          <input type="checkbox" checked={freeze} onChange={() => setFreeze(!freeze)} /> Set freeze authority to your wallet
        </label>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleCreate}>Create Token</button>
      </div>

      {status && <div className="result" style={{ marginTop: 12 }}>{status}</div>}
      {result && <div className="result" style={{ marginTop: 12 }}>{result}</div>}
    </div>
  );
}
