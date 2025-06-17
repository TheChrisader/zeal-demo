module.exports = {
  apps: [
    {
      name: "zeal-news",
      script: `./node_modules/next/dist/bin/next`,
      args: "start",

      instances: "2",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "2000M", // Optional: restart if it exceeds 1GB memory,
    },
  ],
};
