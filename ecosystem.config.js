module.exports = {
  apps: [
    {
      name: "zeal-news",
      script: `./node_modules/next/dist/bin/next`,
      args: "start",

      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G", // Optional: restart if it exceeds 1GB memory,
    },
  ],
};
