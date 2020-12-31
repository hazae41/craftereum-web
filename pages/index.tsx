/// <reference lib="dom" />

import { Contract, ContractFactory } from "https://esm.sh/@ethersproject/contracts"
import { Network, Web3Provider } from "https://esm.sh/@ethersproject/providers"
import Jazzicon from "https://esm.sh/@metamask/jazzicon"
import React, { DependencyList, useEffect, useMemo, useState } from 'https://esm.sh/react'

declare global {
  interface Window {
    ethereum: any
    craftereum: any
    emeralds: any
  }
}

function useAsyncMemo<T>(
  f: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList
) {
  const [value, setValue] = useState<T>()

  useEffect(() => {
    const aborter = new AbortController()
    f(aborter.signal).then(setValue)
    return () => aborter.abort()
  }, deps)

  return value
}

const artifacts = "https://raw.githubusercontent.com/saurusmc/craftereum/master/artifacts/"

async function jsonAt(url: string, signal: AbortSignal) {
  const req = await fetch(url, { signal })
  return await req.json()
}

export default function Home() {
  return (
    <div className="flex flex-col items-center container mx-auto p-4">
      <div className="flex flex-col items-center">
        <div className="text-6xl sm:text-8xl text-white font-mono font-semibold tracking-wide"
          children="CRAFTΞRΞUM" />
        <div className="text-xl sm:text-3xl text-white text-opacity-60 font-medium"
          children="Saurus International Server" />
      </div>
      <div className="m-2" />
      <Connector />
    </div>
  )
}

interface AppMemory {
  web3: Web3Provider
  accounts: string[]
}

function useEthereum() {
  const ethereum = useMemo(() => {
    const ethereum = window.ethereum
    ethereum.autoRefreshOnNetworkChange = false
    return ethereum
  }, [])

  return ethereum
}

function useWeb3(ethereum: any) {
  const web3 = useMemo(() => {
    if (!ethereum) return
    return new Web3Provider(ethereum)
  }, [ethereum])

  return web3
}

function useAccounts(ethereum: any) {
  const [accounts, setAccounts] = useState<string[]>([])

  useEffect(() => {
    if (!ethereum) return
    ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(setAccounts);
    ethereum.on('accountsChanged', setAccounts);
  }, [ethereum])

  return accounts
}

function useNetwork(web3?: Web3Provider) {
  const [network, setNetwork] = useState<Network>()

  useEffect(() => {
    if (!web3) return
    setNetwork(web3.network)
    web3.on('network', setNetwork)
  }, [web3])

  return network
}

const Connector = () => {
  const ethereum = useEthereum()
  const web3 = useWeb3(ethereum)
  const accounts = useAccounts(ethereum)
  const network = useNetwork(web3)

  console.log("web3", web3)
  console.log("accounts", accounts)
  console.log("network", network)

  if (!ethereum)
    return <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-sm">
      <div children="Please use MetaMask" />
    </div>

  if (!web3)
    return <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-sm">
      <div children="An error occured" />
    </div>

  if (!accounts.length)
    return <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-sm">
      <div children="Loading..." />
    </div>

  if (network?.chainId !== 3)
    return <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-sm">
      <div children="Please use the Ropsten Test Network in MetaMask" />
    </div>

  const app: AppMemory = { web3, accounts }

  return (
    <Craftereum app={app} />
  )
}

const Craftereum = (props: {
  app: AppMemory
}) => {
  const { web3, accounts } = props.app
  const [account] = accounts

  const craftereum = useAsyncMemo(async (signal) => {
    const url = artifacts + "Craftereum.json"
    const json = await jsonAt(url, signal)
    const addr = "0x14eb503F3446E6e443935CB75c854c47D9E080da"
    return new Contract(addr, json.abi, web3)
  }, [web3])

  window.craftereum = craftereum

  const emeralds = useAsyncMemo(async (signal) => {
    if (!craftereum) return
    const url = artifacts + "Emeralds.json"
    const json = await jsonAt(url, signal)
    const addr = await craftereum.emeralds()
    return new Contract(addr, json.abi, web3)
  }, [web3, craftereum])

  window.emeralds = emeralds

  const balance = useAsyncMemo(async () => {
    if (!emeralds) return
    return await emeralds.balance()
  }, [emeralds, account])

  const gas = useAsyncMemo(async () => {
    return await web3.getBalance(account)
  }, [account])

  const jazzicon = useMemo(() => {
    if (!account) return
    const slice = account.slice(2, 10)
    const seed = parseInt(slice, 16)
    return Jazzicon(32, seed)
  }, [account])

  console.log("balance", balance)

  if (!craftereum || !emeralds)
    return null

  return (<>
    <div className="bg-green-100 rounded-3xl shadow-lg px-6 py-4 w-full max-w-sm">
      <div className="font-semibold text-black text-opacity-50"
        children="Balance" />
      <div className="flex justify-end items-center">
        <div className="text-4xl"
          children={balance?.toString()} />
        <div className="m-2" />
        <div className="text-4xl font-semibold"
          children="EMRLD" />
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
        <button className="rounded-xl w-full p-2 bg-green-400 hover:bg-green-500 text-white font-medium"
          children="Withdraw" />
        <button className="rounded-xl w-full p-2 bg-green-400 hover:bg-green-500 text-white font-medium"
          children="Deposit" />
      </div>
    </div>
    <div className="m-2" />
    <BountyKill
      web3={web3}
      craftereum={craftereum} />
  </>)
}

const BountyKill = (props: {
  web3: Web3Provider,
  craftereum: Contract
}) => {
  const { web3, craftereum } = props
  const signer = web3.getSigner()

  const [target, setTarget] = useState<string>("")
  const [exp, setExp] = useState<string>()

  const expiration = useMemo(() => {
    return new Date(exp ?? 0).getTime()
  }, [exp])

  const factory = useAsyncMemo(async (signal) => {
    const url = artifacts + "BountyKill.json"
    const json = await jsonAt(url, signal)
    const { bytecode } = json.data
    return new ContractFactory(json.abi, bytecode, signer)
  }, [])

  async function deploy() {
    if (!factory) return

    const contract = await factory
      .deploy(craftereum.address, target, expiration)

    console.log("contract", contract)
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-4 w-full max-w-sm">
      <div className="text-3xl font-display font-semibold"
        children="BountyKill" />
      <div className="text-gray-500"
        children="Give the balance to the first player who kills a target." />
      <div className="h-4" />
      <div className="text-lg font-medium"
        children="Target" />
      <div className="rounded-xl px-4 py-2 bg-gray-100">
        <input className="w-full outline-none bg-transparent"
          placeholder="Anyone"
          onChange={e => setTarget(e.target.value)} />
      </div>
      <div className="h-4" />
      <div className="text-lg font-medium"
        children="Expiration" />
      <div className="rounded-xl px-4 py-2 bg-gray-100">
        <input className="w-full outline-none bg-transparent"
          type="datetime-local"
          onChange={e => setExp(e.target.value)} />
      </div>
      <div className="h-4" />
      <button className="rounded-xl w-full p-2 py-4 bg-green-400 hover:bg-green-500 text-white font-medium"
        onClick={deploy}
        children="Deploy Contract" />
    </div>
  )
}
