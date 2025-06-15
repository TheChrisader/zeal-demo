module.exports = {
  apps: [
    {
      name: "zeal-news",
      script: "node_modules/.bin/next",
      args: "start",
      // Tell PM2 to fork the app for each available CPU core
      instances: "max",
      exec_mode: "cluster",
      // Optional: auto-restart if the app crashes
      autorestart: true,
      watch: false,
      max_memory_restart: "1G", // Optional: restart if it exceeds 1GB memory
    },
  ],
};
