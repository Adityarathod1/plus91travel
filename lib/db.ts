import { Pool } from 'pg';

const pool = new Pool({
    host: 'autorack.proxy.rlwy.net',
    port: 19903,
    database: 'railway',
    user: 'postgres',
    password: 'CZjDVeVZFIUZqnFaHNgNdOjiUfrQNhen',
});

// postgresql://postgres:CZjDVeVZFIUZqnFaHNgNdOjiUfrQNhen@autorack.proxy.rlwy.net:19903/railway

// Test connection and log status
pool.connect()
    .then(client => {
        console.log('✅ PostgreSQL connected successfully to plus_91_travel');
        client.release();
    })
    .catch(err => {
        console.error('❌ PostgreSQL connection failed:', err.message);
    });

export default pool;