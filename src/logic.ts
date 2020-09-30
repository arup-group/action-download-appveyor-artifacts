import {ActionContext} from './action-context'
import {getInput} from '@actions/core'
import fetch from 'node-fetch'
import {writeFileSync} from 'fs'
import {spawn} from 'child_process'

export async function isMergable(actionContext: ActionContext): Promise<void> {
  try {
    const authToken = getInput('authToken')
    const projectUrl = getInput('projectUrl')

    if (!authToken) throw Error('API call requires auth token')

    if (!projectUrl) throw Error('API call requires auth token')

    const projectRequest = await fetch(
      `https://ci.appveyor.com/api/projects/${projectUrl}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    )

    const response = await projectRequest.json()

    const jobId = response.build.jobs[0].jobId

    actionContext.debug(jobId || 'no filename')

    const artifacts = await fetch(
      `https://ci.appveyor.com/api/buildjobs/${jobId}/artifacts`
    )

    const artifactResponse: {
      name: string
      fileName: string
    }[] = await artifacts.json()

    const fileName = artifactResponse
      .filter(artifact => artifact.name.toLowerCase() === 'release')
      .map(artifact => artifact.fileName)
      .pop()

    if (!fileName) throw Error('No File Found')

    actionContext.debug(fileName)

    const artifact = fetch(
      `https://ci.appveyor.com/api/buildjobs/${jobId}/artifacts/${fileName}`
    )

    const file = await (await artifact).buffer()

    writeFileSync(fileName, file)

    spawn(`7z x -ooutput ${fileName} -r -aoa`)

    actionContext.debug('wrote to disk')
  } catch (error) {
    actionContext.setFailed(error.message)
  }
}

// curl "https://ci.appveyor.com/api/buildjobs/1yeur1ine0bu36bc/artifacts/SpeckleRhino-1.6.10.745-wip.rhi"
