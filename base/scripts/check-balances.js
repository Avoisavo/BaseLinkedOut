const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("\n🔍 Checking balances for:", signer.address);
    console.log("=".repeat(60));
    
    // Get network from hardhat runtime
    const networkName = hre.network.name;
    
    if (networkName === "base-sepolia") {
        const baseSepoliaOFT = await ethers.getContractAt(
            "MyOFT", 
            "0x1498FECa6fb7525616C369592440B6E8325C3D6D"
        );
        
        const balance = await baseSepoliaOFT.balanceOf(signer.address);
        const totalSupply = await baseSepoliaOFT.totalSupply();
        
        console.log("\n📍 Base Sepolia (EID: 40245)");
        console.log("   Contract: 0x1498FECa6fb7525616C369592440B6E8325C3D6D");
        console.log("   Your Balance:", ethers.utils.formatEther(balance), "tokens");
        console.log("   Total Supply:", ethers.utils.formatEther(totalSupply), "tokens");
        
    } else if (networkName === "hedera-testnet") {
        const hederaOFT = await ethers.getContractAt(
            "MyOFT", 
            "0xAd9C65E6F4BD584A77bA942B7a5f4BEc67520181"
        );
        
        const balance = await hederaOFT.balanceOf(signer.address);
        const totalSupply = await hederaOFT.totalSupply();
        
        console.log("\n📍 Hedera Testnet (EID: 40285)");
        console.log("   Contract: 0xAd9C65E6F4BD584A77bA942B7a5f4BEc67520181");
        console.log("   Your Balance:", ethers.utils.formatEther(balance), "tokens");
        console.log("   Total Supply:", ethers.utils.formatEther(totalSupply), "tokens");
        
    } else {
        console.log("\n❌ Unknown network. Use --network base-sepolia or --network hedera-testnet");
    }
    
    console.log("\n" + "=".repeat(60));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

