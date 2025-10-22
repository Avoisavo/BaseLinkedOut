import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import { encodeFunctionData, namehash, createPublicClient, http } from "viem";
import { normalize } from "viem/ens";
import { baseSepolia } from "viem/chains";
import os from "os";

// Relevant ABI for L2 Resolver Contract.
const l2ResolverABI = [
    {
      inputs: [
        { internalType: "bytes32", name: "node", type: "bytes32" },
        { internalType: "address", name: "a", type: "address" },
      ],
      name: "setAddr",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "bytes32", name: "node", type: "bytes32" },
        { internalType: "string", name: "newName", type: "string" },
      ],
      name: "setName",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];
  
  // Relevant ABI for Basenames Registrar Controller Contract.
  const registrarABI = [
    {
      inputs: [
        { internalType: "string", name: "name", type: "string" },
        { internalType: "uint256", name: "duration", type: "uint256" },
      ],
      name: "registerPrice",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: "string",
              name: "name",
              type: "string",
            },
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "duration",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "resolver",
              type: "address",
            },
            {
              internalType: "bytes[]",
              name: "data",
              type: "bytes[]",
            },
            {
              internalType: "bool",
              name: "reverseRecord",
              type: "bool",
            },
          ],
          internalType: "struct RegistrarController.RegisterRequest",
          name: "request",
          type: "tuple",
        },
      ],
      name: "register",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
  ];

// Basenames Registrar Controller Contract Address.
const BaseNamesRegistrarControllerAddress = "0x49aE3cC2e3AA768B1e5654f5D3C6002144A59581";

// L2 Resolver Contract Address.
const L2ResolverAddress = "0x6533C94869D28fAA8dF77cc63f9e2b2D6Cf77eBA";
// The regular expression to validate a Basename on Base Sepolia.
const baseNameRegex = /\.basetest\.eth$/;
// Create register contract method arguments.
function createRegisterContractMethodArgs(baseName, addressId) {
  const addressData = encodeFunctionData({
    abi: l2ResolverABI,
    functionName: "setAddr",
    args: [namehash(normalize(baseName)), addressId],
  });
  const nameData = encodeFunctionData({
    abi: l2ResolverABI,
    functionName: "setName",
    args: [namehash(normalize(baseName)), baseName],
  });

  // CDP SDK expects the tuple as an array (not an object)
  const registerArgs = {
    request: [
      baseName.replace(baseNameRegex, ""),  // name
      addressId,                             // owner
      "31557600",                            // duration (1 year)
      L2ResolverAddress,                     // resolver
      [addressData, nameData],               // data
      true,                                  // reverseRecord
    ],
  };
  console.log(`Register contract method arguments constructed: `, JSON.stringify(registerArgs, null, 2));

  return registerArgs;
}

// Get price from contract
async function getRegisterPrice(name) {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  const nameOnly = name.replace(baseNameRegex, "");
  
  console.log(`📊 Querying price for "${nameOnly}"...`);
  
  const price = await client.readContract({
    address: BaseNamesRegistrarControllerAddress,
    abi: registrarABI,
    functionName: "registerPrice",
    args: [nameOnly, 31557600n],
  });

  return price;
}

// Register a Basename for the given Wallet.
async function registerBaseName(wallet, registerArgs, price) {
  try {
    // Add 50% buffer to be safe (excess will be refunded)
    const priceWithBuffer = (BigInt(price) * 150n) / 100n;
    const priceInEth = Number(priceWithBuffer) / 1e18;
    
    console.log(`💰 Base price: ${(Number(price) / 1e18).toFixed(6)} ETH`);
    console.log(`💰 Sending: ${priceInEth.toFixed(6)} ETH (with 50% buffer - excess will be refunded)`);
    console.log(`⏳ Registering basename...\n`);

    const contractInvocation = await wallet.invokeContract({
      contractAddress: BaseNamesRegistrarControllerAddress,
      method: "register",
      abi: registrarABI,
      args: registerArgs,
      amount: priceInEth,
      assetId: Coinbase.assets.Eth,
    });

    console.log(`⏳ Waiting for transaction confirmation...`);
    await contractInvocation.wait();

    console.log(`\n✅ SUCCESS! Basename registered!`);
    console.log(`═══════════════════════════════════════`);
    console.log(`   ${registerArgs.request[0]}.basetest.eth`);
    console.log(`   → ${registerArgs.request[1]}`);
    console.log(`═══════════════════════════════════════`);
    console.log(`\n🎉 Your basename is now live!`);
  } catch (error) {
    console.error(`\n❌ Error registering Basename:`, error);
    throw error;
  }
}

// Fetch a funded Wallet and load its Seed.
async function fetchWalletAndLoadSeed(walletId, seedFilePath) {
  try {
    const wallet = await Wallet.fetch(walletId);
    await wallet.loadSeedFromFile(seedFilePath);

    console.log(`Successfully loaded funded wallet: `, wallet);
    return wallet;
  } catch (error) {
    console.error(
      `Error loading funded wallet ${walletId} from seed file ${seedFilePath}: `,
      error,
    );
  }
}

(async () => {
  try {
    const { BASE_NAME, WALLET_ID, SEED_FILE_PATH } = process.env;

    console.log("🚀 Starting Basename Registration");
    console.log("═══════════════════════════════════════");
    console.log(`   Basename: ${BASE_NAME}`);
    console.log("═══════════════════════════════════════\n");

    // Manage CDP API Key for Coinbase SDK.
    // Configure location to CDP API Key.
    Coinbase.configureFromJson({
      filePath: `${os.homedir()}/Downloads/cdp_api_key.json`,
    });

    // Fetch funded Wallet.
    console.log("📂 Loading wallet...");
    const wallet = await fetchWalletAndLoadSeed(WALLET_ID, SEED_FILE_PATH);
    const defaultAddress = await wallet.getDefaultAddress();
    console.log(`✅ Wallet loaded: ${defaultAddress.getId()}\n`);

    // Get the actual price from the contract
    const price = await getRegisterPrice(BASE_NAME);
    
    // Register Basename.
    const registerArgs = createRegisterContractMethodArgs(BASE_NAME, defaultAddress.getId());
    await registerBaseName(wallet, registerArgs, price);
  } catch (error) {
    console.error(`\n❌ Registration failed:`, error);
  }
})();