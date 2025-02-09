"use client";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { ContractEntriesList } from "@/components/ContractEntriesList";
import toast from "react-hot-toast";
import { EMBODIMENT_REGISTRY_ADDRESS } from "@/lib/contractConfig";
import { switchToArbitrumSepolia } from "@/lib/switchNetwork";
import React, { useState, useEffect } from 'react';
import { Terminal, Bot, Cpu, Share2, Database, Upload } from 'lucide-react';

// Main page component
export default function Home() {
  const [activeSection, setActiveSection] = useState('registry');
  
  return (
    <main className="min-h-screen bg-black text-green-400 p-4 font-mono">
      <div className="max-w-6xl mx-auto">
        <Header />
        <TerminalNav activeSection={activeSection} setActiveSection={setActiveSection} />
        <div className="border border-green-500/30 rounded-lg p-6 mt-4 bg-black/50 backdrop-blur">
          {activeSection === 'registry' ? <RegistrySection /> : <InfoSection />}
        </div>
      </div>
    </main>
  );
}

const Header = () => (
  <div className="text-center mb-8 mt-4">
    <h1 className="text-4xl font-bold mb-4 animate-pulse">
      <Terminal className="inline mr-2 mb-1" /> ROBOT EMBODIMENT REGISTRY v1.0
    </h1>
    <p className="text-green-400/80">
      > SECURE DECENTRALIZED ROBOT IDENTITY AND CAPABILITY VERIFICATION SYSTEM_
    </p>
  </div>
);

const TerminalNav = ({ activeSection, setActiveSection }) => (
  <div className="flex gap-4 mb-4">
    <button
      onClick={() => setActiveSection('registry')}
      className={`px-4 py-2 border ${
        activeSection === 'registry' ? 'border-green-400 bg-green-400/10' : 'border-green-400/30'
      } rounded hover:bg-green-400/20 transition-all`}
    >
      > REGISTRY_ACCESS
    </button>
    <button
      onClick={() => setActiveSection('info')}
      className={`px-4 py-2 border ${
        activeSection === 'info' ? 'border-green-400 bg-green-400/10' : 'border-green-400/30'
      } rounded hover:bg-green-400/20 transition-all`}
    >
      > SYSTEM_INFO
    </button>
  </div>
);

const InfoSection = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
      <Database className="inline" /> SYSTEM CAPABILITIES
    </h2>
    
    <div className="grid md:grid-cols-2 gap-6">
      {[
        {
          icon: <Bot />,
          title: "Register Embodiments",
          desc: "Create and verify unique robot identities on the blockchain"
        },
        {
          icon: <Cpu />,
          title: "Train & Simulate",
          desc: "Test and validate robot capabilities in secure simulation environments"
        },
        {
          icon: <Share2 />,
          title: "Share Actions",
          desc: "Distribute and verify new robot behaviors across the network"
        },
        {
          icon: <Bot />,
          title: "Expand Functionality",
          desc: "Add and certify new hardware components and capabilities"
        }
      ].map((feature, i) => (
        <div key={i} className="border border-green-400/30 rounded-lg p-4 hover:bg-green-400/5 transition-all">
          <div className="flex items-center gap-2 mb-2">
            {feature.icon}
            <h3 className="text-lg font-bold">{feature.title}</h3>
          </div>
          <p className="text-green-400/80">{feature.desc}</p>
        </div>
      ))}
    </div>
    
    <div className="mt-8 p-4 border border-green-400/30 rounded-lg">
      <p className="text-sm text-green-400/70">
        > NOTICE: This is a prototype system. All robot registrations are currently on Arbitrum Sepolia testnet.
        Ensure your wallet is configured correctly before proceeding with registration.
      </p>
    </div>
  </div>
);

const RegistrySection = () => {
  const router = useRouter();
  
  const handleCreateClass = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error("ERROR: MetaMask not detected. Install MetaMask to proceed.");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = await switchToArbitrumSepolia();
      const signer = provider.getSigner();

      const contractABI = ["function registerClass(string memory className) external"];
      const contract = new ethers.Contract(EMBODIMENT_REGISTRY_ADDRESS, contractABI, signer);

      const className = prompt("> ENTER NEW EMBODIMENT CLASS DESIGNATION:");
      if (!className) {
        toast.error("ERROR: Class designation required!");
        return;
      }

      toast.loading("> INITIALIZING REGISTRATION SEQUENCE...");
      const tx = await contract.registerClass(className);
      
      toast.loading(`> TRANSACTION INITIATED: ${tx.hash}\n> AWAITING CONFIRMATION...`);
      await tx.wait();
      
      toast.success("> REGISTRATION SUCCESSFUL");
      router.refresh();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("ERROR: Registration failed. Check console logs.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="inline" /> EMBODIMENT REGISTRY
        </h2>
        <button
          onClick={handleCreateClass}
          className="px-4 py-2 bg-green-400/10 border border-green-400 rounded hover:bg-green-400/20 transition-all"
        >
          > NEW_REGISTRATION
        </button>
      </div>
      
      <div className="border border-green-400/30 rounded-lg">
        <ContractEntriesList />
      </div>
    </div>
  );
};