import React, { useEffect, useState } from 'https://esm.sh/react'
import { State } from "./react.tsx"
import { Loading, SearchIcon } from "./icons.tsx"
import { cors, Status } from "./async.tsx"

export interface Player {
  avatar: string,
  id: string,
  raw_id: string,
  username: string
}

export async function playerOf(input: string, signal: AbortSignal) {
  const api = "https://playerdb.co/api/player/minecraft/"
  const res = await fetch(cors(api + input), { signal })
  if (!res.ok) throw new Error(res.statusText)

  const json = await res.json()
  return json.data.player as Player
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
      <button className="rounded-xl hover:text-green-500 text-sm font-bold focus:outline-none"
        children={<SearchIcon className="w-5 h-5" />} />
    </div>
    <div className="m-2" />
    {status === "ok" && <PlayerInfo
      player={player!} />}
    {status === "loading" && <div
      className="flex justify-center"
      children={<Loading className="text-black" />} />}
    {status === "error" && <div
      className="text-center font-medium"
      children="Player not found" />}
  </div>
}

export const PlayerInfo = (props: {
  player: Player
}) => {
  const { player } = props

  return <div className="flex px-4 py-2 justify-between items-center rounded-xl bg-gray-100">
    <div>
      <div className="font-medium" children={player.username} />
      <div className="text-sm text-gray-500" children={player.id} />
    </div>
    <img className="rounded-xl"
      style={{ width: 32, height: 32 }}
      src={player.avatar} />
  </div>
}
