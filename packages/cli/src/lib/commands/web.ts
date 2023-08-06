import { Command, Option } from 'commander';

export const web = new Command('web')
  .addOption(new Option('-d, --detach', 'Run in detached / background mode'))
  .action(() => {
    console.log('start web!');
  });
