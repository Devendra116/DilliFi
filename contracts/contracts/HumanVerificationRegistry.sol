// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { SelfVerificationRoot } from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import { ISelfVerificationRoot } from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HumanVerificationRegistry
 * @notice A simple and efficient registry to verify if addresses are verified as human using Self Protocol
 * @dev This contract serves as a registry to check human verification status of addresses
 */
contract HumanVerificationRegistry is SelfVerificationRoot, Ownable {
    // Storage for human verification status
    mapping(address => bool) public isVerifiedHuman;
    mapping(address => uint256) public verificationTime;
    mapping(address => bytes32) public verificationId;
    
    // Track statistics
    uint256 public totalVerifiedHumans;
    address[] public verifiedAddresses;
    
    // Storage for verification config ID
    bytes32 public verificationConfigId;
    
    // Events
    event HumanVerified(address indexed human, uint256 timestamp, bytes32 verificationId);

    /**
     * @notice Constructor for the HumanVerificationRegistry contract
     * @param identityVerificationHubV2Address The address of the Identity Verification Hub V2
     * @param scope The scope for verification
     * @param _verificationConfigId The verification configuration ID
     * @param _admin The admin/owner of the contract
     */
    constructor(
        address identityVerificationHubV2Address,
        uint256 scope,
        bytes32 _verificationConfigId,
        address _admin
    )
        SelfVerificationRoot(identityVerificationHubV2Address, scope)
        Ownable(_admin)
    {
        verificationConfigId = _verificationConfigId;
    }

    /**
     * @notice Implementation of customVerificationHook for human verification
     * @dev Called after successful verification, registers the address as verified human
     * @param output The verification output from the hub
     * @param userData The user data passed through verification
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    )
        internal
        override
    {
        address humanAddress = address(uint160(output.userIdentifier));
        
        // Only register if not already verified
        if (!isVerifiedHuman[humanAddress]) {
            isVerifiedHuman[humanAddress] = true;
            verificationTime[humanAddress] = block.timestamp;
            verificationId[humanAddress] = keccak256(abi.encodePacked(output.nullifier, block.timestamp, humanAddress));
            verifiedAddresses.push(humanAddress);
            totalVerifiedHumans++;
            
            emit HumanVerified(humanAddress, block.timestamp, verificationId[humanAddress]);
        }
    }

    /**
     * @notice Check if an address is verified as human
     * @param human The address to check
     * @return True if the address is verified as human
     */
    function isHuman(address human) external view returns (bool) {
        return isVerifiedHuman[human];
    }

    /**
     * @notice Get verification details for an address
     * @param human The address to check
     * @return verified True if verified as human
     * @return timestamp When the address was verified
     * @return id The verification ID
     */
    function getVerificationDetails(address human) external view returns (bool verified, uint256 timestamp, bytes32 id) {
        return (isVerifiedHuman[human], verificationTime[human], verificationId[human]);
    }

    /**
     * @notice Get all verified addresses (use with caution for large datasets)
     * @return Array of all verified human addresses
     */
    function getAllVerifiedAddresses() external view returns (address[] memory) {
        return verifiedAddresses;
    }

    /**
     * @notice Get total number of verified humans
     * @return The total count of verified humans
     */
    function getTotalHumans() external view returns (uint256) {
        return totalVerifiedHumans;
    }

    /**
     * @notice Get verification count for a specific time range
     * @param startTime Start timestamp
     * @param endTime End timestamp
     * @return count Number of verifications in the time range
     */
    function getVerificationsInRange(uint256 startTime, uint256 endTime) external view returns (uint256 count) {
        count = 0;
        for (uint256 i = 0; i < verifiedAddresses.length; i++) {
            uint256 verifyTime = verificationTime[verifiedAddresses[i]];
            if (verifyTime >= startTime && verifyTime <= endTime) {
                count++;
            }
        }
    }

    /**
     * @notice Expose the internal _setScope function for configuration (owner only)
     * @param newScope The new scope value to set
     */
    function setScope(uint256 newScope) external onlyOwner {
        _setScope(newScope);
    }

    /**
     * @notice Set verification configuration ID (owner only)
     * @param configId New verification configuration ID
     */
    function setConfigId(bytes32 configId) external onlyOwner {
        verificationConfigId = configId;
    }

    /**
     * @notice Get verification configuration ID
     * @param _destinationChainId Destination chain ID (unused)
     * @param _userIdentifier User identifier (unused)
     * @param _userDefinedData User defined data (unused)
     * @return The verification configuration ID
     */
    function getConfigId(
        bytes32 _destinationChainId,  
        bytes32 _userIdentifier,  
        bytes memory _userDefinedData  
    )
        public
        view
        override
        returns (bytes32)
    {
        return verificationConfigId;
    }
}
