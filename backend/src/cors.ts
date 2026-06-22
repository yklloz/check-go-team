export const isAllowedOrigin = (origin?: string) => {
  if (!origin) return true;

  const configuredOrigins = (process.env.FRONTEND_ORIGIN ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (
    configuredOrigins.includes(origin) ||
    origin === 'http://localhost:5173' ||
    origin === 'http://127.0.0.1:5173' ||
    origin === 'https://check-go-app.vercel.app'
  ) {
    return true;
  }

  try {
    const { hostname, protocol } = new URL(origin);
    return (
      (protocol === 'https:' &&
        hostname.startsWith('check-go-') &&
        hostname.endsWith('-ykllozs-projects.vercel.app')) ||
      (protocol === 'https:' && hostname.endsWith('.ngrok-free.app')) ||
      (protocol === 'https:' && hostname.endsWith('.ngrok.io'))
    );
  } catch {
    return false;
  }
};
