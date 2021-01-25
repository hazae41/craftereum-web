import React, { useState } from 'https://esm.sh/react'
import { Web3Provider } from "https://esm.sh/@ethersproject/providers"
import { MetamaskButton, MetamaskConnector, useEthereum } from "./providers/metamask.tsx"
import { WCButton } from "./providers/walletconnect.tsx"
import { FortmaticButton, FortmaticConnector } from "./providers/fortmatic.tsx"

type ConnectorName =
  | "metamask"
  | "fortmatic"

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

  if (connector === "metamask")
    return <MetamaskConnector
      component={component}
      ethereum={ethereum!} />

  if (connector === "fortmatic")
    return <FortmaticConnector
      component={component} />

  return <div className="bg-white rounded-3xl shadow-lg p-4 w-full max-w-sm">
    <div className="text-xl text-black font-semibold"
      children="Connect to a wallet" />
    <div className="text-black text-opacity-50 font-medium"
      children="Choose a way to connect to your wallet" />
    <div className="m-4" />
    <div className="space-y-2">
      <FortmaticButton
        onClick={select("fortmatic")} />
      <MetamaskButton
        ethereum={ethereum}
        onClick={select("metamask")} />}
    </div>
  </div>
}