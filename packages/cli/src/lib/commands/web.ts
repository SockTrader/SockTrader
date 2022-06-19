import { config } from '@socktrader/core'
import { forkServer } from '@socktrader/web'
import { CommandBuilder } from 'yargs'

export const command: string = 'web'
export const desc: string = 'Start SockTrader web API'
export const builder: CommandBuilder = {
  detached: {
    boolean: true,
    alias: 'd',
    desc: 'Start in detached mode'
  },
  port: {
    number: true,
    alias: 'p',
    desc: 'Server port'
  }
}
export const handler = (argv: any) => {
  console.log(argv, config.get('database'))

  if (argv.detached) {
    console.log('start detached server')
    forkServer(argv.port) // @todo finish me..
  } else {
    console.log('start server')
    //createServer(argv.port)
  }
}
