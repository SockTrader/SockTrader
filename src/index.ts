import LocalMovingAverageStrategy from './strategies/localMovingAverageStrategy';

process.env.NODE_CONFIG_DIR = __dirname + '/env';

const strategy = new LocalMovingAverageStrategy();
strategy.onStart();
