"use client";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { ContractEntriesList } from "@/components/ContractEntriesList";
import toast from "react-hot-toast";

export default function Home() {
  const router = useRouter();

  const handleCreateClass = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error("MetaMask is not installed. Please install MetaMask and try again.");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Network check remains the same
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
              toast.error("Failed to add the Arbitrum Sepolia Testnet. Please add it manually in MetaMask.");
              return;
            }
          } else {
            console.error("Failed to switch network:", switchError);
            toast.error("Please switch to the Arbitrum Sepolia Testnet in MetaMask.");
            return;
          }

        }
      }

      // Updated contract ABI
      const contractAddress = "0x2E3382B72484AC0b3db4847CB1267468671905f9";
      const contractABI = [
        "function registerClass(string memory className) external",
        "function registerInstance(string memory className, string memory data) external"
      ];
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const className = prompt("Enter the name for the new embodiment class:");
      if (!className) {
        toast.error("A class name is required!");
        return;
      }

      // Directly use string instead of bytes32 conversion
      const tx = await contract.registerClass(className);
      console.log("Transaction sent:", tx.hash);
      toast.loading(`Transaction sent: ${tx.hash}\nWaiting for confirmation...`);

      await tx.wait();
      console.log("Embodiment class registered successfully!");
      toast.success("Embodiment class registered successfully!");
      
      router.refresh();
    } catch (error) {
      console.error("Error creating embodiment class:", error);
      toast.error("Error creating embodiment class. Please check the console for details.");
    }
  };

  // Add this new handler for instance registration
  const handleRegisterInstance = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractAddress = "0x2E3382B72484AC0b3db4847CB1267468671905f9";
      const contractABI = [
        "function registerInstance(string memory className, string memory data) external"
      ];
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const className = prompt("Enter the class name for the new robot:");
      if (!className) {
        toast.error("Class name is required!");
        return;
      }

      const data = prompt("Enter robot data (JSON or text):");
      if (!data) {
        toast.error("Robot data is required!");
        return;
      }

      const tx = await contract.registerInstance(className, data);
      await tx.wait();
      toast.success("Robot registered successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error registering robot:", error);
      toast.error("Error registering robot. Check console for details.");
    }
  };

  return (
    <main>
      <div className="flex min-h-screen flex-col items-center justify-start p-8">
        <div className="w-full max-w-sm rounded-lg bg-white p-8 text-center shadow-lg">
          <h2 className="mb-6 text-xl font-bold">Robot Management System</h2>
          <div className="space-y-4">
            <button
              onClick={handleCreateClass}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Create a New Embodiment Class
            </button>
            <button
              onClick={handleRegisterInstance}
              className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
            >
              Register a New Robot
            </button>
          </div>
          <ContractEntriesList />
        </div>
      </div>
    </main>
  );
}