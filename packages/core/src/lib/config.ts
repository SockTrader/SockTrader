import nconf from 'nconf'
import { join } from 'path'
import { cwd } from 'process'

// 1. `process.env`
nconf.env({
  lowercase: true,
  parseValues: true,
  separator: '_',
  transform: (obj: any) => ({ ...obj, key: obj.key.toLowerCase() })
})

// 2. `process.argv`
nconf.argv({
  parseValues: true,
  separator: '_'
})

// @TODO add configurable config file
//nconf.file('user', join(cwd(), '.socktraderrc'))

// 3. Values in `config.json`
nconf.file(join(cwd(), 'socktrader.json'))
nconf.file(join(cwd(), '.socktraderrc'))

//
// 5. Any default values
//
nconf.defaults({
  database: {
    name: 'socktrader',
    username: 'socktrader',
    password: 'socktrader',
    host: 'localhost',
    port: 5432,
  },
  exchanges: {
    binanceLocal: {
      httpBase: 'http://localhost:8000',
      wsBase: 'http://localhost:8000'
    },
    binance: {
      wsBase: '',
      apiSecret: '',
      apiKey: ''
    },
    local: {
      slippage: 0,
      feeMaker: 0.001,
      feeTaker: 0.001
    }
  },
  debug: 'info'
})

export const config = nconf
