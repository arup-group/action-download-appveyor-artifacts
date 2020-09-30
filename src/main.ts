import {debug, setFailed, getInput, setOutput} from '@actions/core'
import {context} from '@actions/github'
import {isMergable} from './logic'

async function run(): Promise<void> {
  try {
    debug('start action')
    debug('attempt to run action')
    await isMergable({
      debug,
      setFailed,
      getInput,
      setOutput,
      context
    })
  } catch (error) {
    setFailed(error.message)
  }
}

run()
