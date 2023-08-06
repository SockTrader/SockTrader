import { Worker } from '@socktrader/core';
import { Command, Option } from 'commander';

export const run = new Command('run')
  .addOption(
    new Option(
      '-s, --strategy <name>',
      'filename or path to a strategy file'
    ).makeOptionMandatory(true)
  )
  .action(({ strategy }) => {
    try {
      const worker = new Worker();
      worker.run(strategy);
    } catch (e) {
      console.error(e);
    }
  });
