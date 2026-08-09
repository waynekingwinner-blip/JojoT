/* ============================================================
   photos.ts — real progress pictures.

   Storage: 75 days of base64 would blow the localStorage quota,
   so on device the JPEG lands on disk via Filesystem and the app
   state only keeps a short reference.

   A reference is one of:
     '#d2d2d2'          legacy mood-tone from before the camera
                        existed — still rendered as an abstract tile
     'file:day-7.jpeg'  a real photo in Directory.Data/photos
     'mem:ab12'         a web-preview photo, session-only (dev)
   ============================================================ */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { Capacitor } from '@capacitor/core'

const DIR = 'photos'

export type PhotoSource = 'camera' | 'library'

/** Session-only store backing 'mem:' refs in the browser. */
const memory = new Map<string, string>()

export function isTone(ref: string): boolean {
  return ref.startsWith('#')
}

/**
 * Open the camera or photo library and persist the result.
 * Returns a reference to store in state, or null if the user cancelled.
 */
export async function capturePhoto(source: PhotoSource, day: number): Promise<string | null> {
  const native = Capacitor.isNativePlatform()

  let photo
  try {
    photo = await Camera.getPhoto({
      quality: 72,
      width: 1400,
      correctOrientation: true,
      allowEditing: false,
      resultType: native ? CameraResultType.Base64 : CameraResultType.DataUrl,
      source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
    })
  } catch {
    // getPhoto rejects on cancel as well as on a denied permission
    return null
  }

  if (!native) {
    const dataUrl = photo.dataUrl
    if (!dataUrl) return null
    const id = `mem:${day}-${memory.size.toString(36)}`
    memory.set(id, dataUrl)
    return id
  }

  const base64 = photo.base64String
  if (!base64) return null

  const name = `day-${day}.${photo.format || 'jpeg'}`
  await Filesystem.writeFile({
    path: `${DIR}/${name}`,
    data: base64,
    directory: Directory.Data,
    recursive: true,
  })
  return `file:${name}`
}

/**
 * Resolve a reference to something an <img src> can display.
 * Async because Filesystem.getUri is async on device.
 */
export async function resolvePhoto(ref: string): Promise<string | null> {
  if (isTone(ref)) return null

  if (ref.startsWith('mem:')) return memory.get(ref) ?? null

  if (ref.startsWith('file:')) {
    const name = ref.slice('file:'.length)
    try {
      const { uri } = await Filesystem.getUri({ path: `${DIR}/${name}`, directory: Directory.Data })
      return Capacitor.convertFileSrc(uri)
    } catch {
      return null
    }
  }

  return null
}

/** Delete the file behind a reference. Safe to call on tones and misses. */
export async function deletePhoto(ref: string): Promise<void> {
  if (!ref.startsWith('file:')) {
    memory.delete(ref)
    return
  }
  try {
    await Filesystem.deleteFile({
      path: `${DIR}/${ref.slice('file:'.length)}`,
      directory: Directory.Data,
    })
  } catch {
    /* already gone */
  }
}

/**
 * Read a stored photo back as a data URL — needed by the share card,
 * which draws into a canvas and cannot use a capacitor:// src.
 */
export async function photoDataUrl(ref: string): Promise<string | null> {
  if (isTone(ref)) return null
  if (ref.startsWith('mem:')) return memory.get(ref) ?? null

  if (ref.startsWith('file:')) {
    const name = ref.slice('file:'.length)
    try {
      const { data } = await Filesystem.readFile({
        path: `${DIR}/${name}`,
        directory: Directory.Data,
      })
      const ext = name.split('.').pop() || 'jpeg'
      return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${data as string}`
    } catch {
      return null
    }
  }
  return null
}
