import { DependencyList, Dispatch, SetStateAction, useCallback, useEffect, useState } from 'https://esm.sh/react'

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

export function useLocalStorage<T>(key: string): State<T | null> {
  const { localStorage } = window

  const [value, setValue] = useState<T | null>(() => {
    const item = localStorage.getItem(key)
    return item !== null && JSON.parse(item)
  })

  const setValue2 = useCallback((value: SetStateAction<T | null>) => {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))

    setValue(value)
  }, [setValue])

  return [value, setValue2]
}