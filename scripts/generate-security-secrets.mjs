import { randomBytes } from "node:crypto";

function password(length = 24) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%_-+";
  const bytes = randomBytes(length);
  return [...bytes].map((byte) => alphabet[byte % alphabet.length]).join("");
}

const adminPassword = password();
const sessionSecret = randomBytes(48).toString("base64url");

console.log("Store these values in a password manager. Never commit them to Git:\n");
console.log(`ADMIN_PASSWORD=${adminPassword}`);
console.log(`SESSION_SECRET=${sessionSecret}`);
