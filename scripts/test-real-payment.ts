import { PaymentController } from '../src/api/v1/payments/PaymentController';
import { Keypair } from '@solana/web3.js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

// Set DB variables to match docker-compose if not already set
process.env.DB_USER = process.env.DB_USER || 'gyb_admin';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'gyb_password';
process.env.DB_NAME = process.env.DB_NAME || 'gyb_core';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';

async function testPayment() {
  console.log("Initializing Real Payment Controller...");
  const controller = new PaymentController();
  
  // Create a random destination wallet for testing
  const destinationKeypair = Keypair.generate();
  
  const req = {
    body: {
      userId: 'test_user_1',
      senderWalletId: 'sender_wallet_uuid',
      recipientWalletId: 'recipient_wallet_uuid',
      amount: 5.0, // 5.0 USDC
      fromCurrency: 'USDC',
      toCurrency: 'USDC',
      senderCountry: 'US',
      recipientCountry: 'IN',
      metadata: {
        memo: "Test real payment via Solana Devnet",
        // In a real system, the recipient's blockchain address would be tied to their walletId in the DB
        // For this test, we inject it here so the adapter can use it
        destinationAddress: destinationKeypair.publicKey.toBase58()
      }
    }
  };
  
  const res = {
    status: (code: number) => {
      console.log(`Response Status: ${code}`);
      return {
        json: (data: any) => {
          console.log("Response Data:", JSON.stringify(data, null, 2));
        }
      };
    }
  };

  console.log("Executing Payment...");
  await controller.createPayment(req, res);
}

testPayment().catch(console.error);
