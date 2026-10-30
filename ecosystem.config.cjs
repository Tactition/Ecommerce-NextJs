module.exports = {
  apps: [
    {
      name: "wallstreet-interiors",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "./",
      instances: "max", // or 1 for single instance
      exec_mode: "cluster", // or 'fork' for low-spec VPS (< 1GB RAM)
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      watch: false,
      max_memory_restart: "800M",
      autorestart: true,
      time: true,
      error_file: "logs/pm2-error.log",
      out_file: "logs/pm2-out.log",
      merge_logs: true,
    },
  ],
};

