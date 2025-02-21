const { ethers } = require('ethers');
const kleur = require("kleur");
const axios = require("axios");
const chains = require('./chains');
const provider = chains.testnet.nexus.provider();
const explorer = chains.testnet.nexus.explorer;
const fs = require('fs');
const moment = require('moment-timezone');
const delay = chains.utils.etc.delay;
const loading = chains.utils.etc.loadingAnimation;
const header = chains.utils.etc.header;
const timelog = chains.utils.etc.timelog;
const countdown = chains.utils.etc.countdown;
const PRIVATE_KEYS = JSON.parse(fs.readFileSync('privateKeys.json', 'utf-8'));
const path = require("path");

function appendLog(message) {
  fs.appendFileSync('log-nexus.txt', message + '\n');
}

async function dailyTransaction(privateKey, transactionNumber) {
    const wallet = new ethers.Wallet(privateKey, provider);
    await loading(`Start Transaction #${transactionNumber} for Wallet ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`, 2000);
    const tx = {
        to: wallet.address,
        value: ethers.parseEther("0.0001"),
    };
    try {
        const signedTx = await wallet.sendTransaction(tx);
        const receipt = await signedTx.wait();
        const successMessage = `[${timelog()}] Transaction ${transactionNumber} Confirmed: ${explorer.tx(receipt.hash.slice(0, 10))}******`;
        console.log(kleur.green(successMessage));
        appendLog(successMessage);
    } catch (error) {
        console.error("Error:", error);
    }
}

async function runTransaction() {
    header();
    for (const [index, privateKey] of PRIVATE_KEYS.entries()) {
        try {
            for (let i = 1; i <= 100; i++) {
                await dailyTransaction(privateKey, i);
                await delay(2000);
            }
            console.log('');
        } catch (error) {
            const errorMessage = `[${timelog()}] Error processing wallet ${index + 1}: ${error.message}`;
            console.log(kleur.red(errorMessage));
            appendLog(errorMessage);
        }
    }
}

runTransaction();
