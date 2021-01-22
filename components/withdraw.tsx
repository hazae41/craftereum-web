import React, { useMemo, useState } from 'https://esm.sh/react'
import { AppMemory } from "./app.tsx"
import { Status } from "./async.tsx"
import { Loading } from "./icons.tsx"
import { Player, PlayerInput } from "./player.tsx"

export const WithdrawPage = (props: {
  app: AppMemory
}) => {
  const { craftereum } = props.app

  const balance = props.app.balance.toNumber()
  const [amount, setAmount] = useState(balance)

  const $player = useState<Player>()
  const [player, setPlayer] = $player

  const [status, setStatus] = useState<Status>()

  const valid = useMemo(() => {
    if (!player) return false
    if (!amount) return false
    if (amount > balance) return false
    if (status === "loading") return false
    return true
  }, [amount, player, balance, status])

  async function withdraw() {
    try {
      if (!player) return
      setStatus("loading")
      const receipt = await craftereum
        .transfer(player.id, amount)
      await receipt.wait()
      setStatus("ok")
    } catch (e: unknown) {
      console.error(e)
      setStatus("error")
    }
  }

  return <div className="bg-white rounded-3xl shadow-lg p-4 w-full max-w-md">
    <div className="text-3xl font-display font-semibold"
      children="Withdraw" />
    <div className="text-gray-500"
      children="Withdraw some emeralds from your wallet to your Minecraft account." />
    <div className="my-4" />
    <div className="text-lg font-medium"
      children="Player" />
    <div className="my-1" />
    <PlayerInput
      placeholder="Player"
      $player={$player} />
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
        onClick={withdraw}
        children="Withdraw" />
      : <button className="flex justify-center items-center rounded-xl w-full p-2 bg-green-300 text-white font-bold focus:outline-none cursor-default"
        children={<>{status === "loading" && <Loading className="text-white" />}{"Withdraw"}</>} />}
    {status === "error" &&
      <div className="mt-2 text-center font-medium text-red-500"
        children="An error occured" />}
  </div>
}