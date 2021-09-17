const { assert } = require('chai')

const DaiToken = artifacts.require('DaiToken')
const ShibaToken = artifacts.require('ShibaToken')
const YieldFarm = artifacts.require('YieldFarm')

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n){
    return web3.utils.toWei(n, 'ether');
}

contract('YieldFarm', ([owner, investor]) => {
    // Write tests here...
    let daiToken, shibaToken, yieldFarm

    beforeEach(async () => {
     // Load Contracts
    daiToken = await DaiToken.new()
    shibaToken = await ShibaToken.new()
    yieldFarm = await YieldFarm.new(shibaToken.address, daiToken.address)
 
     // Transfer all ShibaToken tokens to farm (1 million)
     await shibaToken.transfer(yieldFarm.address, tokens('1000000'), { from: owner })
 
     // Send tokens to investor
     await daiToken.transfer(investor, tokens('100'), { from: owner })
   })

    describe('Mock DAI deployment', async () =>{
        it('DAI token has a name', async () => {
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('Shiba Token deployment', async () =>{
        it('Shiba Token has a name', async () => {
            const name = await shibaToken.name()
            assert.equal(name, 'Shiba Token')
        })
    })

    describe('YieldFarm deployment', async () =>{
        it('YieldFarm has a name', async () => {
            const name = await yieldFarm.name()
            assert.equal(name, 'Shiba Token Farm')
        })

        it('contract has tokens', async () => {
            let balance = await shibaToken.balanceOf(yieldFarm.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('Staking tokens', async () => {
        it('rewards investors for staking Shiba tokens', async () => {
            // Check investor balance before staking
            let balance = await daiToken.balanceOf(investor)
            assert.equal(balance.toString(), tokens('100'), 'Correct investor wallet\'s DAI token balance before staking')

            // Stake Mock DAI Tokens
            await daiToken.approve(yieldFarm.address, tokens('100'), { from: investor })
            await yieldFarm.stakeTokens(tokens('100'), { from: investor })

            // Check staking result
            balance = await daiToken.balanceOf(investor)
            assert.equal(balance.toString(), tokens('0'), 'Correct investor wallet\'s DAI token balance before staking')

            balance = await daiToken.balanceOf(yieldFarm.address)
            assert.equal(balance.toString(), tokens('100'), 'Correct YieldFarm wallet\'s DAI token balance before staking')

            balance = await yieldFarm.stakingBalance(investor)
            assert.equal(balance.toString(), tokens('100'), 'Current investor staking balance error')

            let result = await yieldFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'Current investor staking isStaking status error')

            // Issue Tokens
            await yieldFarm.issueTokens({from: owner})


            // Check balances after issuance
            balance = await shibaToken.balanceOf(investor);
            assert.equal(balance.toString(), tokens('100'), 'Current investor Shiba tokens balance error')

            // ensure that only owner can issue tokens
            await yieldFarm.issueTokens({from: investor}).should.be.rejected;

            // Unstake tokens
            await yieldFarm.unstakeTokens({from: investor})

            // Check results after unstaking
            balance = await daiToken.balanceOf(investor)
            assert.equal(balance.toString(), tokens('100'), 'Current investor DAI token after unstaking balance error')

            balance = await daiToken.balanceOf(yieldFarm.address)
            assert.equal(balance.toString(), tokens('0'), 'Current yieldFarm DAI token after unstaking balance  error')

            balance = await yieldFarm.stakingBalance(investor)
            assert.equal(balance.toString(), tokens('0'), 'Current investor after unstaking balance error')

            result = await yieldFarm.isStaking(investor)
            assert.equal(result.toString(), 'false', 'Current investor unstaking isStaking status error')
        })
    })

})
