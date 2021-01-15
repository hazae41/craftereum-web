import { DependencyList, Dispatch, SetStateAction, useEffect, useMemo, useState } from 'https://esm.sh/react'

export type State<S> = [S, Dispatch<SetStateAction<S>>]

export function useAsyncMemo<T>(
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

export function useUpdate<T>(f: () => T): [T, () => void] {
  const [state, setState] = useState(f)
  return [state, () => setState(f())]
}

export function usePath() {
  const [path, update] = useUpdate(() => {
    return window.location.hash.substr(1).split("/")
  })

  useEffect(() => {
    window.onhashchange = () => update()
    return () => { window.onhashchange = null }
  }, [])

  return path
}

export function visit(path: string) {
  return () => { window.location.hash = path }
}