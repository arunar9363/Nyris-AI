require('dotenv').config({ path: ['.env.local', '.env'] });
const app = require('./app');
const connectDB = require('./config/database');

const port = Number(process.env.PORT || 5050);
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

async function start() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    throw new Error('Set MONGODB_URI and JWT_SECRET before starting Nyris.');
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }
  await connectDB();
  const server = app.listen(port, host, () => console.log(`Nyris API listening on ${host}:${port}`));
  server.on('error', (error) => {
    console.error(`Nyris could not bind to ${host}:${port} (${error.code || error.name}).`);
    process.exit(1);
  });
}

start().catch((error) => {
  console.error(`Nyris startup failed. ${error.message}`);
  process.exit(1);
});
