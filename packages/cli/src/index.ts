#!/usr/bin/env node
import { config } from '@socktrader/core'
import { existsSync } from 'fs'
import { join } from 'path'
import { cwd } from 'process'
import yargs from 'yargs'

const cli = yargs
  .commandDir('./lib/commands', { extensions: ['ts', 'js'] })
  .help('h')
  .alias('h', 'help')
  .option('config', {
    alias: 'c',
    string: true,
    desc: 'Socktrader config file (eg.: .socktraderrc or socktrader.json)'
  })
  .check((argv) => {
    if (argv.config) {
      if (existsSync(argv.config)) return true
      throw new Error(`Config file '${argv.config}' not found`)
    }

    return true;
  })
  .middleware((argv) => {
    if (argv.config) {
      argv.config = join(cwd(), argv.config)
      config.add('file', { file: argv.config })
    }
  })
  .updateStrings({
    'Commands:': 'SockTrader CLI\n\nCommands:\n'
  })
  .parserConfiguration({
    'dot-notation': true,
    'camel-case-expansion': true,
    'short-option-groups': true,
    'parse-numbers': true,
    'parse-positional-numbers': true,
    'boolean-negation': true,
    'sort-commands': true,
    'combine-arrays': true
  })
  .scriptName('socktrader')
  .demandCommand()
  .recommendCommands()
  .strict()
  .wrap(yargs.terminalWidth())

config.argv(cli)
