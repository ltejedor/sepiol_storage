"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { EMBODIMENT_REGISTRY_ADDRESS, computeClassHash, checkClassExists } from "@/lib/contractConfig";
import { switchToArbitrumSepolia } from "@/lib/switchNetwork";
import { Terminal } from 'lucide-react';


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
      
      // Check if the class exists before proceeding (assuming checkClassExists uses the correct contract)
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
  
      // Use the correct contract address and ABI
      const contractABI = [
        "function registerInstance(string calldata className, string calldata data) external"
      ];
      const contract = new ethers.Contract(EMBODIMENT_REGISTRY_ADDRESS, contractABI, signer);
  
      const toastId = toast.loading("Registering robot...");
  
      // Call the correct function with the correct parameters
      const tx = await contract.registerInstance(className, data, {
        gasLimit: 500000 // Optional: add gas limit if needed
      });
      
      await tx.wait();
      toast.success("Robot registered successfully!", { id: toastId });
      
      // Refresh the transactions list if necessary
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
    return (
      <div className="p-4 text-center animate-pulse">
        > ACCESSING BLOCKCHAIN DATA...
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="mb-4 text-lg font-bold flex items-center gap-2">
        <Terminal className="inline" /> REGISTERED EMBODIMENTS
      </h3>
      
      {transactions.length === 0 ? (
        <p className="text-green-400/60">NO REGISTRATIONS FOUND IN DATABASE</p>
      ) : (
        <ul className="space-y-4">
          {transactions.map((tx) => (
            <li key={tx.hash} className="border border-green-400/30 rounded-lg p-4 hover:bg-green-400/5">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><span className="text-green-400/60">METHOD:</span> {tx.method}</p>
                <p><span className="text-green-400/60">CLASS:</span> {tx.className}</p>
                {tx.data && (
                  <p className="col-span-2">
                    <span className="text-green-400/60">DATA:</span> {tx.data}
                  </p>
                )}
                <p><span className="text-green-400/60">FROM:</span> {tx.from}</p>
                <p><span className="text-green-400/60">AGE:</span> {getAge(tx.timestamp)}</p>
                <p className="col-span-2">
                  <span className="text-green-400/60">TX:</span> {tx.hash}
                </p>
              </div>
              
              {tx.method === 'registerClass' && tx.className && (
                <button
                  onClick={() => handleRegisterRobot(tx.className)}
                  className="mt-4 px-4 py-2 bg-green-400/10 border border-green-400 rounded hover:bg-green-400/20 transition-all w-full"
                >
                  > REGISTER_NEW_ROBOT [{tx.className}]
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ContractEntriesList;