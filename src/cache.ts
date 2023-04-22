import { promises as fs } from "fs"
import { M3uParser } from "m3u-parser-generator"
import { M3uMedia } from "m3u-parser-generator/src/m3u-playlist"

const sanitizeFileName = (text: string) => {
    let t = text
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/gi, "_")
    .toLowerCase()
  if(t[0] === "_") {
    t = t.substring(1)
  }
  if(t[t.length - 1] === "_") {
    t = t.substring(0, t.length - 1)
  }
  return t
}
const program = async () => {
  const playlistRaw = await fs.readFile("input/playlist.m3u", {
    encoding: "utf-8",
  })
  const playlist = M3uParser.parse(playlistRaw)
  const dict = playlist.medias.reduce<Record<string, string>>(
    (acc, channel: M3uMedia) => {
      const name = sanitizeFileName(channel.attributes["tvg-name"] ?? "")
      acc[name] = channel.attributes["tvg-logo"] ?? ""
      return acc
    },
    {}
  )
  console.log(dict)
}

program().catch(console.error)
