import { useEffect, useState } from 'react'
import { isTone, resolvePhoto } from './photos'

/**
 * Resolve a stored photo reference to a displayable src.
 * Returns null for mood-tone refs (render the abstract tile instead)
 * and while the file URI is still resolving.
 */
export function usePhoto(ref: string | undefined): string | null {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!ref || isTone(ref)) {
      setSrc(null)
      return
    }
    let live = true
    void resolvePhoto(ref).then((s) => {
      if (live) setSrc(s)
    })
    return () => {
      live = false
    }
  }, [ref])

  return src
}
