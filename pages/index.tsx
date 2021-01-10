/// <reference lib="dom" />

import { Contract, ContractFactory } from "https://esm.sh/@ethersproject/contracts"
import { Network, Web3Provider } from "https://esm.sh/@ethersproject/providers"
import Jazzicon from "https://esm.sh/@metamask/jazzicon"
import React, { DependencyList, useEffect, useMemo, useState } from 'https://esm.sh/react'
import { fetchJson, Status } from "../components/async.tsx"
import { Loading } from "../components/icons.tsx"
import { Player, PlayerInput } from "../components/player.tsx"
import { MetamaskButton, MetamaskConnector, useEthereum } from "../components/providers/metamask.tsx"
import { WCButton } from "../components/providers/walletconnect.tsx"
import { useAsyncMemo, usePath, visit } from "../components/react.tsx"

declare global {
  interface Window {
    ethereum: any
    craftereum: any
    emeralds: any
  }
}

const github = "https://raw.githubusercontent.com/saurusmc/craftereum/master/"

export default function Home() {
  return (
    <div className="flex flex-col items-center container mx-auto p-4">
      <div className="flex flex-col items-center">
        <div className="text-6xl sm:text-8xl text-white font-mono font-semibold tracking-wide"
          onClick={visit("#")}
          children="CRAFTΞRΞUM" />
        <div className="text-xl sm:text-3xl text-white text-opacity-60 font-medium"
          children="Saurus International Server" />
      </div>
      <div className="m-2" />
      <Connector />
    </div>
  )
}

export function useNetwork(web3?: Web3Provider) {
  const [network, setNetwork] = useState<Network>()

  useEffect(() => {
    if (!web3) return
    setNetwork(web3.network)
    web3.on('network', setNetwork)
  }, [web3])

  return network
}

export type Connectors =
  | "metamask"
  | "walletconnect"

const Connector = () => {
  const ethereum = useEthereum()

  const [connector, setConnector] =
    useState<Connectors>()

  const select = (value: Connectors) =>
    () => setConnector(value)

  if (connector === "metamask")
    return <MetamaskConnector
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
      {ethereum && <MetamaskButton
        onClick={select("metamask")} />}
      <WCButton
        onClick={select("walletconnect")} />
    </div>
  </div>
}

export const Craftereum = (props: {
  web3: Web3Provider
  account: string
}) => {
  const { web3, account } = props

  const [page, ...subpath] = usePath()

  const craftereum = useAsyncMemo(async (signal) => {
    const url = github + "artifacts/Craftereum.json"
    const json = await fetchJson(url, signal)
    const addr = "0x14eb503F3446E6e443935CB75c854c47D9E080da"
    return new Contract(addr, json.abi, web3.getSigner())
  }, [web3])

  const emeralds = useAsyncMemo(async (signal) => {
    if (!craftereum) return
    const url = github + "artifacts/Emeralds.json"
    const json = await fetchJson(url, signal)
    const addr = await craftereum.emeralds()
    return new Contract(addr, json.abi, web3.getSigner())
  }, [web3, craftereum])

  if (!craftereum || !emeralds)
    return null

  const app = { web3, account, craftereum, emeralds }

  return (<>
    <Account
      {...app} />
    <div className="m-2" />
    {page === "deposit" &&
      <Deposit {...app} />}
    {page === "withdraw" &&
      <Withdraw {...app} />}
    {!page &&
      <BountyKill {...app} />}
  </>)
}

interface AppProps {
  web3: Web3Provider,
  account: string,
  craftereum: Contract,
  emeralds: Contract
}

const Deposit = (props: AppProps) => {
  const { account } = props

  return <div className="bg-white rounded-3xl shadow-lg p-4 w-full max-w-md">
    <div className="text-3xl font-display font-semibold"
      children="Deposit" />
    <div className="text-gray-500"
      children="Deposit some emeralds from your Minecraft account to your wallet." />
    <div className="my-4" />
    <div className="bg-gray-100 p-2 rounded-lg overflow-auto whitespace-nowrap"
      children={`/deposit <amount> ${account}`} />
  </div>
}

