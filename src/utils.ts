import { promises as fs } from "fs"
import { exec } from "child_process"
import { promisify } from "util"

import { M3uParser, M3uPlaylist } from "m3u-parser-generator"
import { M3uMedia } from "m3u-parser-generator/src/m3u-playlist"

export const run_command = async (command: string) => {
  try {
    const { stdout, stderr } = await promisify(exec)(command)
    return stderr.length ? stderr : stdout
  } catch (e) {
    return e
  }
}

export const sanitizeFileName = (text: string) => {
  let t = text
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/gi, "_")
    .toLowerCase()
  if (t[0] === "_") {
    t = t.substring(1)
  }
  if (t[t.length - 1] === "_") {
    t = t.substring(0, t.length - 1)
  }
  return t.substring(0, 50)
}

export const parseM3UPlaylist = async () => {
  const playlistRaw = await fs.readFile("input/playlist.m3u", {
    encoding: "utf-8",
  })

  return M3uParser.parse(playlistRaw)
}

export const buildLogoDict = (playlist: M3uPlaylist) => {
  return playlist.medias.reduce<Record<string, string>>((acc, channel: M3uMedia) => {
    const name = sanitizeFileName(channel.attributes["tvg-name"] ?? "")
    acc[name] = channel.attributes["tvg-logo"] ?? ""
    return acc
  }, {})
}

export const fileFromBase64 = async (encodedImage: string, name: string, ext: string) => {
  let base64Image = encodedImage.split(";base64,").pop() as string
  return await fs.writeFile(`output/${name}.${ext}`, base64Image, { encoding: "base64" })
}

export const readFromSample = async () => {
  const sample: Record<string, string> = JSON.parse(
    await fs.readFile("input/sample.json", {
      encoding: "utf-8",
    }),
  )

  return sample
}
