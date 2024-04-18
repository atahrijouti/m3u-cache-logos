import { promises as fs } from "fs"
import {
  buildLogoDict,
  fileFromBase64,
  parseM3UPlaylist,
  run_command,
  sanitizeFileName,
} from "./utils"

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
    }),
  )

  const playlist = await parseM3UPlaylist()

  playlist.medias.forEach((media) => {
    const id = sanitizeFileName(media.attributes["tvg-name"] ?? "")
    media.attributes["tvg-logo"] = logoDict[id]
  })

  await fs.writeFile(`output/superbits-local-logos.m3u`, playlist.getM3uString())
}

program().catch(console.error)
