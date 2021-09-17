const ShibaToken = artifacts.require("ShibaToken");
const DaiToken = artifacts.require("DaiToken");
const YieldFarm = artifacts.require("YieldFarm");

module.exports = async function(deployer, network, accounts) {
  // Deploy Dapp token
  await deployer.deploy(ShibaToken);
  const shibaToken = await ShibaToken.deployed()

  // Deploy Dai token
  await deployer.deploy(DaiToken);
  const daiToken = await DaiToken.deployed()

  // Deploy Yield Farm
  await deployer.deploy(YieldFarm, shibaToken.address, daiToken.address);
  const yieldFarm = await YieldFarm.deployed()

  // Transfer all tokens to YieldFarm (1 million)
  await shibaToken.transfer(yieldFarm.address, '1000000000000000000000000')
  
  await daiToken.transfer(accounts[1], '1000000000000000000000000')
};
