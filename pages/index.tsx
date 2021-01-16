import { BigNumber } from "https://esm.sh/@ethersproject/bignumber"
import { Contract, ContractFactory } from "https://esm.sh/@ethersproject/contracts"
import { Web3Provider } from "https://esm.sh/@ethersproject/providers"
import React, { useMemo, useState } from 'https://esm.sh/react'
import { AccountCard } from "../components/account.tsx"
import { fetchJson, Status } from "../components/async.tsx"
import { ConnectorPage } from "../components/connector.tsx"
import { sourcify } from "../components/ethers.tsx"
import { Loading } from "../components/icons.tsx"
import { usePath, visit } from "../components/path.tsx"
import { Player, PlayerInfo, PlayerInput, playerOf } from "../components/player.tsx"
import { useAsyncMemo, useLocalStorage } from "../components/react.tsx"

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
      <ConnectorPage
        component={Craftereum} />
    </div>
  )
}

interface AppMemory {
  web3: Web3Provider,
  account: string,
  craftereum: Contract,
  emeralds: Contract,
  balance: BigNumber
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
    return <Loading className="text-white" />

  const app = { web3, account, craftereum, emeralds, balance }

  return (<>
    <AccountCard app={app} />
    <div className="m-2" />
    {page === "deposit" &&
      <DepositPage app={app} />}
    {page === "withdraw" &&
      <WithdrawPage app={app} />}
    {page === "contracts" &&
      <ContractsPage app={app} />}
    {page === "contract" &&
      <ContractPage app={app}
        path={subpath} />}
    {!page &&
      <DeployCard app={app} />}
  </>)
}

const DepositPage = (props: {
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

const WithdrawPage = (props: {
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

const ContractsPage = (props: {
  app: AppMemory
}) => {
  const [contracts, setContracts] =
    useLocalStorage<string[]>("contracts")

  if (!contracts)
    return <div children="You don't have any contract" />

  return <>
    {contracts.map(address =>
      <ContractCard
        address={address}
        {...props} />
    )}
  </>
}

const ContractPage = (props: {
  app: AppMemory
  path: string[]
}) => {
  const { app, path } = props

  const [address, subpath] = path

  return <ContractCard app={app}
    address={address} />
}

const ContractCard = (props: {
  app: AppMemory
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

const DeployCard = (props: {
  app: AppMemory
}) => {
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