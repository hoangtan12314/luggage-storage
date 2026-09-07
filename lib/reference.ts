// Unambiguous alphabet: no 0/O or 1/I, since customers read refs aloud and
// type them back in at the lookup page.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRef(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `LS-${code}`;
}
