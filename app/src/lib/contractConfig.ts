import { ethers } from "ethers";

export const EMBODIMENT_REGISTRY_ADDRESS = "0x1fA2012F8E2C5bAE8B2588256A48Ef2BB0D002B9"; // Address where the Embodiment Class Smart Contract is deployed
export const ENTITY_REGISTRY_ADDRESS = "0x4355dD362062300659b9055762C501AF8034070C"; // Address where the Entity Smart Contract is deployed

export const EMBODIMENT_REGISTRY_ABI = [
  "function registerClass(string memory className)",
  "function classOwners(bytes32 classHash) external view returns (address)"
];

export const ENTITY_REGISTRY_ABI = [
  "function registerEntity(bytes32 classHash, string calldata data) external"
];

export function computeClassHash(className: string): string {
  //return ethers.utils.id(className);
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(className));
}

export const checkClassExists = async (className: string, provider: ethers.providers.Provider) => {
  const classHash = computeClassHash(className);
  const contract = new ethers.Contract(
    EMBODIMENT_REGISTRY_ADDRESS,
    ["function classOwners(bytes32) view returns (address)"],
    provider
  );
  return (await contract.classOwners(classHash)) !== ethers.constants.AddressZero;
};