"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import {
  EMBODIMENT_REGISTRY_ADDRESS,
  computeClassHash,
  checkClassExists,
} from "@/lib/contractConfig";
import { switchToArbitrumSepolia } from "@/lib/switchNetwork";
import { Terminal } from "lucide-react";

interface TransactionInfo {
  hash: string;
  blockNumber: number;
  from: string;
  method: "registerClass" | "registerInstance";
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

      const data = "entity instanced registered for eth global agents";
      if (!data) {
        toast.error("Robot data is required!");
        return;
      }

      const contractABI = [
        "function registerInstance(string calldata className, string calldata data) external",
      ];
      const contract = new ethers.Contract(EMBODIMENT_REGISTRY_ADDRESS, contractABI, signer);

      const toastId = toast.loading("Registering robot...");

      const tx = await contract.registerInstance(className, data, {
        gasLimit: 500000, // Optional: add gas limit if needed
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

      // ABI for decoding input data
      const contractABI = [
        "function registerClass(string memory className)",
        "function registerInstance(string memory className, string memory data)",
      ];
      const contractInterface = new ethers.utils.Interface(contractABI);

      // Get all logs for the contract
      const logs = await provider.getLogs({
        address: EMBODIMENT_REGISTRY_ADDRESS,
        fromBlock: 0,
        toBlock: "latest",
      });

      // Get unique transaction hashes
      const txHashes = Array.from(new Set(logs.map((l) => l.transactionHash)));

      // Process the last 10 transactions (most recent first)
      const recentTxHashes = txHashes.slice(-10).reverse();

      const transactionsData = await Promise.all(
        recentTxHashes.map(async (txHash) => {
          const tx = await provider.getTransaction(txHash);
          const receipt = await provider.getTransactionReceipt(txHash);
          const block = await provider.getBlock(tx.blockNumber);

          // Decode input data – only if it matches one of our methods
          let method, className, data;
          try {
            const parsed = contractInterface.parseTransaction({ data: tx.data });
            method = parsed.name;
            if (method === "registerClass") {
              className = parsed.args.className;
            } else if (method === "registerInstance") {
              className = parsed.args.className;
              data = parsed.args.data;
            }
          } catch (e) {
            return null; // Skip transactions that cannot be parsed
          }

          return {
            hash: txHash,
            blockNumber: tx.blockNumber,
            from: tx.from,
            method: method as "registerClass" | "registerInstance",
            className,
            data,
            timestamp: block.timestamp,
            value: ethers.utils.formatEther(tx.value),
            fee: ethers.utils.formatEther(
              receipt.gasUsed.mul(receipt.effectiveGasPrice)
            ),
          };
        })
      );

      setTransactions(transactionsData.filter(Boolean) as TransactionInfo[]);
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

  // Helper function to calculate transaction age
  const getAge = (timestamp: number) => {
    const ageSeconds = Math.floor(Date.now() / 1000) - timestamp;
    if (ageSeconds < 60) return `${ageSeconds} sec ago`;
    if (ageSeconds < 3600) return `${Math.floor(ageSeconds / 60)} min ago`;
    if (ageSeconds < 86400) return `${Math.floor(ageSeconds / 3600)} hrs ago`;
    return `${Math.floor(ageSeconds / 86400)} days ago`;
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center animate-pulse">
        > ACCESSING BLOCKCHAIN DATA...
      </div>
    );
  }

  // Group transactions by class name so that instances appear under their class
  const groupedTransactions = transactions.reduce((acc, tx) => {
    if (!tx.className) return acc;
    if (!acc[tx.className]) {
      acc[tx.className] = { class: null, instances: [] };
    }
    if (tx.method === "registerClass") {
      acc[tx.className].class = tx;
    } else if (tx.method === "registerInstance") {
      acc[tx.className].instances.push(tx);
    }
    return acc;
  }, {} as Record<string, { class: TransactionInfo | null; instances: TransactionInfo[] }>);

  const groups = Object.entries(groupedTransactions);

  return (
    <div className="p-4">
      <h3 className="mb-4 text-lg font-bold flex items-center gap-2">
        <Terminal className="inline" /> REGISTERED EMBODIMENTS
      </h3>

      {groups.length === 0 ? (
        <p className="text-green-400/60">NO REGISTRATIONS FOUND IN DATABASE</p>
      ) : (
        <ul className="space-y-4">
          {groups.map(([className, group]) => (
            <li
              key={className}
              className="border border-green-400/30 rounded-lg p-4 hover:bg-green-400/5"
            >
              {/* Display the class registration details if available */}
              {group.class ? (
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <p>
                    <span className="text-green-400/60">METHOD:</span>{" "}
                    {group.class.method}
                  </p>
                  <p>
                    <span className="text-green-400/60">CLASS:</span>{" "}
                    {group.class.className}
                  </p>
                  <p>
                    <span className="text-green-400/60">FROM:</span>{" "}
                    {group.class.from}
                  </p>
                  <p>
                    <span className="text-green-400/60">AGE:</span>{" "}
                    {getAge(group.class.timestamp)}
                  </p>
                  <p className="col-span-2">
                    <span className="text-green-400/60">TX:</span>{" "}
                    {group.class.hash}
                  </p>
                </div>
              ) : (
                <div className="mb-2">
                  <p className="text-sm font-bold">
                    <span className="text-green-400/60">CLASS:</span> {className}
                  </p>
                </div>
              )}

              {/* Button to register a new robot instance under this class */}
              <button
                onClick={() => handleRegisterRobot(className)}
                className="mt-2 px-4 py-2 bg-green-400/10 border border-green-400 rounded hover:bg-green-400/20 transition-all w-full"
              >
                &gt; REGISTER_NEW_ROBOT [{className}]
              </button>

              {/* Display any instance transactions for this class */}
              {group.instances.length > 0 && (
                <div className="mt-4 space-y-2">
                  {group.instances.map((instanceTx) => (
                    <div
                      key={instanceTx.hash}
                      className="border border-green-400/30 rounded-lg p-2 text-sm"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <p>
                          <span className="text-green-400/60">METHOD:</span>{" "}
                          {instanceTx.method}
                        </p>
                        <p>
                          <span className="text-green-400/60">CLASS:</span>{" "}
                          {instanceTx.className}
                        </p>
                        {instanceTx.data && (
                          <p className="col-span-2">
                            <span className="text-green-400/60">DATA:</span>{" "}
                            {instanceTx.data}
                          </p>
                        )}
                        <p>
                          <span className="text-green-400/60">FROM:</span>{" "}
                          {instanceTx.from}
                        </p>
                        <p>
                          <span className="text-green-400/60">AGE:</span>{" "}
                          {getAge(instanceTx.timestamp)}
                        </p>
                        <p className="col-span-2">
                          <span className="text-green-400/60">TX:</span>{" "}
                          {instanceTx.hash}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ContractEntriesList;
