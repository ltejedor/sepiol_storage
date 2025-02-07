const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("EntityRegistryModule", (m) => {
    // Hard-coded registry address
    const registryAddress = "0xa090431c3D10D9b7d374Fd5B8dE7Bb0687DDBD52";
    
    // Deploy EntityRegistry with constructor argument
    const entityRegistry = m.contract("EntityRegistry", [registryAddress]);
    
    return { entityRegistry };
});