require('dotenv').config({ path: ['.env.local', '.env'] });
const connectDB = require('./config/database');

const port = Number(process.env.PORT || 5050);
const host = process.env.RENDER === 'true' || process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

async function start() {
  const missing = ['MONGODB_URI', 'JWT_SECRET'].filter(name => !process.env[name]?.trim());
  if (missing.length) throw new Error('Missing required environment variables: ' + missing.join(', ') + '.');
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }
  const app = require('./app');
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
