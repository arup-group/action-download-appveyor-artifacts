import {Context} from '@actions/github/lib/context'

export interface ActionContext {
  debug: (message: string) => void
  setFailed: (message: string) => void
  getInput: (parameter: string) => string
  setOutput: (name: string, value: string) => void
  context: Context
}
