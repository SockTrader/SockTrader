#!/usr/bin/env node
import { Command } from 'commander';
import { version } from '../package.json';
import { run } from './lib/commands/run';
import { web } from './lib/commands/web';

const program = new Command('socktrader');

program.version(version).addCommand(run).addCommand(web);

program.parse(process.argv);
