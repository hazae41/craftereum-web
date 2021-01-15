import { Network, Web3Provider } from "https://esm.sh/@ethersproject/providers"
import { useEffect, useState } from 'https://esm.sh/react'

export function useNetwork(web3?: Web3Provider) {
  const [network, setNetwork] = useState<Network>()

  useEffect(() => {
    if (!web3) return
    setNetwork(web3.network)
    web3.on('network', setNetwork)
  }, [web3])

  return network
}