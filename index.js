require("dotenv").config();
const { ethers } = require("ethers");

async function automateFundDisbursement(event) {
  const { proposalId, creatorAddress, amount } = event;

  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Contract ABI
  const fundifyAbi = [
    "function getProposalStatus(uint256 proposalId) public view returns (string)",
    "function disburseFunds(uint256 proposalId) public",
  ];
  const fundifyContract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    fundifyAbi,
    wallet
  );

  try {
    // Validate Proposal
    const status = await fundifyContract.getProposalStatus(proposalId);
    if (status !== "approved") {
      console.log(`Proposal ${proposalId} is not approved.`);
      return;
    }

    // Estimate Gas
    const gasEstimate =
      await fundifyContract.estimateGas.disburseFunds(proposalId);

    // Execute Transaction
    const tx = await fundifyContract.disburseFunds(proposalId, {
      gasLimit: gasEstimate,
    });
    console.log(`Funds disbursed successfully: ${tx.hash}`);
  } catch (error) {
    console.error("Error disbursing funds:", error);
  }
}

// Test Event Simulation
const testEvent = {
  proposalId: 1,
  creatorAddress: "0x123...",
  amount: ethers.utils.parseEther("10"),
};
automateFundDisbursement(testEvent);

module.exports = automateFundDisbursement;
