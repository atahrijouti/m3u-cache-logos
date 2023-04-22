import { exec } from "child_process"
import { promisify } from "util"

export const run_command = async (command: string) => {
  try {
    const { stdout, stderr } = await promisify(exec)(command)
    return stderr.length ? stderr : stdout
  } catch (e) {
    return e
  }
}
