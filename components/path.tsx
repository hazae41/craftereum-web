/// <reference lib="dom" />

import { useEffect } from 'https://esm.sh/react'
import { useUpdate } from "./react.tsx"

export function usePath() {
  const [path, update] = useUpdate(() => {
    return window.location.hash.split("/").slice(1)
  })

  useEffect(() => {
    window.onhashchange = () => update()
    return () => { window.onhashchange = null }
  }, [])

  return path
}

export function visit(path: string) {
  let current = window.location.hash.substr(1)
  if (!current.endsWith("/")) current += "/"
  const url = new URL(path, "http://none.com" + current)
  window.location.hash = url.pathname
}