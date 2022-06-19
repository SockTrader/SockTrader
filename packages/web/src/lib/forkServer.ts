import { fork } from 'child_process'
import { join } from 'path'

// @todo finish me...
export const forkServer = (port: number = 3000) => {
  const process = join(__dirname, './server.ts')
  console.log('fork child process')
  const p = fork(process, {
    detached: false,
    stdio: 'pipe',
  })

  console.log('process id', p.pid)
}
