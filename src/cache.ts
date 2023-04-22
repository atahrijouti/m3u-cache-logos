import { promises as fs } from "fs"
import { M3uParser, M3uPlaylist } from "m3u-parser-generator"
import { M3uMedia } from "m3u-parser-generator/src/m3u-playlist"
import { run_command } from "./utils"

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
  return t.substring(0, 50)
}

const parseM3UPlaylist = async () => {
  const playlistRaw = await fs.readFile("input/playlist.m3u", {
    encoding: "utf-8",
  })

  return M3uParser.parse(playlistRaw)
}

const buildLogoDict = (playlist: M3uPlaylist) => {
  return playlist.medias.reduce<Record<string, string>>((acc, channel: M3uMedia) => {
    const name = sanitizeFileName(channel.attributes["tvg-name"] ?? "")
    acc[name] = channel.attributes["tvg-logo"] ?? ""
    return acc
  }, {})
}

const fileFromBase64 = async (encodedImage: string, name: string, ext: string) => {
  let base64Image = encodedImage.split(";base64,").pop() as string
  return await fs.writeFile(`output/${name}.${ext}`, base64Image, { encoding: "base64" })
}

const readFromSample = async () => {
  const sample: Record<string, string> = JSON.parse(
    await fs.readFile("input/sample.json", {
      encoding: "utf-8",
    })
  )

  return sample
}

const downloadImages = async () => {
  const playlist = await parseM3UPlaylist()
  const dict = buildLogoDict(playlist)
  // const dict = await readFromSample()
  const fileDict: Record<string, string> = {}
  let i = 0
  for (const entry of Object.entries(dict)) {
    const [name, url] = entry

    if (url == null || url === "") {
      fileDict[name] = ""
    } else {
      if (url.startsWith("http")) {
        const stdout = (await run_command(`sh download-and-rename.sh "${name}" "${url}"`)) as string
        if (stdout === "COULDNT_FETCH_FILE") {
          fileDict[name] = ""
        } else {
          fileDict[name] = stdout
        }
      } else if (url.startsWith("data:image/png")) {
        await fileFromBase64(url, name, "png")
        fileDict[name] = `${name}.png`
      } else if (url.startsWith("data:image/jpeg")) {
        await fileFromBase64(url, name, "jpeg")
        fileDict[name] = `${name}.jpg`
      }
    }

    console.log(`${String(i++).padStart(4, "0")} ${name} = ${fileDict[name]}`)

    await fs.appendFile("output/log.txt", `${name}=${fileDict[name]}`)
  }

  await fs.appendFile("output/dict.json", JSON.stringify(fileDict, null, 2))
}

const program = async () => {
  const logoDict = JSON.parse(
    await fs.readFile("input/dict.json", {
      encoding: "utf-8",
    })
  )

  const playlist = await parseM3UPlaylist()

  playlist.medias.forEach((media) => {
    const id = sanitizeFileName(media.attributes["tvg-name"] ?? "")
    media.attributes["tvg-logo"] = logoDict[id]
  })

  await fs.writeFile(`output/superbits-local-logos.m3u`, playlist.getM3uString())
}

program().catch(console.error)
