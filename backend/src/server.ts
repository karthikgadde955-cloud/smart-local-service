import app from './app';
import { config } from './config';

const PORT = config.port;

if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Smart Local Service Backend running on http://localhost:${PORT}`);
    console.log(`⚙️  Environment: ${config.nodeEnv}`);
    console.log(`🤖 AI Provider: ${config.aiProvider}\n`);
  });

  process.on('unhandledRejection', (err: any) => {
    console.error('❌ Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });
}

export default app;

