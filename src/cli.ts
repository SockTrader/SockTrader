#!/usr/bin/env node
import { Command, Option } from 'commander';
import { version } from '../package.json';
import Worker from './core/worker/worker';

const program = new Command('socktrader');

const runCommand = new Command('run')
  .addOption(new Option('-s, --strategy <name>', 'execute the strategy').makeOptionMandatory(true))
  .action(({ strategy }) => {
    try {
      const worker = new Worker();
      worker.run(strategy);
    } catch (e) {
      console.error(e);
    }
  });

program
  .version(version)
  .addCommand(runCommand);

program.parse(process.argv);
