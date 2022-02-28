import { Pool, QueryResultRow, QueryResult } from 'pg';
import config from 'config';

const pool = new Pool({
  host: config.get('database.host'),
  user: config.get('database.username'),
  database: config.get('database.database'),
  password: config.get('database.password'),
  port: config.get('database.port'),
});

//eslint-disable-next-line
export const query = <R extends QueryResultRow = any, I extends any[] = any[]>(text: string, params?: I): Promise<QueryResult<R>> => {
  return pool.query(text, params);
};
