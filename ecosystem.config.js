module.exports = {
  apps: [
    {
      name: "frontend",
      cwd: "./frontend",
      script: "npm",
      args: "run dev -- -H 0.0.0.0",
      interpreter: "none",
      autorestart: true
    },
    {
      name: "backend-5000",
      cwd: "./backend",
      script: "index.js",
      interpreter: "node",
      autorestart: true
    },
    {
      name: "backend-5001",
      cwd: "./backend2",
      script: "index.js",
      interpreter: "node",
      autorestart: true
    },
    {
      name: "go2rtc",
      cwd: "./streamserver",
      script: "/usr/local/bin/go2rtc",
      args: "-config go2rtc.yaml",
      autorestart: true
    },    
  ]
}