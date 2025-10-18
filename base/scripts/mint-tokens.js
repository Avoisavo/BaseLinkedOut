const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("Minting with account:", signer.address);
    
    // Base Sepolia OFT contract address (from deployment)
    const baseSepoliaOFT = await ethers.getContractAt(
        "MyOFT", 
        "0x1498FECa6fb7525616C369592440B6E8325C3D6D"
    );
    
    const mintAmount = ethers.utils.parseEther("1");
    console.log("\n🪙 Minting 1 token on Base Sepolia...");
    const tx = await baseSepoliaOFT.mint(signer.address, mintAmount);
    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    
    const balance = await baseSepoliaOFT.balanceOf(signer.address);
    console.log("\n✅ Minting completed!");
    console.log("Your balance:", ethers.utils.formatEther(balance), "tokens");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

