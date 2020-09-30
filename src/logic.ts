import {ActionContext} from './action-context'
import {getInput} from '@actions/core'
import fetch from 'node-fetch'
import {writeFileSync} from 'fs'
import {execSync} from 'child_process'

const CI_URL = 'https://ci.appveyor.com/api'

export async function isMergable(actionContext: ActionContext): Promise<void> {
  try {
    const projectUrl = getInput('projectUrl')
    if (!projectUrl) throw Error('API call requires auth token')

    const jobName = getInput('jobName').toLowerCase()

    const projectRequest = await fetch(`${CI_URL}/projects/${projectUrl}`)

    const response = await projectRequest.json()

    const jobId = response.build.jobs[0].jobId

    if (!jobId)
      throw Error(`No Jobs found for ${CI_URL}/projects/${projectUrl}`)

    actionContext.debug(jobId)

    const artifacts = await fetch(
      `https://ci.appveyor.com/api/buildjobs/${jobId}/artifacts`
    )

    const artifactResponse: {
      name: string
      fileName: string
    }[] = await artifacts.json()

    const fileName = artifactResponse
      .filter(
        artifact => artifact.name && artifact.name.toLowerCase() === jobName
      )
      .map(artifact => artifact.fileName)
      .pop()

    if (!fileName) throw Error('No File Found')

    actionContext.debug(fileName)

    const artifact = fetch(
      `https://ci.appveyor.com/api/buildjobs/${jobId}/artifacts/${fileName}`
    )

    const file = await (await artifact).buffer()

    writeFileSync(fileName, file)

    execSync(`7z x -ooutput ${fileName} -r -aoa`)

    actionContext.debug('wrote to disk')
  } catch (error) {
    actionContext.setFailed(error.message)
  }
}
