import { config } from '@socktrader/core'
import { createServer } from '@socktrader/web'
import { CommandBuilder } from 'yargs'

export const command: string = 'web'
export const desc: string = 'Start SockTrader web API'
export const builder: CommandBuilder = {
  detach: {
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
  createServer(argv.port)
}
