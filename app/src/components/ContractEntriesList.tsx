"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { EMBODIMENT_REGISTRY_ADDRESS, ENTITY_REGISTRY_ADDRESS, ENTITY_REGISTRY_ABI, computeClassHash, checkClassExists } from "@/lib/contractConfig";
import { switchToArbitrumSepolia } from "@/lib/switchNetwork";

interface TransactionInfo {
  hash: string;
  blockNumber: number;
  from: string;
  method: 'registerClass' | 'registerInstance';
  className?: string;
  data?: string;
  timestamp: number;
  value: string;
  fee: string;
}

export function ContractEntriesList() {
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleRegisterRobot = async (className: string) => {
    if (typeof window.ethereum === "undefined") {
      toast.error("MetaMask is not installed");
      return;
    }

    try {
      const provider = await switchToArbitrumSepolia();
      
      // Check if the class exists before proceeding
      const exists = await checkClassExists(className, provider);
      if (!exists) {
        toast.error("This class does not exist. Please register it first.");
        return;
      }

      const signer = provider.getSigner();

      const data = prompt("Enter robot data (JSON or text):");
      if (!data) {
        toast.error("Robot data is required!");
        return;
      }

      const classHash = computeClassHash(className);
      const contract = new ethers.Contract(ENTITY_REGISTRY_ADDRESS, ENTITY_REGISTRY_ABI, signer);

      const toastId = toast.loading("Registering robot...");
      
      // Add explicit gas limit to avoid estimation issues
      const tx = await contract.registerEntity(classHash, data, {
        gasLimit: 500000 // Set a reasonable gas limit
      });
      
      await tx.wait();
      toast.success("Robot registered successfully!", { id: toastId });
      
      // Refresh the transactions list
      fetchTransactions();
    } catch (error) {
      console.error("Error registering robot:", error);
      toast.error("Failed to register robot. Please check the console for details.");
    }
  };

  const fetchTransactions = async () => {
    try {
      const rpcUrl = "https://sepolia-rollup.arbitrum.io/rpc";
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

      // Contract ABI for input data decoding
      const contractABI = [
        "function registerClass(string memory className)",
        "function registerInstance(string memory className, string memory data)"
      ];
      const contractInterface = new ethers.utils.Interface(contractABI);

      // Get all transactions to the contract
      const logs = await provider.getLogs({
        address: EMBODIMENT_REGISTRY_ADDRESS,
        fromBlock: 0,
        toBlock: "latest"
      });

      // Get unique transaction hashes
      const txHashes = Array.from(new Set(logs.map(l => l.transactionHash)));

      // Process last 10 transactions
      const recentTxHashes = txHashes.slice(-10).reverse();
      
      const transactionsData = await Promise.all(
        recentTxHashes.map(async (txHash) => {
          const tx = await provider.getTransaction(txHash);
          const receipt = await provider.getTransactionReceipt(txHash);
          const block = await provider.getBlock(tx.blockNumber);
          
          // Decode input data
          let method, className, data;
          try {
            const parsed = contractInterface.parseTransaction({ data: tx.data });
            method = parsed.name;
            if (method === 'registerClass') {
              className = parsed.args.className;
            } else if (method === 'registerInstance') {
              className = parsed.args.className;
              data = parsed.args.data;
            }
          } catch (e) {
            return null; // Skip non-relevant transactions
          }

          return {
            hash: txHash,
            blockNumber: tx.blockNumber,
            from: tx.from,
            method: method as 'registerClass' | 'registerInstance',
            className,
            data,
            timestamp: block.timestamp,
            value: ethers.utils.formatEther(tx.value),
            fee: ethers.utils.formatEther(receipt.gasUsed.mul(receipt.effectiveGasPrice))
          };
        })
      );

      setTransactions(transactionsData.filter(Boolean));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Age calculation function
  const getAge = (timestamp: number) => {
    const ageSeconds = Math.floor(Date.now() / 1000) - timestamp;
    if (ageSeconds < 60) return `${ageSeconds} sec ago`;
    if (ageSeconds < 3600) return `${Math.floor(ageSeconds/60)} min ago`;
    if (ageSeconds < 86400) return `${Math.floor(ageSeconds/3600)} hrs ago`;
    return `${Math.floor(ageSeconds/86400)} days ago`;
  };

  if (isLoading) {
    return <div className="mt-8 text-center text-gray-600">Loading...</div>;
  }

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-lg font-semibold">Contract Interactions</h3>
      {transactions.length === 0 ? (
        <p className="text-gray-600">No interactions found</p>
      ) : (
        <ul className="space-y-4">
          {transactions.map((tx) => (
            <li key={tx.hash} className="bg-gray-100 p-4 rounded-md shadow-sm">
              <p><strong>Method:</strong> {tx.method}</p>
              <p><strong>Class:</strong> {tx.className}</p>
              {tx.data && <p><strong>Data:</strong> {tx.data}</p>}
              <p><strong>From:</strong> {tx.from}</p>
              <p><strong>Age:</strong> {getAge(tx.timestamp)}</p>
              <p><strong>TX Hash:</strong> <span className="text-sm">{tx.hash}</span></p>
              {/* {tx.method === 'registerClass' && tx.className && (
                <button
                  onClick={() => handleRegisterRobot(tx.className!)}
                  className="mt-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                >
                  Register Robot for this Class
                </button>
              )} */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
