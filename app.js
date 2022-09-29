import bodyParser from 'body-parser';
import appDb, { getDb } from './db/lowdb.js'
import server from 'express';

// handlers
import todolists from './handlers/CTLD/todolists.js';

const app = server();

app.use(server.json());

app.db = appDb
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true,
}));

app.use(async (req, res, next) => {
  req.db = await getDb();
  
  todolists(app);

  return next();
});

app.get('/echo', (req, res) => {
  res.send('Coding Exam');
});

export default app;
