import { promises as fs } from "fs"
import { M3uParser, M3uPlaylist } from "m3u-parser-generator"
import { M3uMedia } from "m3u-parser-generator/src/m3u-playlist"

const sanitizeFileName = (text: string) => {
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
  return t
}

const parseM3UPlaylist = async () => {
  const playlistRaw = await fs.readFile("input/playlist.m3u", {
    encoding: "utf-8",
  })

  return M3uParser.parse(playlistRaw)
}

const buildLogoDict = (playlist: M3uPlaylist) => {
  const dict = playlist.medias.reduce<Record<string, string>>((acc, channel: M3uMedia) => {
    const name = sanitizeFileName(channel.attributes["tvg-name"] ?? "")
    acc[name] = channel.attributes["tvg-logo"] ?? ""
    return acc
  }, {})
}

const program = async () => {}

program().catch(console.error)
