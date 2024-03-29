import { Network, Web3Provider } from "https://esm.sh/@ethersproject/providers"
import { useEffect, useState } from 'https://esm.sh/react'
import { fetchJson } from "./async.tsx"
import { useAsyncMemo } from "./react.tsx"

export function useAccount(web3: Web3Provider): string | undefined {
  const accounts = useAsyncMemo(async () => {
    return await web3.listAccounts()
  }, [web3])

  return accounts?.[0]
}

export function useNetwork(web3: Web3Provider) {
  const [network, setNetwork] = useState<Network>()

  useEffect(() => {
    setNetwork(web3.network)
    web3.on('network', setNetwork)
  }, [web3])

  return network
}

export async function sourcify(address: string, signal: AbortSignal) {
  const api = "https://verification.komputing.org/server/"
  const call = `checkByAddresses?addresses=${address}&chainIds=3`
  const res = await fetchJson(api + call, signal)
  return res[0].status
}