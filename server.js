import config from './config.js';
import app from './app.js';
const { port } = config;

app.listen(port, () => {
  console.log('Server listening to port', port);
});
