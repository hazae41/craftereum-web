import { DependencyList, Dispatch, SetStateAction, useEffect, useState } from 'https://esm.sh/react'

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