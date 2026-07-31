import { StressTester } from './packages/simulation/src/StressTester';

async function main() {
  const tester = new StressTester();
  console.log("=== Starting MS8 Ledger Stress Test ===");
  await tester.simulateLedgerLoad(10000);
  console.log("=== Stress Test Completed ===");
}

main().catch(console.error);
