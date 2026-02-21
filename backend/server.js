import express from 'express';
import cors from 'cors';
import { initOpenFGA } from './auth/openfgaClient.js';
import { seedTuples } from './auth/seedTuples.js';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  try {
    // Step 1: Initialize OpenFGA client (connect to server, create store, write model)
    console.log('═══════════════════════════════════════════════');
    console.log('  Mini Drive — Starting with OpenFGA SDK');
    console.log('═══════════════════════════════════════════════');

    const { storeId, modelId } = await initOpenFGA();

    // Step 2: Seed relationship tuples to the OpenFGA server
    await seedTuples();

    console.log('═══════════════════════════════════════════════');
    console.log('  OpenFGA Setup Complete');
    console.log(`  Store ID: ${storeId}`);
    console.log(`  Model ID: ${modelId}`);
    console.log('═══════════════════════════════════════════════');

    // Step 3: Start Express server
    app.listen(PORT, () => {
      console.log(`\nBackend server running on http://localhost:${PORT}`);
      console.log('All authorization checks go through OpenFGA SDK → OpenFGA Server\n');
    });
  } catch (err) {
    console.error('\n╔═══════════════════════════════════════════════╗');
    console.error('║  FAILED TO CONNECT TO OPENFGA SERVER          ║');
    console.error('╚═══════════════════════════════════════════════╝');
    console.error(`\nError: ${err.message}\n`);
    console.error('Make sure you have an OpenFGA server running.');
    console.error('You can start one with Docker:\n');
    console.error('  docker pull openfga/openfga');
    console.error('  docker run -p 8080:8080 -p 8081:8081 openfga/openfga run\n');
    console.error('Or set OPENFGA_API_URL in backend/.env to your server URL.\n');
    process.exit(1);
  }
}

start();
