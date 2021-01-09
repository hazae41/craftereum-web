export type Status = "ok" | "error" | "loading" | undefined

export function cors(target: string) {
  const proxy = "https://cors.haz.workers.dev/"
  return proxy + "?url=" + encodeURIComponent(target)
}

export async function fetchJson(url: string, signal: AbortSignal) {
  const req = await fetch(url, { signal })
  return await req.json()
}