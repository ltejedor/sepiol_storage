// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EmbodimentRegistry {
    struct Embodiment {
        address owner;
        bytes32 classHash;
        string data;
    }

    mapping(bytes32 => address) public classOwners;
    mapping(uint256 => Embodiment) public embodiments;
    uint256 public nextId;

    event ClassRegistered(bytes32 indexed classHash, address owner);
    event InstanceRegistered(uint256 id, bytes32 indexed classHash, address owner, string data);

    function registerClass(bytes32 classHash) external {
        require(classOwners[classHash] == address(0), "Class exists");
        classOwners[classHash] = msg.sender;
        emit ClassRegistered(classHash, msg.sender);
    }

    function registerInstance(bytes32 classHash, string calldata data) external {
        require(classOwners[classHash] != address(0), "Class not found");
        embodiments[nextId] = Embodiment(msg.sender, classHash, data);
        emit InstanceRegistered(nextId, classHash, msg.sender, data);
        nextId++;
    }
}