const fetch = require('node-fetch')
const { createReadStream, createWriteStream } = require('fs')
const { createGunzip } = require('zlib')
const {spawn} = require('process')
const { execSync } = require('child_process')

async function run() {
  // const artifact = await fetch(
  //   `https://ci.appveyor.com/api/buildjobs/1yeur1ine0bu36bc/artifacts/SpeckleRhino-1.6.10.745-wip.rhi`
  // )
  
  // const file = await artifact.buffer()
  
  // console.log('got file')

  // const file = createReadStream('SpeckleRhino-1.6.10.745-wip.rhi')

  // file.pipe(createGunzip())
  //     .pipe(createWriteStream('folder'))

  execSync(`7z x -ooutput SpeckleRhino-1.6.10.745-wip.rhi -r -aoa`)
}

run()

