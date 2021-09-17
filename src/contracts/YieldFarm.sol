// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./DaiToken.sol";
import "./ShibaToken.sol";

contract YieldFarm{

    // Variables
    string public name = "Shiba Token Farm";
    ShibaToken public shibaToken;
    DaiToken public daiToken;
    address public owner;
    
    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(ShibaToken _shibaToken, DaiToken _daiToken) {
        shibaToken = _shibaToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // 1. Stakes Tokens (Deposit)
    function stakeTokens(uint _amount) public {
        require(_amount > 0, "The amount must be greater than 0");

        // Transfer DaiToken to YieldFarm contract address (this contract's address) for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // Update staking balance
        stakingBalance[msg.sender] += _amount;

        // Add user to stakers array only if the haven't staked yet
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);

            // Update staking status
            isStaking[msg.sender] = true;
            hasStaked[msg.sender] = true;
        }

    }

    // 2. Unstaking Tokens (Withdraw)
    function unstakeTokens() public {
        // Fetch staking balance
        uint balance = stakingBalance[msg.sender];

        // Require amount greater than 0
        require(balance > 0, "staking balance must be greater than 0");

        // Transfer Dai tokens back to the caller's (investor's) address
        daiToken.transfer(msg.sender, balance);

        // Reset staking balance
        stakingBalance[msg.sender] = 0;

        // Update staking status
        isStaking[msg.sender] = false;

    }

    // 3. Issuing Tokens 
    function issueTokens() public {
        require(msg.sender == owner, "The executor must be the owner");
        for (uint i = 0; i < stakers.length; i++){
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0){
                shibaToken.transfer(recipient, balance);
            }
        }

    }
}