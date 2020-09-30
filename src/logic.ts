import {ActionContext} from './action-context'
import {getInput} from '@actions/core'
import fetch from 'node-fetch'
import {writeFileSync} from 'fs'
import {execSync} from 'child_process'
import {inspect} from 'util'

const CI_URL = 'https://ci.appveyor.com/api'

export async function isMergable(actionContext: ActionContext): Promise<void> {
  try {
    const projectUrl = getInput('projectUrl')
    if (!projectUrl) throw Error('API call requires auth token')

    const jobName = getInput('jobName').toLowerCase()

    const projectRequest = await fetch(`${CI_URL}/projects/${projectUrl}`)

    const response = await projectRequest.json()
    const jobs: {name: string; jobId: string}[] = response.build.jobs

    actionContext.debug(inspect(jobs, true, 10, false))

    const relevantJobs = jobName
      ? jobs.filter(job => job.name && job.name.toLowerCase() === jobName)
      : jobs

    if (relevantJobs.length === 0)
      throw Error(`No relevant Jobs: ' + ${relevantJobs.join(',')}`)

    const jobId = relevantJobs[0].jobId

    actionContext.debug(jobId)

    const artifacts = await fetch(
      `https://ci.appveyor.com/api/buildjobs/${jobId}/artifacts`
    )

    const artifactResponse: {
      name: string
      fileName: string
    }[] = await artifacts.json()

    actionContext.debug(inspect(artifactResponse, true, 10, false))

    const fileName = artifactResponse
      .filter(
        artifact => artifact.name && artifact.name.toLowerCase() === 'release'
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

    actionContext.debug(`wrote ${fileName} to disk`)

    execSync(`7z x -ooutput ${fileName} -r -aoa`)

    actionContext.debug('wrote to disk')
  } catch (error) {
    actionContext.setFailed(error.message)
  }
}
