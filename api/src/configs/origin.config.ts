// Build allowed origins from env, with sensible localhost defaults for dev
const fromEnv = (Bun.env.ALLOWED_ORIGINS?.split(',') || [])
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => {
        if (origin.startsWith('regex:')) {
            const regexPattern = origin.replace('regex:', '');
            return new RegExp(regexPattern);
        }
        return origin;
    });

const localhostDefaults: (string | RegExp)[] = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
];

export const allowedOrigins = fromEnv.length > 0 ? fromEnv : localhostDefaults;