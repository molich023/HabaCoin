// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HabaCoin Arena Game Router
 * @notice Processes P2P gaming stakes and coordinates asset burn allocations.
 */
contract HabaArena is Ownable {
    IERC20 public immutable ubuntuToken;
    address public gameOracle; 
    uint256 public burnRate = 10; // 10% of match stakes are permanently burned

    struct Game {
        address player1;
        address player2;
        uint256 stake;
        bool active;
    }

    mapping(uint256 => Game) public games;
    uint256 public nextGameId;

    event GameCreated(uint256 indexed gameId, address indexed player1, uint256 stake);
    event GameJoined(uint256 indexed gameId, address indexed player2);
    event GameResolved(uint256 indexed gameId, address indexed winner, uint256 prize, uint256 burned);

    constructor(address _tokenAddress, address _oracle) Ownable(msg.sender) {
        ubuntuToken = IERC20(_tokenAddress);
        gameOracle = _oracle;
    }

    function setGameOracle(address _newOracle) external onlyOwner {
        gameOracle = _newOracle;
    }

    function createGame(uint256 _stake) external {
        require(ubuntuToken.transferFrom(msg.sender, address(this), _stake), "HabaCoin: Escrow stake loading failed");
        
        games[nextGameId] = Game({
            player1: msg.sender,
            player2: address(0),
            stake: _stake,
            active: true
        });
        
        emit GameCreated(nextGameId, msg.sender, _stake);
        nextGameId++;
    }

    function joinGame(uint256 _gameId) external {
        Game storage game = games[_gameId];
        require(game.active && game.player2 == address(0), "HabaCoin: Targeted arena instance filled or inactive");
        require(ubuntuToken.transferFrom(msg.sender, address(this), game.stake), "HabaCoin: Stake matchmaking balance failed");

        game.player2 = msg.sender;
        emit GameJoined(_gameId, msg.sender);
    }

    function resolveGame(uint256 _gameId, address _winner) external {
        require(msg.sender == gameOracle, "HabaCoin: Restrained to authorized oracle triggers");
        Game storage game = games[_gameId];
        require(game.active, "HabaCoin: Arena instance already settled");

        uint256 totalPool = game.stake * 2;
        uint256 burnAmount = (totalPool * burnRate) / 100;
        uint256 prize = totalPool - burnAmount;

        game.active = false;
        
        // Payout winning prize pool allocations
        require(ubuntuToken.transfer(_winner, prize), "HabaCoin: Winner payout transfer failed");
        // Securely sweep the burned token allocation to the official dead block sink
        require(ubuntuToken.transfer(address(0x000000000000000000000000000000000000dEaD), burnAmount), "HabaCoin: Burn transmission failed");
        
        emit GameResolved(_gameId, _winner, prize, burnAmount);
    }
}
