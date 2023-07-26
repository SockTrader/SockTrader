import { TestStrategy } from './strategies/testStrategy';

process.env.NODE_CONFIG_DIR = __dirname + '/env';

console.log('Run test strategy');

const strategy = new TestStrategy();
strategy.onStart();
