import { ethers } from "ethers";
import toast from "react-hot-toast";

export const ARBITRUM_SEPOLIA_CHAIN_ID = "421614";
const ARBITRUM_SEPOLIA_CHAIN_ID_HEX = "0x66eee"; // 421614 in hex

export async function switchToArbitrumSepolia() {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask is not installed");
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const network = await provider.getNetwork();
  
  if (network.chainId.toString() !== ARBITRUM_SEPOLIA_CHAIN_ID) {
    try {
      // Try to switch to Arbitrum Sepolia
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ARBITRUM_SEPOLIA_CHAIN_ID_HEX }],
      });
    } catch (switchError: any) {
      // Chain hasn't been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: ARBITRUM_SEPOLIA_CHAIN_ID_HEX,
              chainName: "Arbitrum Sepolia",
              rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
              blockExplorerUrls: ["https://sepolia.arbiscan.io"],
            }],
          });
        } catch (addError) {
          throw new Error("Failed to add Arbitrum Sepolia network");
        }
      } else {
        throw switchError;
      }
    }
  }

  // Get a fresh provider instance after the network switch
  return new ethers.providers.Web3Provider(window.ethereum);
}
