import { DependencyList, Dispatch, SetStateAction, useCallback, useEffect, useState } from 'https://esm.sh/react'

export type State<S> = [S, Dispatch<SetStateAction<S>>]
export type OptionalState<S> = State<S | undefined>

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

export function useLocalStorage<T>(key: string, def: T): State<T> {
  const { localStorage } = window

  const [value, setValue] = useState(() => {
    const item = localStorage.getItem(key)
    if (item === null) return def
    return JSON.parse(item) as T
  })

  const setValue2 = useCallback((value: SetStateAction<T>) => {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))

    setValue(value)
  }, [setValue])

  return [value, setValue2]
}