import { Keypair, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log("Generating Treasury Keypair...");
  const keypair = Keypair.generate();
  const secret = Buffer.from(keypair.secretKey).toString('hex');
  const pubkey = keypair.publicKey.toBase58();
  
  console.log(`Public Key: ${pubkey}`);
  console.log(`Secret Key (hex): ${secret}`);
  
  const envPath = path.join(__dirname, '../.env');
  fs.appendFileSync(envPath, `\nTREASURY_SOLANA_PUBKEY=${pubkey}\nTREASURY_SOLANA_SECRET=${secret}\n`);
  
  console.log("Saved to .env");
  
  console.log("Requesting Airdrop on Devnet...");
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  try {
    const signature = await connection.requestAirdrop(keypair.publicKey, 2 * LAMPORTS_PER_SOL);
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature
    });
    console.log("Airdrop successful! Tx:", signature);
  } catch (err) {
    console.error("Airdrop failed. You might need to manually fund it from a faucet:", err);
  }
}

main().catch(console.error);
