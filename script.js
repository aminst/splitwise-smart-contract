// =============================================================================
//                                  Config 
// =============================================================================

// sets up web3.js
// Web3 calls locally from file web3.min.js
// const Web3 = require("web3")

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

// Default account is the first one
web3.eth.defaultAccount = web3.eth.accounts[0];
// Constant we use later
var GENESIS = '0x0000000000000000000000000000000000000000000000000000000000000000';

// This is the ABI for your contract (get it from Remix, in the 'Compile' tab)
// If you use truffle you can load abi from truffle build folder
// ============================================================
var abi = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "debtor",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "creditor",
				"type": "address"
			},
			{
				"internalType": "uint32",
				"name": "amount",
				"type": "uint32"
			}
		],
		"name": "add_amount_to_owes",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "creditor",
				"type": "address"
			},
			{
				"internalType": "uint32",
				"name": "amount",
				"type": "uint32"
			}
		],
		"name": "add_IOU",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "debtor",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "creditor",
				"type": "address"
			},
			{
				"internalType": "uint32",
				"name": "amount",
				"type": "uint32"
			}
		],
		"name": "negate_amount_to_owes",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "a",
				"type": "address"
			}
		],
		"name": "get_last_active",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "debtor",
				"type": "address"
			}
		],
		"name": "getCountNeighbors",
		"outputs": [
			{
				"internalType": "uint32",
				"name": "",
				"type": "uint32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCountUser",
		"outputs": [
			{
				"internalType": "uint32",
				"name": "ret",
				"type": "uint32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "debtor",
				"type": "address"
			},
			{
				"internalType": "uint32",
				"name": "index",
				"type": "uint32"
			}
		],
		"name": "getNeighbor",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint32",
				"name": "index",
				"type": "uint32"
			}
		],
		"name": "getUser",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "debtor",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "creditor",
				"type": "address"
			}
		],
		"name": "lookup",
		"outputs": [
			{
				"internalType": "uint32",
				"name": "",
				"type": "uint32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]; 

abiDecoder.addABI(abi);


// Reads in the ABI
var BlockchainSplitwiseContractSpec = web3.eth.contract(abi);

// This is the address of the contract you want to connect to;
var contractAddress = '0x8b68f1a9B57e840Bc9774ab283f61A051959ddAf'; // FIXME: fill this in with your contract's address/hash

var BlockchainSplitwise = BlockchainSplitwiseContractSpec.at(contractAddress);


// =============================================================================
//                            Functions To Implement 
// =============================================================================

// TODO: Add any helper functions here!

// TODO: Return a list of all users (creditors or debtors) in the system
// You can return either:
//   - a list of everyone who has ever sent or received an IOU
// OR
//   - a list of everyone currently owing or being owed money
function getUsers() {
    var all_users = [];
    var count_users = BlockchainSplitwise.getCountUser.call().toNumber();
    while(count_users > 0){
        all_users.push(BlockchainSplitwise.getUser.call(count_users - 1));
        count_users -= 1;
    }
    return all_users;
}

// TODO: Get the total amount owed by the user specified by 'user'
function getTotalOwed(user) {
    var count_neighbors = BlockchainSplitwise.getCountNeighbors.call(user).toNumber();

    var neighbor;
    var total = 0;
    while(count_neighbors > 0){
        neighbor = BlockchainSplitwise.getNeighbor.call(user, count_neighbors - 1);
        total += BlockchainSplitwise.lookup.call(web3.eth.defaultAccount, neighbor) * 1;
        count_neighbors -= 1;
    }
    return total;
}

// TODO: Get the last time this user has sent or received an IOU, in seconds since Jan. 1, 1970
// Return null if you can't find any activity for the user.
// HINT: Try looking at the way 'getAllFunctionCalls' is written. You can modify it if you'd like.
function getLastActive(user) {
    return BlockchainSplitwise.get_last_active.call(user);
}

function findMinInLoop(loop, amount) {
	var min = amount;
	for(var i = 0; i < loop.length - 1; i++){
		let l = BlockchainSplitwise.lookup.call(loop[i], loop[i+1]).toNumber();
		if(l < min){
			min = l;
		}
	}
	return min;
}

// TODO: add an IOU ('I owe you') to the system
// The person you owe money is passed as 'creditor'
// The amount you owe them is passed as 'amount'
function add_IOU(creditor, amount) {
	loop = doBFS(creditor, web3.eth.defaultAccount, getNeighbors)
	var min;
	if (loop == null) {
		BlockchainSplitwise.add_IOU(creditor, amount, {gas:7000000});
		return;
	}
	else {
		min = findMinInLoop(loop, amount);
		for (let i = 0; i < loop.length - 1; i++) {
				BlockchainSplitwise.negate_amount_to_owes(loop[i], loop[i+1], min, {gas:7000000});
		}
		BlockchainSplitwise.add_IOU(creditor, amount - min, {gas:7000000});
	}
}

// =============================================================================
//                              Provided Functions 
// =============================================================================
// Reading and understanding these should help you implement the above

// This searches the block history for all calls to 'functionName' (string) on the 'addressOfContract' (string) contract
// It returns an array of objects, one for each call, containing the sender ('from') and arguments ('args')
function getAllFunctionCalls(addressOfContract, functionName) {
    var curBlock = web3.eth.blockNumber;
    var function_calls = [];
    while (curBlock !== GENESIS) {
        var b = web3.eth.getBlock(curBlock, true);
        var txns = b.transactions;
        for (var j = 0; j < txns.length; j++) {
            var txn = txns[j];
            // check that destination of txn is our contract
            if (txn.to === addressOfContract) {
                var func_call = abiDecoder.decodeMethod(txn.input);
                // check that the function getting called in this txn is 'functionName'
                if (func_call && func_call.name === functionName) {
                    var args = func_call.params.map(function(x) { return x.value });
                    function_calls.push({
                        from: txn.from,
                        args: args
                    })
                }
            }
        }
        curBlock = b.parentHash;
    }
    return function_calls;
}

// We've provided a breadth-first search implementation for you, if that's useful
// It will find a path from start to end (or return null if none exists)
// You just need to pass in a function ('getNeighbors') that takes a node (string) and returns its neighbors (as an array)
function doBFS(start, end, getNeighbors) {
    var queue = [
        [start]
    ];
    while (queue.length > 0) {
        var cur = queue.shift();
        var lastNode = cur[cur.length - 1]
        if (lastNode === end) {
            return cur;
        } else {
            var neighbors = getNeighbors(lastNode);
            for (var i = 0; i < neighbors.length; i++) {
                queue.push(cur.concat([neighbors[i]]));
            }
        }
    }
    return null;
}

function getNeighbors(user){
    var count_neighbors = BlockchainSplitwise.getCountNeighbors.call(user);
    var neighbor;
    var neighbors = [];
    var debt;
    while(count_neighbors > 0){
        neighbor = BlockchainSplitwise.getNeighbor.call(user, count_neighbors - 1);
        debt = BlockchainSplitwise.lookup.call(user, neighbor) * 1;
        if(debt > 0){
            neighbors.push(neighbor);
        }
        count_neighbors -= 1;
    }
    log("neighbors", neighbors);
    return neighbors;
}

// =============================================================================
//                                      UI 
// =============================================================================

// This code updates the 'My Account' UI with the results of your functions
$("#total_owed").html("$" + getTotalOwed(web3.eth.defaultAccount));
$("#last_active").html(timeConverter(getLastActive(web3.eth.defaultAccount)));
$("#myaccount").change(function() {
    web3.eth.defaultAccount = $(this).val();
    $("#total_owed").html("$" + getTotalOwed(web3.eth.defaultAccount));
    $("#last_active").html(timeConverter(getLastActive(web3.eth.defaultAccount)))
});

// Allows switching between accounts in 'My Account' and the 'fast-copy' in 'Address of person you owe
var opts = web3.eth.accounts.map(function(a) { return '<option value="' + a + '">' + a + '</option>' })
$(".account").html(opts);
$(".wallet_addresses").html(web3.eth.accounts.map(function(a) { return '<li>' + a + '</li>' }))

// This code updates the 'Users' list in the UI with the results of your function
$("#all_users").html(getUsers().map(function(u, i) { return "<li>" + u + "</li>" }));

// This runs the 'add_IOU' function when you click the button
// It passes the values from the two inputs above
$("#addiou").click(function() {
    add_IOU($("#creditor").val(), $("#amount").val());
    window.location.reload(true); // refreshes the page after
});

// This is a log function, provided if you want to display things to the page instead of the JavaScript console
// Pass in a discription of what you're printing, and then the object to print
function log(description, obj) {
    $("#log").html($("#log").html() + description + ": " + JSON.stringify(obj, null, 2) + "\n\n");
}