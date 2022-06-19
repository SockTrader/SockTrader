import { CommandBuilder } from 'yargs'

export const command: string = 'run <strategy>'
export const desc: string = 'Execute a strategy'
export const builder: CommandBuilder = (yargs) => {
  yargs
    .positional('strategy', {
      desc: 'Path to strategy that will be executed',
      type: 'string',
      alias: 's'
    })

  yargs.example('$0 run ./apps/demo/src/strategies/localMovingAverageStrategy.ts', 'Executes the moving average strategy on a local exchange in the demo app.')

  return yargs
}
export const handler = (argv: any) => {
  console.log(argv)
}
