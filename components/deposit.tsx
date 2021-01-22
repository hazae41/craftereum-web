import React, { useState } from 'https://esm.sh/react'
import { AppMemory } from "./app.tsx"

export const DepositPage = (props: {
  app: AppMemory
}) => {
  const { account } = props.app

  const [amount, setAmount] = useState(0)

  return <div className="bg-white rounded-3xl shadow-lg p-4 w-full max-w-md">
    <div className="text-3xl font-display font-semibold"
      children="Deposit" />
    <div className="text-gray-500"
      children="Deposit some emeralds from your Minecraft account to your wallet" />
    <div className="my-4" />
    <div className="text-lg font-medium"
      children="Amount" />
    <div className="my-1" />
    <div className="rounded-xl px-4 py-2 bg-gray-100">
      <input className="w-full outline-none bg-transparent"
        type="number"
        min={1}
        value={amount}
        onChange={e => setAmount(e.target.valueAsNumber)} />
    </div>
    <div className="my-8" />
    <div className="my-4 border-b border-gray-200" />
    <div className="text-lg font-medium"
      children="Command" />
    <div className="text-gray-500"
      children="Copy and paste this command in Minecraft" />
    <div className="my-1" />
    <div className="bg-gray-100 p-2 rounded-lg overflow-auto whitespace-nowrap">
      <input
        readOnly
        className="w-full outline-none bg-transparent"
        onFocus={e => (e.target as any).select()}
        value={`/deposit ${amount} ${account}`} />
    </div>
  </div>
}