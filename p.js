import bs58 from "bs58";

// Convert base64 → Uint8Array → base58
function base64ToBase58(base64Address) {
  const binary = Buffer.from(base64Address, "base64"); // Bun supports Buffer
  return bs58.encode(binary);
}

// Example base64 address
const base64Address = "XNnv7SCFMce3faxK+jUqGCOqit1Q9 02ZA9GVD6wLHBc=";
const base58Address = base64ToBase58(base64Address);

console.log("Base58 wallet address:", base58Address);
