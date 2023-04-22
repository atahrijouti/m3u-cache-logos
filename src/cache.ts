import { promises as fs } from "fs"

const program = async () => {
  await fs.writeFile('output/test.txt', "it works")
}

program().catch(console.error)
