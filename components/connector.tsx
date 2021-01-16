import React, { useState } from 'https://esm.sh/react'
import { Craftereum } from "../pages/index.tsx"
import { MetamaskButton, MetamaskConnector, useEthereum } from "./providers/metamask.tsx"
import { WCButton } from "./providers/walletconnect.tsx"

export type Connectors =
  | "metamask"
  | "walletconnect"

export const Connector = () => {
  const ethereum = useEthereum()

  const [connector, setConnector] =
    useState<Connectors>()

  const select = (value: Connectors) =>
    () => setConnector(value)

  if (connector === "metamask")
    return <MetamaskConnector
      Children={Craftereum}
      ethereum={ethereum} />

  if (connector === "walletconnect")
    return <div className=""
      children="Not yet supported" />

  return <div className="bg-white rounded-3xl shadow-lg p-4 w-full max-w-sm">
    <div className="text-xl text-black font-semibold"
      children="Connect to a wallet" />
    <div className="text-black text-opacity-50 font-medium"
      children="Choose a way to connect to your wallet" />
    <div className="m-4" />
    <div className="space-y-2">
      <WCButton
        onClick={select("walletconnect")} />
      {ethereum && <MetamaskButton
        onClick={select("metamask")} />}
    </div>
  </div>
}