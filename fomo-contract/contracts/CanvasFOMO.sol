// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CanvasFOMO {
    uint256 public constant GRID_SIZE = 16;
    uint256 public constant PRICE = 0.001 ether;

    address[256] public painters;
    uint24[256] public pixelColors;
    uint40[256] public timestamps;

    address public currentLeader;
    uint256 public prizePool;
    uint256 public totalPaints;
    uint256 public gameStartTime;

    event PixelPainted(uint16 indexed index, address indexed painter, uint24 color, uint256 timestamp);
    event Withdrawn(address indexed winner, uint256 amount);

    modifier validPixel(uint256 x, uint256 y) {
        require(x < GRID_SIZE && y < GRID_SIZE, "out of bounds");
        _;
    }

    constructor() {
        gameStartTime = block.timestamp;
    }

    function paint(uint256 x, uint256 y, uint24 color) external payable validPixel(x, y) {
        require(msg.value == PRICE, "send 0.001 ETH");
        require(color <= 0xFFFFFF, "invalid color");

        uint16 i = uint16(y * GRID_SIZE + x);
        painters[i] = msg.sender;
        pixelColors[i] = color;
        timestamps[i] = uint40(block.timestamp);
        prizePool += msg.value;
        currentLeader = msg.sender;
        totalPaints++;

        emit PixelPainted(i, msg.sender, color, block.timestamp);
    }

    function withdraw() external {
        require(msg.sender == currentLeader, "not leader");
        require(prizePool > 0, "empty pool");

        uint256 amount = prizePool;
        prizePool = 0;
        currentLeader = address(0);

        (bool ok,) = payable(msg.sender).call{value: amount}("");
        require(ok, "transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    function getCanvasState() external view returns (
        address[256] memory,
        uint24[256] memory,
        uint40[256] memory,
        address,
        uint256,
        uint256
    ) {
        return (painters, pixelColors, timestamps, currentLeader, prizePool, totalPaints);
    }

    function getPixel(uint256 x, uint256 y) external view validPixel(x, y) returns (
        address painter, uint24 color, uint256 timestamp
    ) {
        uint16 i = uint16(y * GRID_SIZE + x);
        return (painters[i], pixelColors[i], timestamps[i]);
    }
}
