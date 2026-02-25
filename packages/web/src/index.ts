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
  try {
    await udf.ready;
    res.status(200).send(await udf.config());
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/udf/time', (req, res) => {
  const time = Math.floor(Date.now() / 1000); // In seconds
  res.set('Content-Type', 'text/plain').send(time.toString());
});

app.get('/udf/symbol_info', async (req, res) => {
  try {
    await udf.ready;
    res.status(200).send(udf.symbolInfo());
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/udf/symbols', async (req, res) => {
  try {
    await udf.ready;
    res.status(200).send(await udf.symbol(req.query['symbol'] as string));
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/udf/search', async (req, res) => {
  try {
    await udf.ready;
    const limit = parseInt(req.query['limit'] as string) || 100;
    res
      .status(200)
      .send(
        await udf.search(
          req.query['query'] as string,
          req.query['type'] as string,
          req.query['exchange'] as string,
          limit
        )
      );
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/udf/history', async (req, res) => {
  try {
    await udf.ready;
    const from = parseInt(req.query['from'] as string) || 0;
    const to =
      parseInt(req.query['to'] as string) || Math.floor(Date.now() / 1000);
    const countBack = parseInt(req.query['countback'] as string) || 300;
    res
      .status(200)
      .send(
        await udf.history(
          req.query['symbol'] as string,
          from,
          to,
          req.query['resolution'] as string,
          countBack
        )
      );
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: 'Internal server error' });
  }
});

const server = app.listen(3001, () => {
  console.log('Server started. Listening on: 3001');
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
