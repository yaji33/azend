const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
  const factoryAddress = "0x36fe65BBC38c4692C9C6138d6a103d1BfE93942a";

  // Get all transaction receipts for the factory
  console.log("🔍 Checking factory transactions...");

  // Get the latest block
  const currentBlock = await provider.getBlockNumber();
  console.log("Current block:", currentBlock);

  // Check around the blocks from your screenshot
  const blocksToCheck = [9741536, 9741597, 9741599];

  for (const blockNumber of blocksToCheck) {
    console.log(`\n📦 Checking block ${blockNumber}...`);
    const block = await provider.getBlock(blockNumber, true);

    if (block && block.transactions) {
      for (const txHash of block.transactions) {
        const tx = await provider.getTransaction(txHash);
        if (tx && tx.to && tx.to.toLowerCase() === factoryAddress.toLowerCase()) {
          console.log(`  Found tx to factory: ${txHash}`);
          console.log(`  From: ${tx.from}`);
          console.log(`  Input: ${tx.data.substring(0, 50)}...`);

          // Get receipt to see if it created a contract
          const receipt = await provider.getTransactionReceipt(txHash);
          if (receipt && receipt.contractAddress) {
            console.log(`  ✅ Created contract: ${receipt.contractAddress}`);
          }
        }
      }
    }
  }
}

main();
