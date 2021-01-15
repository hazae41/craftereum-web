import { Network, Web3Provider } from "https://esm.sh/@ethersproject/providers"
import React, { forwardRef, Ref, useEffect, useMemo, useState } from 'https://esm.sh/react'
import { useNetwork } from "../ethers.tsx"

declare global {
  interface Window {
    ethereum: any
  }
}

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
  Children: any,
  ethereum: any
}) => {
  const { Children, ethereum } = props

  const web3 = useWeb3(ethereum)
  const account = useAccount(ethereum)
  const network = useNetwork(web3)

  if (!ethereum)
    return <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-sm">
      <div children="Please use MetaMask" />
    </div>

  if (!web3)
    return <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-sm">
      <div children="An error occured" />
    </div>

  if (!account)
    return <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-sm">
      <div children="Loading..." />
    </div>

  if (network?.chainId !== 3)
    return <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-sm">
      <div children="Please use the Ropsten Test Network in MetaMask" />
    </div>

  return <Children
    web3={web3}
    account={account} />
}