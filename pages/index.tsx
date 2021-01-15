import { Contract, ContractFactory } from "https://esm.sh/@ethersproject/contracts"
import { Network, Web3Provider } from "https://esm.sh/@ethersproject/providers"
import Jazzicon from "https://esm.sh/@metamask/jazzicon"
import React, { DependencyList, useEffect, useMemo, useState } from 'https://esm.sh/react'
import { BigNumber } from "https://cdn.esm.sh/v13/@ethersproject/bignumber@5.0.12/lib/bignumber.d.ts"
import { fetchJson, Status } from "../components/async.tsx"
import { Loading } from "../components/icons.tsx"
import { Player, PlayerInfo, PlayerInput, playerOf } from "../components/player.tsx"
import { MetamaskButton, MetamaskConnector, useEthereum } from "../components/providers/metamask.tsx"
import { WCButton } from "../components/providers/walletconnect.tsx"
import { useAsyncMemo, useLocalStorage, usePath, visit } from "../components/react.tsx"
import { sourcify } from "../components/ethers.tsx"

const github = "https://raw.githubusercontent.com/saurusmc/craftereum/master/"

export default function Home() {
  return (
    <div className="flex flex-col items-center container mx-auto p-4">
      <div className="flex flex-col items-center">
        <div className="text-6xl sm:text-8xl text-white font-mono font-semibold tracking-wide cursor-pointer"
          onClick={() => visit("/")}
          children="CRAFTΞRΞUM" />
        <div className="text-xl sm:text-3xl text-white text-opacity-60 font-medium"
          children="Saurus International Server" />
      </div>
      <div className="m-2" />
      <Connector />
    </div>
  )
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

  const balance: BigNumber = useAsyncMemo(async () => {
    if (!emeralds) return
    return await emeralds.balanceOf(account)
  }, [emeralds, account])

  if (!craftereum || !emeralds || !balance)
    return null

  const app = { web3, account, craftereum, emeralds, balance }

  return (<>
    <Account app={app} />
    <div className="m-2" />
    {page === "deposit" &&
      <Deposit app={app} />}
    {page === "withdraw" &&
      <Withdraw app={app} />}
    {page === "contracts" &&
      <Contracts app={app} />}
    {page === "contract" &&
      <ContractPage app={app}
        path={subpath} />}
    {!page &&
      <BountyKill app={app} />}
  </>)
}

interface AppProps {
  app: AppMemory
}

interface AppMemory {
  web3: Web3Provider,
  account: string,
  craftereum: Contract,
  emeralds: Contract,
  balance: BigNumber
}

const Deposit = (props: AppProps) => {
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
    <div className="rounded-xl px-4 py-2 bg-gray-100">
      <input className="w-full outline-none bg-transparent"
        type="number"
        min={0}
        value={amount}
        onChange={e => setAmount(e.target.valueAsNumber)} />
    </div>
    <div className="my-4" />
    <div className="text-lg font-medium"
      children="Command" />
    <div className="text-gray-500"
      children="Copy and paste this command in Minecraft" />
    <div className="bg-gray-100 p-2 rounded-lg overflow-auto whitespace-nowrap">
      <input
        readOnly
        className="w-full outline-none bg-transparent"
        onFocus={e => (e.target as any).select()}
        value={`/deposit ${amount} ${account}`} />
    </div>
  </div>
}

const Withdraw = (props: AppProps) => {
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
      children="Amount" />
    <div className="rounded-xl px-4 py-2 bg-gray-100">
      <input className="w-full outline-none bg-transparent"
        type="number"
        min={0}
        max={balance}
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

  return (
    <div className="bg-green-100 rounded-3xl shadow-lg px-6 py-4 w-full max-w-sm">
      <div className="font-semibold text-gray-500"
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
          onClick={() => visit("/withdraw")}
          children="Withdraw" />
        <button className="rounded-xl w-full p-2 bg-green-400 hover:bg-green-500 text-white font-medium focus:outline-none focus:ring focus:ring-green-300"
          onClick={() => visit("/deposit")}
          children="Deposit" />
      </div>
    </div>
  )
}

