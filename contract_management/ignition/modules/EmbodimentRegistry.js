const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("EmbodimentRegistryModule", (m) => {
  const registry = m.contract("EmbodimentRegistry");
  return { registry };
});