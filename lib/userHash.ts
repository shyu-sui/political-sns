export function getUserHash(): string {
  let hash = localStorage.getItem("user_hash");
  if (!hash) {
    hash = crypto.randomUUID();
    localStorage.setItem("user_hash", hash);
  }
  return hash;
}
