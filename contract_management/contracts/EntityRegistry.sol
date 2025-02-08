// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IEmbodimentRegistry {
    function classOwners(bytes32 classHash) external view returns (address);
    function computeClassHash(string calldata className) external pure returns (bytes32); // Optional helper
}

contract EntityRegistry {
    IEmbodimentRegistry public immutable embodimentRegistry;

    struct Entity {
        address owner;
        bytes32 classHash;
        string data;
    }

    mapping(uint256 => Entity) public entities;
    uint256 public nextEntityId;

    event EntityRegistered(uint256 indexed entityId, bytes32 indexed classHash, address owner, string data);

    constructor(address registryAddress) {
        embodimentRegistry = IEmbodimentRegistry(registryAddress);
    }

    function registerEntity(bytes32 classHash, string calldata data) external {
        require(
            embodimentRegistry.classOwners(classHash) != address(0),
            "Class does not exist"
        );
        entities[nextEntityId] = Entity(msg.sender, classHash, data);
        emit EntityRegistered(nextEntityId, classHash, msg.sender, data);
        nextEntityId++;
    }

    // Optional: Allow registration using class name
    function registerEntityWithClassName(string calldata className, string calldata data) external {
        bytes32 classHash = embodimentRegistry.computeClassHash(className);
        require(
            embodimentRegistry.classOwners(classHash) != address(0),
            "Class does not exist"
        );
        entities[nextEntityId] = Entity(msg.sender, classHash, data);
        emit EntityRegistered(nextEntityId, classHash, msg.sender, data);
        nextEntityId++;
    }
}