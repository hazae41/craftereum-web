export function append<T>(value: T, array: T[]) {
  const set = new Set(array)
  set.add(value)
  return Array.from(set)
}

export function remove<T>(value: T, array: T[]) {
  const set = new Set(array)
  set.delete(value)
  return Array.from(set)
}

export function toggle<T>(value: T, array: T[]) {
  const set = new Set(array)

  if (set.has(value))
    set.delete(value)
  else set.add(value)

  return Array.from(set)
}
