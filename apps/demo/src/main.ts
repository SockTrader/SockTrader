import { TestStrategy } from './strategies/testStrategy'

process.env.NODE_CONFIG_DIR = __dirname + '/env'

const strategy = new TestStrategy()
strategy.onStart()
