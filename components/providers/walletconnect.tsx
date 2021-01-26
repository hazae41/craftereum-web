import { Web3Provider, Network, getNetwork } from "https://esm.sh/@ethersproject/providers"
import WalletConnectModule from "https://cdn.esm.sh/v15/@walletconnect/web3-provider@1.3.4/esnext/web3-provider.js"
import WalletConnectProvider from "https://cdn.esm.sh/v15/@walletconnect/web3-provider@1.3.4/dist/cjs/index.d.ts"
import React, { useEffect, useMemo, useState } from 'https://esm.sh/react'
import { ConnectorComp } from "../connector.tsx"
import { Loading } from "../icons.tsx"
import { useAsyncMemo } from "../react.tsx"
import { useNetwork } from "../ethers.tsx"

const WalletConnect: typeof WalletConnectProvider = WalletConnectModule.default

function useWalletConnect() {
  const provider = useMemo(() => {
    const infuraId = "7f198ba5d17f492d899a38781e324df4"
    return new WalletConnect({ infuraId })
  }, [])

  return provider
}

function useWeb3(provider: WalletConnectProvider) {
  const web3 = useMemo(() => {
    return new Web3Provider(provider, "any")
  }, [provider])

  return web3
}

function useAccount(provider: WalletConnectProvider) {
  const [accounts, setAccounts] = useState<string[]>()

  useEffect(() => {
    provider.on("accountsChanged", setAccounts)
    provider.on("disconnect", () => setAccounts(undefined))
    provider.enable().then(setAccounts)
  }, [provider])

  return accounts?.[0]
}

export const WalletConnectButton = (props: {
  onClick: () => void
}) => {
  const { onClick } = props

  return <button
    className="rounded-2xl w-full p-4 border-2 border-gray-100 hover:border-green-400 flex justify-between items-center focus:outline-none focus:ring focus:ring-green-300"
    onClick={onClick}>
    <div className="text-black font-medium"
      children="WalletConnect" />
    <img height={24} width={24}
      src="/walletconnect.png" />
  </button>
}

export const WalletConnectConnector = (props: {
  component: ConnectorComp
}) => {
  const { component: Component } = props

  const provider = useWalletConnect()
  const web3 = useWeb3(provider)
  const account = useAccount(provider)
  const network = useNetwork(web3)

  console.log("provider", provider)
  console.log("web3", web3)
  console.log("account", account)
  console.log("network", network)

  if (!account || !network)
    return <Loading className="text-white" />

  if (network.chainId !== 3)
    return <div className="text-white font-medium"
      children="Please use the Ropsten Test Network" />

  return <Component
    web3={web3}
    account={account} />
}
