module.exports = {
  apps: [
    {
      name: 'restaurant-daily',
      script: 'npm',
      args: 'start',
      cwd: '/home/grao/Projects/restaurant-daily',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        VAULT_ADDR: 'http://127.0.0.1:8200',
        VAULT_TOKEN: process.env.VAULT_TOKEN || 'vault-token-from-environment'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        VAULT_ADDR: 'http://127.0.0.1:8200',
        VAULT_TOKEN: process.env.VAULT_TOKEN || 'vault-token-from-environment'
      },
      log_file: '/home/grao/Projects/restaurant-daily/logs/combined.log',
      out_file: '/home/grao/Projects/restaurant-daily/logs/out.log',
      error_file: '/home/grao/Projects/restaurant-daily/logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      merge_logs: true,
      restart_delay: 1000,
      max_restarts: 5,
      min_uptime: '10s',
    }
  ]
};