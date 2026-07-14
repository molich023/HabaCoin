import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import solc from 'solc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Read the core smart contract
const contractPath = path.resolve(__dirname, 'contracts', 'HabaCoin.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: { 'HabaCoin.sol': { content: source } },
    settings: {
        outputSelection: {
            '*': { '*': ['abi', 'evm.bytecode'] }
        }
    }
};

// 2. Strict, memory-safe absolute path dictionary lookup mapping
const importMap = {
    '@openzeppelin/contracts/token/ERC20/ERC20.sol': 'node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol',
    '@openzeppelin/contracts/token/ERC20/IERC20.sol': 'node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol',
    '@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol': 'node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol',
    '@openzeppelin/contracts/utils/Context.sol': 'node_modules/@openzeppelin/contracts/utils/Context.sol',
    '@openzeppelin/contracts/access/Ownable.sol': 'node_modules/@openzeppelin/contracts/access/Ownable.sol',
    '@openzeppelin/contracts/utils/ReentrancyGuard.sol': 'node_modules/@openzeppelin/contracts/utils/ReentrancyGuard.sol'
};

function findImports(importPath) {
    try {
        let targetPath = '';
        
        // Match explicit mapping or guess nested directory structures
        if (importMap[importPath]) {
            targetPath = path.resolve(__dirname, importMap[importPath]);
        } else if (importPath.startsWith('@openzeppelin/')) {
            targetPath = path.resolve(__dirname, 'node_modules', importPath);
        } else {
            // Handle secondary relative jumps inside OpenZeppelin dependencies
            targetPath = path.resolve(__dirname, 'node_modules', '@openzeppelin', 'contracts', importPath.replace(/^..\/..\/|^..\/|contracts\//, ''));
        }

        if (fs.existsSync(targetPath)) {
            return { contents: fs.readFileSync(targetPath, 'utf8') };
        }
        
        // Deep nested utilities check
        const structuralFallback = path.resolve(__dirname, 'node_modules', '@openzeppelin', 'contracts', path.basename(importPath));
        if (fs.existsSync(structuralFallback)) {
            return { contents: fs.readFileSync(structuralFallback, 'utf8') };
        }

        return { error: `File not found at: ${targetPath}` };
    } catch (e) {
        return { error: e.message };
    }
}

console.log("⏳ Running Low-RAM Optimized Compiler Platform...");
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors) {
    let hasErrors = false;
    output.errors.forEach(err => {
        console.log(err.formattedMessage);
        if (err.severity === 'error') hasErrors = true;
    });
    if (hasErrors) process.exit(1);
}

const contractData = output.contracts['HabaCoin.sol']['HabaCoin'];
fs.writeFileSync('HabaCoin.abi', JSON.stringify(contractData.abi, null, 2));
fs.writeFileSync('HabaCoin.bin', contractData.evm.bytecode.object);

console.log("✅ Compilation Successful!");
console.log("📁 Generated: HabaCoin.abi");
console.log("📁 Generated: HabaCoin.bin");
