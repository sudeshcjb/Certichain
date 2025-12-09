import { Block, CertificateData } from '../types';

/**
 * Calculates the SHA-256 hash of a block's contents.
 * This utilizes the native Web Crypto API for performance and standard compliance.
 */
export const calculateHash = async (
  index: number,
  previousHash: string,
  timestamp: string,
  data: CertificateData,
  nonce: number
): Promise<string> => {
  const message = JSON.stringify({
    index,
    previousHash,
    timestamp,
    data,
    nonce
  });

  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};

/**
 * Validates the integrity of the entire chain.
 * Returns true if all hashes are valid and links are preserved.
 */
export const validateChain = async (chain: Block[]): Promise<{ isValid: boolean, brokenIndex: number }> => {
  for (let i = 1; i < chain.length; i++) {
    const currentBlock = chain[i];
    const previousBlock = chain[i - 1];

    // 1. Check if the stored previousHash matches the actual hash of the previous block
    if (currentBlock.previousHash !== previousBlock.hash) {
      return { isValid: false, brokenIndex: i };
    }

    // 2. Check if the current block's hash is valid for its own data
    const recalculatedHash = await calculateHash(
      currentBlock.index,
      currentBlock.previousHash,
      currentBlock.timestamp,
      currentBlock.data,
      currentBlock.nonce
    );

    if (currentBlock.hash !== recalculatedHash) {
      return { isValid: false, brokenIndex: i };
    }
  }
  return { isValid: true, brokenIndex: -1 };
};

/**
 * Creates the Genesis Block (The first block in the chain)
 */
export const createGenesisBlock = async (): Promise<Block> => {
  const data: CertificateData = {
    studentName: "GENESIS_BLOCK",
    degree: "System Initialization",
    university: "CertiChain Network",
    graduationDate: new Date().toISOString().split('T')[0],
    gpa: "0.0",
    issuanceDate: new Date().toISOString()
  };
  
  const timestamp = new Date().toISOString();
  const hash = await calculateHash(0, "0", timestamp, data, 0);

  return {
    index: 0,
    timestamp,
    data,
    previousHash: "0",
    hash,
    nonce: 0,
    isGenesis: true
  };
};