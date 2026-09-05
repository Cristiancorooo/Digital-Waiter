import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ec.edu.yavirac.digitalwaiter',
  appName: 'Digital Waiter',
  webDir: 'dist/digital-waiter-front/browser',
  // La demostración móvil consume la API del computador por HTTP dentro de la
  // misma red Wi-Fi. En producción se reemplazará por un dominio HTTPS.
  server: { androidScheme: 'http', cleartext: true },
  android: { allowMixedContent: true },
};

export default config;
