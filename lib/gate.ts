export const GATE_COOKIE = "net-gate";

/** cookie value derived from the passcode: changing APP_PASSCODE signs everyone out */
export async function gateToken(code: string): Promise<string> {
  const data = new TextEncoder().encode(`net-quiz-gate:${code}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** only same-site paths are allowed as the post-unlock destination */
export const safeNext = (n: string | null | undefined) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/");
