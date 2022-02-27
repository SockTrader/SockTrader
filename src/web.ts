import express from 'express';
import Worker from './core/worker/worker';

const app = express();
app.use(express.json());

app.post('/run-strategy', (req, res) => {
  const strategy = req.body?.strategy;
  try {
    const worker = new Worker();
    worker.run(strategy);
  } catch (e) {
    console.error(e);
  }

  res
    .status(200)
    .send('hello world');
});

app.listen(3000);
