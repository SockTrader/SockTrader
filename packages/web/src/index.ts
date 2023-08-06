import { Worker } from '@socktrader/core';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { UDF } from './lib/udf';

const udf = new UDF();
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.get('/udf/config', async (req, res) => {
  res.status(200).send(await udf.config());
});

app.get('/udf/time', (req, res) => {
  const time = Math.floor(Date.now() / 1000); // In seconds
  res.set('Content-Type', 'text/plain').send(time.toString());
});

app.get('/udf/symbol_info', (req, res) => {
  res.status(200).send(udf.symbolInfo());
});

app.get('/udf/symbols', async (req, res) => {
  res.status(200).send(await udf.symbol(req.query['symbol'] as string));
});

app.get('/udf/search', async (req, res) => {
  res
    .status(200)
    .send(
      await udf.search(
        req.query['query'] as string,
        req.query['type'] as string,
        req.query['exchange'] as string,
        parseInt(req.query['limit'] as string)
      )
    );
});

app.get('/udf/history', async (req, res) => {
  res
    .status(200)
    .send(
      await udf.history(
        req.query['symbol'] as string,
        parseInt(req.query['from'] as string),
        parseInt(req.query['to'] as string),
        req.query['resolution'] as string,
        parseInt(req.query['countback'] as string)
      )
    );
});

app.post('/run-strategy', (req, res) => {
  const strategy = req.body?.strategy;
  try {
    const worker = new Worker();
    worker.run(strategy);
  } catch (e) {
    console.error(e);
  }

  res.status(200).send('hello world');
});

app.listen(3001, () => {
  console.log('Server started. Listening on: 3001');
});
