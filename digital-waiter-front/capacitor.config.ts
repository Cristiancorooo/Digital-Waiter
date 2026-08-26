import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ec.edu.yavirac.digitalwaiter',
  appName: 'Digital Waiter',
  webDir: 'dist/digital-waiter-front/browser',
  server: { androidScheme: 'https' },
};

export default config;
