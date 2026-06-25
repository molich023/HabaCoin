const fs = require('fs');
const path = require('path');
const solc = require('solc');

const contractPath = path.resolve(__dirname, 'contracts', 'HabaCoin.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'HabaCoin.sol': {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode.object']
            }
        },
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
};

console.log("⏳ Running pure architectural compiler on HabaCoin.sol...");
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
    output.errors.forEach(err => console.error(err.formattedMessage));
}

if (output.contracts && output.contracts['HabaCoin.sol'] && output.contracts['HabaCoin.sol']['HabaCoin']) {
    const contract = output.contracts['HabaCoin.sol']['HabaCoin'];
    
    // Ensure the artifacts directory structure exists 
    fs.mkdirSync(path.resolve(__dirname, 'artifacts'), { recursive: true });
    
    fs.writeFileSync(
        path.resolve(__dirname, 'artifacts', 'HabaCoin.json'),
        JSON.stringify({ abi: contract.abi, bytecode: contract.evm.bytecode.object }, null, 2)
    );
    console.log("✅ Compilation Successful! Artifacts saved to ./artifacts/HabaCoin.json");
} else {
    console.log("❌ Compilation failed.");
}
