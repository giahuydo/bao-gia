export default () => ({
  port: parseInt(process.env.PORT || '4001', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'bao_gia',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiration: process.env.JWT_EXPIRATION || '7d',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
});
