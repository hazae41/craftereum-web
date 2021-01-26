import React, { useState } from 'https://esm.sh/react'
import { Web3Provider } from "https://esm.sh/@ethersproject/providers"
import { DisabledMetamaskButton, MetamaskButton, MetamaskConnector, useEthereum } from "./providers/metamask.tsx"
import { WalletConnectButton, WalletConnectConnector } from "./providers/walletconnect.tsx"
import { FortmaticButton, FortmaticConnector } from "./providers/fortmatic.tsx"

type ConnectorName =
  | "metamask"
  | "fortmatic"
  | "walletconnect"

export type ConnectorComp = (props: {
  web3: Web3Provider
  account: string
}) => JSX.Element | null

export const ConnectorPage = (props: {
  component: ConnectorComp
}) => {
  const { component } = props;
  const ethereum = useEthereum()

  const [connector, setConnector] =
    useState<ConnectorName>()

  const select = (value: ConnectorName) =>
    () => setConnector(value)

  const cancel = () => setConnector(undefined)

  if (connector === "metamask")
    return <MetamaskConnector
      cancel={cancel}
      component={component}
      ethereum={ethereum!} />

  if (connector === "fortmatic")
    return <FortmaticConnector
      component={component} />

  if (connector === "walletconnect")
    return <WalletConnectConnector
      component={component} />

  return <div className="bg-white rounded-3xl shadow-lg p-4 w-full max-w-sm">
    <div className="text-xl text-black font-semibold"
      children="Connect to a wallet" />
    <div className="text-black text-opacity-50 font-medium"
      children="Choose a way to connect to your wallet" />
    <div className="my-4" />
    <div className="space-y-2">
      <WalletConnectButton
        onClick={select("walletconnect")} />
      <FortmaticButton
        onClick={select("fortmatic")} />
      {ethereum
        ? <MetamaskButton
          onClick={select("metamask")} />
        : <DisabledMetamaskButton />}
    </div>
  </div>
}