import { app } from './app.ts';
import { PORT } from './config/env.ts';

const server = app.listen(PORT || 3000, () => {
  console.log(`Test server running at http://localhost:${PORT || 3000}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Test server closed');
    process.exit(0);
  });
});

