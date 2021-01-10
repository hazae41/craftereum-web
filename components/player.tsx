import React, { useEffect, useState } from 'https://esm.sh/react'
import { State } from "./react.tsx"
import { SearchIcon } from "./icons.tsx"
import { cors, Status } from "./async.tsx"

export interface Player {
  name: string
  uuid: string
}

export async function playerOf(input: string, signal: AbortSignal) {
  const api = "https://api.mojang.com/users/profiles/minecraft/"
  const res = await fetch(cors(api + input), { signal })
  if (!res.ok) throw new Error(res.statusText)

  const json = await res.json()
  const name = json.name as string
  const id = json.id as string

  const uuid = [
    id.substring(0, 8),
    id.substring(8, 12),
    id.substring(12, 16),
    id.substring(16, 20),
    id.substring(20, 32)
  ].join("-")

  return { name, uuid }
}

export const PlayerInput = (props: {
  placeholder?: string,
  $player: State<Player | undefined>
}) => {
  const { $player, placeholder } = props
  const [player, setPlayer] = $player
  const [input, setInput] = useState<string>()
  const [status, setStatus] = useState<Status>()

  useEffect(() => {
    if (!input) return

    const abort = new AbortController()
    getPlayer(input, abort.signal)

    return () => {
      abort.abort()
      setPlayer(undefined)
      setStatus(undefined)
    }
  }, [input])

  async function getPlayer(input: string, signal: AbortSignal) {
    try {
      setStatus("loading")
      const player =
        await playerOf(input, signal)
      setPlayer(player)
      setStatus("ok")
    } catch (e: unknown) {
      setStatus("error")
    }
  }

  return <div>
    <div className="flex items-center rounded-xl px-4 py-2 bg-gray-100">
      <input className="w-full outline-none bg-transparent"
        placeholder={placeholder}
        onKeyPress={e => e.key === "Enter"
          && setInput(e.currentTarget.value)}
        onBlur={e => setInput(e.target.value)} />
      <button className="rounded-xl text-gray-500 hover:text-green-500 text-sm font-bold"
        children={<SearchIcon className="w-5 h-5" />} />
    </div>
    <div className="m-2" />
    {status === "ok" && <PlayerInfo
      player={player!} />}
    {status === "loading" && <div
      className="text-center font-medium"
      children="Loading..." />}
    {status === "error" && <div
      className="text-center font-medium"
      children="Player not found" />}
  </div>
}

export const PlayerInfo = (props: {
  player: Player
}) => {
  const { player } = props

  const minotar = "https://minotar.net/avatar/"

  return <div className="flex px-4 py-2 justify-between items-center rounded-xl bg-gray-100">
    <div>
      <div className="font-medium" children={player.name} />
      <div className="text-sm text-gray-500" children={player.uuid} />
    </div>
    <img className="rounded-xl"
      style={{ width: 32, height: 32 }}
      src={minotar + player.uuid + "/32"} />
  </div>
}
