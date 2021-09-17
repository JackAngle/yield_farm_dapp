const YieldFarm = artifacts.require('YieldFarm');

module.exports = async function(callback) {
    let yieldFarm = await YieldFarm.deployed()
    await yieldFarm.issueTokens()
    //
    console.log("Tokens issued!!!!!!")

    callback()
  };