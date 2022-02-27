import { Pool } from 'pg';
import config from 'config';
export const pool = new Pool({
  host: config.get('database.host'),
  user: config.get('database.username'),
  database: config.get('database.database'),
  password: config.get('database.password'),
  port: config.get('database.port'),
});

;(async () => {
  console.log('starting async query');
  const result = await pool.query('SELECT NOW()');
  console.log('async query finished', result);
  console.log('starting callback query');
  pool.query('SELECT NOW()', () => {
    console.log('callback query finished');
  });
  console.log('calling end');
  await pool.end();
  console.log('pool has drained');
})();
