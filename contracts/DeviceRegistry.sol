// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DeviceRegistry {
    struct Device {
        address owner;
        uint256 credit;
        uint256 consumptionRate; 
        bool isRegistered;
    }

    mapping(string => Device) public devices;

    event DeviceRegistered(string deviceId, address owner, uint256 consumptionRate);
    event ResourcesAllocated(string deviceId, uint256 amount);

    function registerDevice(string memory deviceId, uint256 consumptionRate) public {
        require(!devices[deviceId].isRegistered, "Device already registered.");
        
        devices[deviceId] = Device({
            owner: msg.sender,
            credit: 100,
            consumptionRate: consumptionRate, 
            isRegistered: true
        });
        
        emit DeviceRegistered(deviceId, msg.sender, consumptionRate);
    }

    function allocateResources(string memory deviceId) public {
        require(devices[deviceId].isRegistered, "Device not registered.");
        require(devices[deviceId].owner == msg.sender, "Only the device owner can allocate resources.");

        uint256 cost = devices[deviceId].consumptionRate;
        require(devices[deviceId].credit >= cost, "Insufficient credit.");
        
        devices[deviceId].credit -= cost;
        
        emit ResourcesAllocated(deviceId, cost);
    }

    function getCredit(string memory deviceId) public view returns (uint256) {
        require(devices[deviceId].isRegistered, "Device not registered.");
        return devices[deviceId].credit;
    }

    function isDeviceRegistered(string memory deviceId) public view returns (bool) {
        return devices[deviceId].isRegistered;
    }

    function getConsumptionRate(string memory deviceId) public view returns (uint256) {
        require(devices[deviceId].isRegistered, "Device not registered.");
        return devices[deviceId].consumptionRate;
    }
}
