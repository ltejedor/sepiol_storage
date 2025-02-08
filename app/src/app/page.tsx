"use client";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { ContractEntriesList } from "@/components/ContractEntriesList";
import toast from "react-hot-toast";
import { EMBODIMENT_REGISTRY_ADDRESS } from "@/lib/contractConfig";
import { switchToArbitrumSepolia } from "@/lib/switchNetwork";

export default function Home() {
  const router = useRouter();

  const handleCreateClass = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error("MetaMask is not installed. Please install MetaMask and try again.");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = await switchToArbitrumSepolia();
      const signer = provider.getSigner();

      // Updated contract ABI
      const contractABI = [
        "function registerClass(string memory className) external",
      ];
      const contract = new ethers.Contract(EMBODIMENT_REGISTRY_ADDRESS, contractABI, signer);

      const className = prompt("Enter the name for the new embodiment class:");
      if (!className) {
        toast.error("A class name is required!");
        return;
      }

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
          </div>
          <ContractEntriesList />
        </div>
      </div>
    </main>
  );
}
