import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("FairPassModule", (m) => {
  const marketplace = m.contract("FairPassMarketplace");
  const factory = m.contract("FairPassEventFactory", [
    marketplace,
  ]);

  return {
    marketplace,
    factory,
  };
});