// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HabaArena is Ownable {
    IERC20 public habaCoin;
    address public gameOracle; // Your Netlify Function that verifies the Chess winner
    uint256 public burnRate = 10; // 10% of the bet is burned to increase HABA value

    struct Game {
        address player1;
        address player2;
        uint256 stake;
        bool active;
    }

    mapping(uint256 => Game) public games;
    uint256 public nextGameId;

    constructor(address _habaAddress, address _oracle) Ownable(msg.sender) {
        habaCoin = IERC20(_habaAddress);
        gameOracle = _oracle;
    }

    // 1. Player 1 creates a game and stakes HABA
    function createGame(uint256 _stake) external {
        require(habaCoin.transferFrom(msg.sender, address(this), _stake), "Stake failed");
        
        games[nextGameId] = Game({
            player1: msg.sender,
            player2: address(0),
            stake: _stake,
            active: true
        });
        nextGameId++;
    }

    // 2. Player 2 joins and matches the stake
    function joinGame(uint256 _gameId) external {
        Game storage game = games[_gameId];
        require(game.active && game.player2 == address(0), "Game unavailable");
        require(habaCoin.transferFrom(msg.sender, address(this), game.stake), "Match stake failed");

        game.player2 = msg.sender;
    }

    // 3. Oracle reports the winner (e.g., Chess Checkmate)
    function resolveGame(uint256 _gameId, address _winner) external {
        require(msg.sender == gameOracle, "Only Oracle can resolve");
        Game storage game = games[_gameId];
        require(game.active, "Game already resolved");

        uint256 totalPool = game.stake * 2;
        uint256 burnAmount = (totalPool * burnRate) / 100;
        uint256 prize = totalPool - burnAmount;

        game.active = false;
        
        // Payout to winner and burn the rest
        require(habaCoin.transfer(_winner, prize), "Payout failed");
        // Sending burnAmount to a dead address (0x0)
        require(habaCoin.transfer(address(0), burnAmount), "Burn failed");
    }
}
