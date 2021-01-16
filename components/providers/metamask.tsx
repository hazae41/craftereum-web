import { ExternalProvider, Web3Provider } from "https://esm.sh/@ethersproject/providers"
import React, { useEffect, useMemo, useState } from 'https://esm.sh/react'
import { ConnectorComp } from "../connector.tsx"
import { useNetwork } from "../ethers.tsx"
import { Loading } from "../icons.tsx"

declare global {
  interface Window {
    ethereum?: ExternalProvider
  }
}

export function useEthereum() {
  const ethereum = useMemo(() => {
    return window.ethereum
  }, [])

  return ethereum
}

export function useWeb3(ethereum: ExternalProvider) {
  const web3 = useMemo(() => {
    return new Web3Provider(ethereum, "any")
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

export const MetamaskButton = (props: {
  onClick: () => void
}) => {
  const { onClick } = props

  return <button
    className="rounded-2xl w-full p-4 border-2 border-gray-100 hover:border-green-400 flex justify-between items-center focus:outline-none focus:ring focus:ring-green-300"
    onClick={onClick}>
    <div className="text-black font-medium"
      children="MetaMask" />
    <img height={24} width={24}
      src="/metamask.png" />
  </button>
}

export const MetamaskConnector = (props: {
  component: ConnectorComp,
  ethereum: ExternalProvider
}) => {
  const { component: Component, ethereum } = props

  const web3 = useWeb3(ethereum)
  const account = useAccount(ethereum)
  const network = useNetwork(web3)

  if (!account || !network)
    return <Loading className="text-white" />

  if (network.chainId !== 3)
    return <div className="text-white font-medium"
      children="Please use the Ropsten Test Network in MetaMask" />

  return <Component
    web3={web3}
    account={account} />
}