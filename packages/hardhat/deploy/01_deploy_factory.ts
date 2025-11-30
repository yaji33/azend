import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("EventFactory", {
    from: deployer,
    args: [],
    log: true,
  });

   console.log("✅ EventFactory deployed successfully!");
   console.log("📝 Note: The factory will deploy AzendEvent contracts with enhanced metadata");
};

export default func;
func.tags = ["EventFactory"];
