import React, { useMemo, useState } from 'https://esm.sh/react'
import { AppMemory } from "./app.tsx"
import { Status } from "./async.tsx"
import { Loading } from "./icons.tsx"
import { visit } from "./path.tsx"

export const TransferPage = (props: {
  app: AppMemory
  path: string[]
}) => {
  const { path, app } = props;
  const { emeralds } = app;

  const [address] = path

  const setAddress = (address: string) =>
    visit("/transfer/" + address)

  const balance = app.balance.toNumber()
  const [amount, setAmount] = useState(balance)

  const [status, setStatus] = useState<Status>()

  const valid = useMemo(() => {
    if (!address) return false
    if (!amount) return false
    if (amount > balance) return false
    if (status === "loading") return false
    return true
  }, [amount, balance, address, status])

  async function transfer() {
    try {
      setStatus("loading")
      const receipt = await emeralds
        .transfer(address, amount)
      await receipt.wait()
      setStatus("ok")
    } catch (e: unknown) {
      console.error(e)
      setStatus("error")
    }
  }

  return <div className="bg-white rounded-3xl shadow-lg p-4 w-full max-w-md">
    <div className="text-3xl font-display font-semibold"
      children="Transfer" />
    <div className="text-gray-500"
      children="Transfer some emeralds from your wallet to an address." />
    <div className="my-4" />
    <div className="text-lg font-medium"
      children="Address" />
    <div className="my-1" />
    <div className="rounded-xl px-4 py-2 bg-gray-100">
      <input className="w-full outline-none bg-transparent"
        value={address}
        onChange={e => setAddress(e.target.value)} />
    </div>
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
    {valid
      ? <button className="rounded-xl w-full p-2 bg-green-400 hover:bg-green-500 text-white font-bold focus:outline-none focus:ring focus:ring-green-300"
        onClick={transfer}
        children="Transfer" />
      : <button className="flex justify-center items-center rounded-xl w-full p-2 bg-green-300 text-white font-bold focus:outline-none cursor-default"
        children={<>{status === "loading" && <Loading className="text-white" />}{"Transfer"}</>} />}
    {status === "error" &&
      <div className="mt-2 text-center font-medium text-red-500"
        children="An error occured" />}
  </div>
}