const Withdraw = (props: AppProps) => {
  const { web3, craftereum, emeralds, account } = props

  const [amount, setAmount] = useState(0)

  const $player = useState<Player>()
  const [player, setPlayer] = $player

  const [status, setStatus] = useState<Status>()

  const balance = useAsyncMemo(async () => {
    return await emeralds.balanceOf(account)
  }, [emeralds, account])

  useEffect(() => {
    if (!balance) return
    setAmount(balance.toNumber())
  }, [balance])

  const valid = useMemo(() => {
    if (!balance) return false
    if (!player) return false
    if (!amount) return false
    if (amount > balance.toNumber()) return false
    if (status === "loading") return false
    return true
  }, [amount, player, balance, status])

  async function withdraw() {
    try {
      if (!player) return
      setStatus("loading")
      const receipt = await craftereum
        .transfer(player.uuid, amount)
      await receipt.wait()
      setStatus("ok")
    } catch (e: unknown) {
      console.error(e)
      setStatus("error")
    }
  }

  if (!balance) return null

  return <div className="bg-white rounded-3xl shadow-lg p-4 w-full max-w-md">
    <div className="text-3xl font-display font-semibold"
      children="Withdraw" />
    <div className="text-gray-500"
      children="Withdraw some emeralds from your wallet to your Minecraft account." />
    <div className="my-4" />
    <div className="text-lg font-medium"
      children="Amount" />
    <div className="rounded-xl px-4 py-2 bg-gray-100">
      <input className="w-full outline-none bg-transparent"
        type="number"
        min={0}
        max={balance.toNumber()}
        value={amount}
        onChange={e => setAmount(e.target.valueAsNumber)} />
    </div>
    <div className="my-4" />
    <div className="text-lg font-medium"
      children="Player" />
    <PlayerInput
      placeholder="Player"
      $player={$player} />
    <div className="my-4" />
    {valid
      ? <button className="rounded-xl w-full p-2 bg-green-400 hover:bg-green-500 text-white font-bold focus:outline-none focus:ring focus:ring-green-300"
        onClick={withdraw}
        children="Withdraw" />
      : <button className="flex justify-center items-center rounded-xl w-full p-2 bg-green-300 text-white font-bold focus:outline-none cursor-default"
        children={<>{status === "loading" && <Loading className="text-white" />}{"Withdraw"}</>} />}
  </div>
}

const Account = (props: AppProps) => {
  const {
    web3,
    account,
    craftereum,
    emeralds
  } = props

  const balance = useAsyncMemo(async () => {
    return await emeralds.balanceOf(account)
  }, [emeralds, account])

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

  return (
    <div className="bg-green-100 rounded-3xl shadow-lg px-6 py-4 w-full max-w-sm">
      <div className="font-semibold text-black text-opacity-50"
        children="Balance" />
      <div className="flex justify-end items-center">
        <div className="text-4xl"
          children={balance?.toString()} />
        <div className="m-2" />
        <div className="text-4xl font-semibold"
          children={symbol} />
      </div>
      <div className="flex justify-end items-center">
        <div className="text-black text-opacity-50"
          children={gas?.toString()} />
        <div className="m-1" />
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
      </div>
      <div className="m-2" />
      <div className="flex space-x-2">
        <button className="rounded-xl w-full p-2 bg-green-400 hover:bg-green-500 text-white font-medium focus:outline-none focus:ring focus:ring-green-300"
          onClick={visit("withdraw")}
          children="Withdraw" />
        <button className="rounded-xl w-full p-2 bg-green-400 hover:bg-green-500 text-white font-medium focus:outline-none focus:ring focus:ring-green-300"
          onClick={visit("deposit")}
          children="Deposit" />
      </div>
    </div>
  )
}

const Contracts = () => {
  return null
}

const BountyKill = (props: AppProps) => {
  const { web3, craftereum } = props
  const signer = web3.getSigner()

  const $target = useState<Player>()
  const [target, setTarget] = $target

  const [exp, setExp] = useState<string>()

  const [status, setStatus] = useState<Status>()
  const [contract, setContract] = useState<Contract>()

  const expiration = useMemo(() => {
    return new Date(exp ?? 0).getTime()
  }, [exp])

  const factory = useAsyncMemo(async (signal) => {
    const url = github + "artifacts/BountyKill.json"
    const json = await fetchJson(url, signal)
    const { bytecode } = json.data
    return new ContractFactory(json.abi, bytecode, signer)
  }, [])

  async function deploy() {
    try {
      if (!factory) return
      setStatus("loading")
      const contract = await factory
        .deploy(craftereum.address, target?.uuid, expiration)
      await contract.deployed()
      console.log(contract)
      setContract(contract)
      setStatus("ok")
    } catch (e: unknown) {
      setStatus("error")
    }
  }

  const valid = useMemo(() => {
    if (!expiration) return false
    if (status === "loading") return false
    return true
  }, [expiration, status])

  if (!factory) return null

  return (
    <div className="bg-white rounded-3xl shadow-lg p-4 w-full max-w-md">
      <div className="text-3xl font-display font-semibold"
        children="BountyKill" />
      <div className="text-gray-500"
        children="Give the balance to the first player who kills a target." />
      <div className="my-4" />
      <div className="text-lg font-medium"
        children="Target" />
      <PlayerInput
        placeholder="Anyone"
        $player={$target} />
      <div className="my-4" />
      <div className="text-lg font-medium"
        children="Expiration" />
      <div className="rounded-xl px-4 py-2 bg-gray-100">
        <input className="w-full outline-none bg-transparent"
          type="datetime-local"
          onChange={e => setExp(e.target.value)} />
      </div>
      <div className="my-4" />
      {valid
        ? <button className="rounded-xl w-full p-2 bg-green-400 hover:bg-green-500 text-white font-bold focus:outline-none focus:ring focus:ring-green-300"
          onClick={deploy}
          children="DEPLOY!" />
        : <button className="flex justify-center items-center rounded-xl w-full p-2 bg-green-300 cursor-default text-white font-bold focus:outline-none"
          children={<>{status === "loading" && <Loading className="text-white" />}{"DEPLOY!"}</>} />}
    </div>
  )
}