import { Web3Provider } from "https://esm.sh/@ethersproject/providers"
import Fortmatic from "https://esm.sh/fortmatic@latest"
import React, { useMemo } from 'https://esm.sh/react'
import { ConnectorComp } from "../connector.tsx"
import { useNetwork } from "../ethers.tsx"
import { Loading } from "../icons.tsx"
import { useAsyncMemo } from "../react.tsx"

function useFortmatic() {
  const fortmatic = useMemo(() => {
    return new Fortmatic("pk_test_6DBB2AAF3F2ABD86", "ropsten")
  }, [])

  return fortmatic
}

function useWeb3(fortmatic: any) {
  const web3 = useMemo(() => {
    const provider = fortmatic.getProvider()
    return new Web3Provider(provider, "any")
  }, [fortmatic])

  return web3
}

function useAccount(web3: Web3Provider): string | undefined {
  const accounts = useAsyncMemo(async () => {
    return await web3.listAccounts()
  }, [web3])

  return accounts?.[0]
}

export const FortmaticButton = (props: {
  onClick: () => void
}) => {
  const { onClick } = props

  return <button
    className="rounded-2xl w-full p-4 border-2 border-gray-100 hover:border-green-400 flex justify-between items-center focus:outline-none focus:ring focus:ring-green-300"
    onClick={onClick}>
    <div className="text-black font-medium"
      children="Fortmatic" />
    <img height={24} width={24}
      src="/fortmatic.png" />
  </button>
}

export const FortmaticConnector = (props: {
  component: ConnectorComp,
}) => {
  const { component: Component } = props

  const fortmatic = useFortmatic()

  const web3 = useWeb3(fortmatic)
  const account = useAccount(web3)
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