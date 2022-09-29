import {
  Low, LowSync, JSONFileSync, Memory,
} from 'lowdb';
import config from '../config.js';

export const getDb = async () => {
  return initDb()
}


function initDb() {
  let db;
  let adapter;

  adapter = new JSONFileSync('./db/db.json');
  db = new LowSync(adapter);
  db.read();

  return db;
}

export default initDb();
