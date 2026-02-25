import { TestStrategy } from './strategies/testStrategy';

console.log('Run test strategy');

const strategy = new TestStrategy();
strategy.onStart();
