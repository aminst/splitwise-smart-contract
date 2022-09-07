// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title BlockchainSplitwise
 * @dev keep a ledger of people and their debts
 */
contract BlockchainSplitwise {

    struct MapIndex{
        uint32 amount;
        bool exists;
    }
    struct Person {
        address addr;
        mapping(address => MapIndex) owes;
        mapping(address => uint256) time;
        address[] creditors;
        uint32 count_creditors;
    }
    struct MapIndexUsers {
        Person person;
        bool exists;
    }

    mapping(address => MapIndexUsers) private users;
    mapping(address => uint256) private last_active;
    address[] private all_users;
    uint32 private count_users;
    
    function creditors_contains(address creditor, address[] memory creditors) private pure returns (bool) {
        for (uint32 i = 0; i < creditors.length; i++) {
            if (creditors[i] == creditor) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev make an edge or potentioaly a new node in the graph
     * @param creditor address and the amount
     */
    function add_IOU(address creditor, uint32 amount) public {
        add_user(msg.sender);
        add_user(creditor);
        if (!creditors_contains(creditor, users[msg.sender].person.creditors)) {
            users[msg.sender].person.creditors.push(creditor);
            users[msg.sender].person.count_creditors++;
        }
        users[msg.sender].person.owes[creditor].amount += amount;
        users[msg.sender].person.owes[creditor].exists = true;
        users[msg.sender].person.time[creditor] = block.timestamp;
        last_active[msg.sender] = block.timestamp;
    }

    function add_amount_to_owes(address debtor, address creditor, uint32 amount) public {
        users[debtor].person.owes[creditor].amount += amount;
        users[debtor].person.time[creditor] = block.timestamp;
        last_active[debtor] = block.timestamp;
    }

    function negate_amount_to_owes(address debtor, address creditor, uint32 amount) public {
        users[debtor].person.owes[creditor].amount -= amount;
        users[debtor].person.time[creditor] = block.timestamp;
        last_active[debtor] = block.timestamp;
    }

    function add_user(address addr) private {
        for (uint32 i = 0; i < count_users; i++) {
            if (all_users[i] == addr) {
                return;
            }
        }
        users[addr].person.addr = addr;
        users[addr].person.count_creditors = 0;
        users[addr].exists = true;
        all_users.push(addr);
        count_users++;
        last_active[addr] = block.timestamp;
    }

    /**
     * @dev Return value 
     * @return value of debt
     */
    function get_last_active(address a) public view returns (uint256){
        return last_active[a];
    }
     
    function lookup(address debtor, address creditor) public view returns (uint32){
        return users[debtor].person.owes[creditor].amount;
    }
    
    function getNeighbor(address debtor, uint32 index) public view returns (address){
        return users[debtor].person.creditors[index];
    }
    function getCountNeighbors(address debtor) public view returns (uint32){
        return users[debtor].person.count_creditors;
    }
    function getUser(uint32 index) public view returns (address){
        return all_users[index];
    }
    function getCountUser() public view returns (uint32 ret){
        ret = count_users;
    }
}