const Contracts = (props: AppProps) => {
  const [contracts, setContracts] =
    useLocalStorage<string[]>("contracts")

  if (!contracts)
    return <div children="You don't have any contract" />

  return <>
    {contracts.map(address =>
      <ContractDisplay
        address={address}
        {...props} />
    )}
  </>
}

const ContractPage = (props: AppProps & {
  path: string[]
}) => {
  const { app, path } = props

  const [address, subpath] = path

  return <ContractDisplay app={app}
    address={address} />
}

const ContractDisplay = (props: AppProps & {
  address: string
}) => {
  const { app: { web3, emeralds }, address } = props
  const signer = web3.getSigner()

  const contract = useAsyncMemo(async (signal) => {
    const url = github + "artifacts/BountyKill.json"
    const json = await fetchJson(url, signal)
    return new Contract(address, json.abi, signer)
  }, [address])

  const bytecode = useAsyncMemo(async () => {
    return await web3.getCode(address)
  }, [address])

  const verified = useAsyncMemo(async (signal) => {
    if (!bytecode) return false
    const url = github + "artifacts/BountyKill.json"
    const json = await fetchJson(url, signal)
    const code = "0x" + json.data.deployedBytecode.object
    return bytecode === code
  }, [bytecode])

  const opensource = useAsyncMemo(async (signal) => {
    return await sourcify(address, signal) === "perfect"
  }, [address])

  const issuer = useAsyncMemo(async () => {
    if (!contract) return
    return await contract.issuer()
  }, [contract])

  const balance = useAsyncMemo(async () => {
    if (!contract) return
    return await emeralds.balanceOf(address)
  }, [contract])

  const symbol = useAsyncMemo(async () => {
    return await emeralds.symbol()
  }, [emeralds])

  const target = useAsyncMemo(async (signal) => {
    if (!contract) return
    const id = await contract.targetPlayer()
    return await playerOf(id, signal)
  }, [contract])

  const expiration = useAsyncMemo(async (signal) => {
    if (!contract) return
    const time = await contract.expirationTime()
    return new Date(time.toNumber())
  }, [contract])

  const expired = useMemo(() => {
    if (!expiration) return false
    return expiration < new Date()
  }, [expiration])

  if (!contract) return <Loading className="text-white" />

  return <div className="bg-white rounded-3xl shadow-lg p-4 w-full max-w-md">
    <div className="flex justify-between items-center">
      <div className="text-3xl font-display font-semibold"
        children="BountyKill" />
      {expired
        ? <div className="text-xl font-display text-red-500" children="Expired" />
        : <div className="text-xl font-display text-green-500" children="Active" />}
    </div>
    <div className="text-gray-500"
      children="Give the balance to the first player who kills a target." />
    <div className="my-4" />
    <div className="flex justify-end items-center">
      <div className="text-4xl"
        children={balance?.toString()} />
      <div className="m-2" />
      <div className="text-4xl font-semibold"
        children={symbol} />
    </div>
    <div className="my-4" />
    <div className="text-lg font-medium"
      children="Address" />
    <div children={address} />
    {verified
      ? <div className="text-green-500" children="Verified bytecode" />
      : <div className="text-red-500" children="Unverified bytecode" />}
    {/* {opensource
      ? <div className="text-green-500" children="Source code available" />
      : <div className="text-red-500" children="Source code not available" />} */}
    <div className="my-4" />
    <div className="text-lg font-medium"
      children="Issuer" />
    <div children={issuer} />
    <div className="my-4" />
    <div className="text-lg font-medium"
      children="Expiration" />
    <div children={expiration?.toLocaleString()} />
    <div className="my-4" />
    <div className="text-lg font-medium"
      children="Target" />
    {target &&
      <PlayerInfo player={target} />}
  </div>
}

const BountyKill = (props: AppProps) => {
  const { web3, craftereum } = props.app
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
        .deploy(craftereum.address, target?.id, expiration)
      await contract.deployed()
      setContract(contract)
      setStatus("ok")
      visit("/contract/" + contract.address)
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