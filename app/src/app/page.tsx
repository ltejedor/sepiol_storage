"use client";

import { useRouter } from "next/navigation";
import { ethers } from "ethers";

export default function Home() {
  const router = useRouter();

  const handleCreateClass = async () => {
    // Ensure MetaMask is installed
    if (typeof window.ethereum === "undefined") {
      alert("MetaMask is not installed. Please install MetaMask and try again.");
      return;
    }

    try {
      // Request account access via MetaMask.
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Check if we're on the Arbitrum Sepolia Testnet.
      // (Replace 421611 with the actual chain ID if it differs.)
      const expectedChainId = 421614;
      const network = await provider.getNetwork();
      if (network.chainId !== expectedChainId) {
        try {
          // Attempt to switch to the Arbitrum Sepolia Testnet.
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "421614" }], 
          });
        } catch (switchError: any) {
          // If the chain hasn't been added to MetaMask, error code 4902 will be returned.
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{
                  chainId: "421614", 
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
              console.error("Failed to add Arbitrum Sepolia network:", addError);
              alert("Failed to add the Arbitrum Sepolia Testnet. Please add it manually in MetaMask.");
              return;
            }
          } else {
            console.error("Failed to switch network:", switchError);
            alert("Please switch to the Arbitrum Sepolia Testnet in MetaMask.");
            return;
          }
        }
      }

      // Now that we are on the correct network, create the contract instance.
      const contractAddress = "0xa090431c3D10D9b7d374Fd5B8dE7Bb0687DDBD52";
      const contractABI = [
        "function registerClass(bytes32 classHash) external"
      ];
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Prompt the user for the new class name.
      const className = prompt("Enter the name for the new embodiment class:");
      if (!className) {
        alert("A class name is required!");
        return;
      }

      // Convert the class name to a bytes32 value.
      const classHash = ethers.utils.formatBytes32String(className);

      // Call the registerClass function.
      const tx = await contract.registerClass(classHash);
      console.log("Transaction sent:", tx.hash);
      alert(`Transaction sent: ${tx.hash}\nWaiting for confirmation...`);

      // Wait for transaction confirmation.
      await tx.wait();
      console.log("Embodiment class registered successfully!");
      alert("Embodiment class registered successfully!");
    } catch (error) {
      console.error("Error creating embodiment class:", error);
      alert("Error creating embodiment class. Please check the console for details.");
    }
  };

  return (
    <main>
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-sm rounded-lg bg-white p-8 text-center shadow-lg">
          <h2 className="mb-6 text-xl font-bold">Robot Management System</h2>
          <div className="space-y-4">
            <button
              onClick={handleCreateClass}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Create a New Embodiment Class
            </button>
            <button
              className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
            >
              Register a New Robot
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
