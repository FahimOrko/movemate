import { createApp } from './app';
import { env } from './env';

createApp().listen(env.PORT, (error) => {
  if (error) throw error;
  console.info(`API listening on http://localhost:${env.PORT}`);
});
