/**
 * TIP-20 Token Standard ABI
 * Complete interface for Tempo stablecoins
 */

export const TIP20_ABI = [
    // ==================== ERC-20 Standard ====================
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address account) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function transferFrom(address from, address to, uint256 amount) returns (bool)',

    // ==================== TIP-20 Extensions ====================
    // Memo transfers - attach 32-byte reference to payments
    'function transferWithMemo(address to, uint256 amount, bytes32 memo)',
    'function transferFromWithMemo(address from, address to, uint256 amount, bytes32 memo) returns (bool)',

    // Minting/Burning (requires ISSUER_ROLE)
    'function mint(address to, uint256 amount)',
    'function burn(uint256 amount)',
    'function mintWithMemo(address to, uint256 amount, bytes32 memo)',
    'function burnWithMemo(uint256 amount, bytes32 memo)',
    'function burnBlocked(address from, uint256 amount)',

    // ==================== Metadata ====================
    'function quoteToken() view returns (address)',
    'function nextQuoteToken() view returns (address)',
    'function currency() view returns (string)',
    'function paused() view returns (bool)',
    'function supplyCap() view returns (uint256)',
    'function transferPolicyId() view returns (uint64)',

    // ==================== Admin Functions ====================
    'function pause()',
    'function unpause()',
    'function changeTransferPolicyId(uint64 newPolicyId)',
    'function setSupplyCap(uint256 newSupplyCap)',

    // ==================== Role Management ====================
    'function ISSUER_ROLE() view returns (bytes32)',
    'function PAUSE_ROLE() view returns (bytes32)',
    'function UNPAUSE_ROLE() view returns (bytes32)',
    'function BURN_BLOCKED_ROLE() view returns (bytes32)',
    'function grantRole(bytes32 role, address account)',
    'function revokeRole(bytes32 role, address account)',
    'function hasRole(bytes32 role, address account) view returns (bool)',

    // ==================== Rewards Distribution ====================
    'function distributeReward(uint256 amount)',
    'function setRewardRecipient(address newRewardRecipient)',
    'function claimRewards() returns (uint256)',
    'function globalRewardPerToken() view returns (uint256)',
    'function optedInSupply() view returns (uint128)',
    'function userRewardInfo(address user) view returns (address rewardRecipient, uint256 rewardPerToken, uint256 rewardBalance)',

    // ==================== Events ====================
    'event Transfer(address indexed from, address indexed to, uint256 amount)',
    'event Approval(address indexed owner, address indexed spender, uint256 amount)',
    'event TransferWithMemo(address indexed from, address indexed to, uint256 amount, bytes32 indexed memo)',
    'event Mint(address indexed to, uint256 amount)',
    'event Burn(address indexed from, uint256 amount)',
    'event PauseStateUpdate(address indexed updater, bool isPaused)',
    'event SupplyCapUpdate(address indexed updater, uint256 indexed newSupplyCap)',
    'event TransferPolicyUpdate(address indexed updater, uint64 indexed newPolicyId)',
    'event RewardRecipientSet(address indexed holder, address indexed recipient)',
    'event RewardDistributed(address indexed funder, uint256 amount)',
];

/**
 * Fee Manager ABI
 * Handles fee token preferences per account
 */
export const FEE_MANAGER_ABI = [
    'function getUserToken(address account) view returns (address)',
    'function setUserToken(address token)',
    'event UserTokenUpdated(address indexed account, address indexed token)',
];

/**
 * TIP20 Factory ABI
 * Deploy new TIP-20 tokens
 */
export const TIP20_FACTORY_ABI = [
    'function createToken(string name, string symbol, string currency, address quoteToken, address admin, bytes32 salt) returns (address token)',
    'function isTIP20(address token) view returns (bool)',
    'function getTokenAddress(address sender, bytes32 salt) view returns (address token)',
    'event TokenCreated(address indexed token, string name, string symbol, string currency, address quoteToken, address admin, bytes32 salt)',
];

/**
 * TIP-403 Policy Registry ABI
 * Manage whitelist/blacklist policies
 */
export const POLICY_REGISTRY_ABI = [
    'function createPolicy(address admin, uint8 policyType) returns (uint64 newPolicyId)',
    'function modifyPolicyWhitelist(uint64 policyId, address account, bool allowed)',
    'function modifyPolicyBlacklist(uint64 policyId, address account, bool restricted)',
    'function isAuthorized(uint64 policyId, address user) view returns (bool)',
    'function policyExists(uint64 policyId) view returns (bool)',
    'function policyData(uint64 policyId) view returns (uint8 policyType, address admin)',
];

/**
 * Stablecoin DEX ABI (subset for swaps)
 */
export const DEX_ABI = [
    'function swapExactAmountIn(address tokenIn, address tokenOut, uint128 amountIn, uint128 minAmountOut) returns (uint128 amountOut)',
    'function swapExactAmountOut(address tokenIn, address tokenOut, uint128 amountOut, uint128 maxAmountIn) returns (uint128 amountIn)',
    'function quoteSwapExactAmountIn(address tokenIn, address tokenOut, uint128 amountIn) view returns (uint128 amountOut)',
    'function quoteSwapExactAmountOut(address tokenIn, address tokenOut, uint128 amountOut) view returns (uint128 amountIn)',
    'function balanceOf(address user, address token) view returns (uint128)',
    'function withdraw(address token, uint128 amount)',
];
