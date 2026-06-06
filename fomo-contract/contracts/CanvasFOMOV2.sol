// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CanvasFOMOV2 {
    uint256 public constant GRID_SIZE = 16;

    // Color tiers: common=0.001, rare=0.003, epic=0.005, legendary=0.01 ETH
    uint256 public constant PRICE_COMMON   = 0.001 ether;
    uint256 public constant PRICE_RARE     = 0.003 ether;
    uint256 public constant PRICE_EPIC     = 0.005 ether;
    uint256 public constant PRICE_LEGENDARY = 0.01 ether;

    // Color tier threshold — uint24 color value determines its tier
    // Colors are grouped by hue/value ranges to determine price on-chain
    // For simplicity, we store a mapping from color to price
    mapping(uint24 => uint256) public colorPrices;

    address[256] public painters;
    uint24[256] public pixelColors;
    uint40[256] public timestamps;

    address public currentLeader;
    uint256 public prizePool;
    uint256 public totalPaints;
    uint256 public gameStartTime;

    event PixelPainted(uint16 indexed index, address indexed painter, uint24 color, uint256 price, uint256 timestamp);
    event Withdrawn(address indexed winner, uint256 amount);

    modifier validPixel(uint256 x, uint256 y) {
        require(x < GRID_SIZE && y < GRID_SIZE, "out of bounds");
        _;
    }

    constructor() {
        gameStartTime = block.timestamp;
        _initColorPrices();
    }

    function _initColorPrices() private {
        // Colors with high brightness / special hues are more expensive
        // Rule: if R > 200 && G > 200 && B < 100 → gold/legendary
        //        if G > 200 && B > 200 → cyan/epic
        //        if R > 200 && B > 200 → purple/epic
        //        else → common or rare based on brightness
        //
        // Frontend passes the color price, contract verifies it matches.
        // This way we don't need to hardcode all 16M colors.
    }

    /// @notice Get the price for a given color (deterministic)
    function getColorPrice(uint24 color) public pure returns (uint256) {
        uint8 r = uint8(color >> 16);
        uint8 g = uint8(color >> 8);
        uint8 b = uint8(color);

        // Legendary: gold (#ffd900) or white (#ffffff)
        if ((r >= 240 && g >= 200 && b < 80) || (r >= 240 && g >= 240 && b >= 240)) {
            return PRICE_LEGENDARY;
        }
        // Epic: bright pink, cyan, royal blue
        if ((r >= 240 && b >= 200 && g < 100) || (g >= 200 && b >= 200 && r < 100) || (r >= 200 && g >= 150 && b >= 200)) {
            return PRICE_EPIC;
        }
        // Rare: vibrant red, yellow, purple, bright blue
        if (r >= 200 || g >= 200 || (r >= 150 && b >= 150)) {
            return PRICE_RARE;
        }
        // Common: everything else
        return PRICE_COMMON;
    }

    function paint(uint256 x, uint256 y, uint24 color) external payable validPixel(x, y) {
        uint256 expectedPrice = getColorPrice(color);
        require(msg.value == expectedPrice, "incorrect payment for color tier");

        uint16 i = uint16(y * GRID_SIZE + x);
        painters[i] = msg.sender;
        pixelColors[i] = color;
        timestamps[i] = uint40(block.timestamp);
        prizePool += msg.value;
        currentLeader = msg.sender;
        totalPaints++;

        emit PixelPainted(i, msg.sender, color, msg.value, block.timestamp);
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
        address[256] memory, uint24[256] memory, uint40[256] memory,
        address, uint256, uint256
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
