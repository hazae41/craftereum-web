import { Web3Provider } from "https://esm.sh/@ethersproject/providers"
import { useEffect, useMemo, useState } from 'https://esm.sh/react'

export function useEthereum() {
  const ethereum = useMemo(() => {
    return window.ethereum
  }, [])

  useEffect(() => {
    if (!ethereum) return
    ethereum.autoRefreshOnNetworkChange = false
  }, [ethereum])

  return ethereum
}

export function useWeb3(ethereum: any) {
  const web3 = useMemo(() => {
    if (!ethereum) return
    return new Web3Provider(ethereum)
  }, [ethereum])

  return web3
}

export function useAccount(ethereum: any): string | undefined {
  const [accounts, setAccounts] = useState<string[]>([])

  useEffect(() => {
    if (!ethereum) return
    ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(setAccounts);
    ethereum.on('accountsChanged', setAccounts);
  }, [ethereum])

  return accounts[0]
}