import type { SampleProgram } from '../types/sample'
import helloWorld from './samples/hello_world.json'
import keylogger from './samples/keylogger.json'
import shellcode from './samples/shellcode.json'
import rootkit from './samples/rootkit.json'

export const SAMPLES: Record<string, SampleProgram> = {
  hello_world: helloWorld as SampleProgram,
  keylogger: keylogger as SampleProgram,
  shellcode: shellcode as SampleProgram,
  rootkit: rootkit as SampleProgram,
}

export const SAMPLE_IDS = Object.keys(SAMPLES) as Array<keyof typeof SAMPLES>
