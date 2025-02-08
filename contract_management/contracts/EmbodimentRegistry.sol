// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EmbodimentRegistry {
    struct Embodiment {
        address owner;
        bytes32 classHash;
        string data;
    }

    // Add mapping to store human-readable class names
    mapping(bytes32 => string) public classNameRegistry;
    mapping(bytes32 => address) public classOwners;
    mapping(uint256 => Embodiment) public embodiments;
    uint256 public nextId;

    // Include class name string in events
    event ClassRegistered(bytes32 indexed classHash, address owner, string className);
    event InstanceRegistered(uint256 indexed id, bytes32 indexed classHash, address owner, string data, string className);

    function registerClass(string calldata className) external {
        // Convert string to bytes32 and store both
        bytes32 classHash = bytes32(bytes(className));
        require(classOwners[classHash] == address(0), "Class exists");
        
        classOwners[classHash] = msg.sender;
        classNameRegistry[classHash] = className;
        emit ClassRegistered(classHash, msg.sender, className);
    }

    function registerInstance(string calldata className, string calldata data) external {
        bytes32 classHash = bytes32(bytes(className));
        require(classOwners[classHash] != address(0), "Class not found");
        
        embodiments[nextId] = Embodiment(msg.sender, classHash, data);
        emit InstanceRegistered(nextId, classHash, msg.sender, data, className);
        nextId++;
    }
}