import { BigNumber } from "https://esm.sh/@ethersproject/bignumber"
import { Contract } from "https://esm.sh/@ethersproject/contracts"
import { Web3Provider } from "https://esm.sh/@ethersproject/providers"
import Jazzicon from "https://esm.sh/@metamask/jazzicon"
import React, { useMemo } from 'https://esm.sh/react'
import { AppMemory } from "./app.tsx"
import { CopyIcon, QRCodeIcon } from "./icons.tsx"
import { visit } from "./path.tsx"
import { useAsyncMemo } from "./react.tsx"

export const AccountCard = (props: {
  app: AppMemory
}) => {
  const {
    web3,
    account,
    emeralds,
    balance
  } = props.app

  const symbol = useAsyncMemo(async () => {
    return await emeralds.symbol()
  }, [emeralds])

  const gas = useAsyncMemo(async () => {
    return await web3.getBalance(account)
  }, [account])

  const jazzicon = useMemo(() => {
    if (!account) return
    const slice = account.slice(2, 10)
    const seed = parseInt(slice, 16)
    return Jazzicon(32, seed)
  }, [account])

  async function test() {
    const signer = web3.getSigner()
    const psigned = signer.signMessage("hello world")
    console.log(psigned)
  }

  return (
    <div className="bg-green-100 rounded-3xl shadow-xl px-6 py-4 w-full max-w-sm">
      <div className="font-semibold text-gray-500"
        children="Balance" />
      <div title="Emeralds"
        className="flex justify-end items-center">
        <div className="text-4xl"
          children={balance?.toString()} />
        <div className="m-2" />
        <div className="text-4xl font-semibold"
          children={symbol} />
      </div>
      <div title="Ethereums"
        className="flex justify-end items-center">
        <div className="text-black text-opacity-50"
          children={gas?.toString()} />
        <div className="mx-1" />
        <div className="text-black text-opacity-50 font-semibold"
          children="Ξ" />
      </div>
      <div className="m-2" />
      <div className="flex items-center justify-between">
        <div
          className="rounded-full p-0.5 border-2 border-green-400"
          style={{ fontSize: 0 }}
          dangerouslySetInnerHTML={{ __html: jazzicon.outerHTML }} />
        <div className="text-center text-2xl font-semibold text-black"
          children={account.slice(0, 8) + "..." + account.slice(-8)} />
        <button className="hover:text-green-500 focus:outline-none"
          title="QR Code"
          onClick={() => test()}
          children={<QRCodeIcon className="w-6 h-6" />} />
        <button className="hover:text-green-500 focus:outline-none"
          title="Copy address"
          onClick={() => navigator.clipboard?.writeText(account)}
          children={<CopyIcon className="w-6 h-6" />} />
      </div>
      <div className="m-2" />
      <div className="flex space-x-2">
        <button className="rounded-xl w-full p-2 bg-green-400 hover:bg-green-500 text-white font-medium focus:outline-none focus:ring focus:ring-green-300"
          onClick={() => visit("/withdraw")}
          children="Withdraw" />
        <button className="rounded-xl w-full p-2 bg-green-400 hover:bg-green-500 text-white font-medium focus:outline-none focus:ring focus:ring-green-300"
          onClick={() => visit("/deposit")}
          children="Deposit" />
        <button className="rounded-xl w-full p-2 bg-green-400 hover:bg-green-500 text-white font-medium focus:outline-none focus:ring focus:ring-green-300"
          onClick={() => visit("/transfer")}
          children="Transfer" />
      </div>
    </div>
  )
}