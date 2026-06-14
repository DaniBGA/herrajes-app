const path = require('node:path');

const serverRoot = __dirname;

module.exports = {
  apps: [
    {
      name: 'herrajes-api',
      script: path.join(serverRoot, 'src', 'index.js'),
      cwd: serverRoot,
      instances: 1,
      exec_mode: 'fork',
      env_file: path.join(serverRoot, '.env'),
      env: {
        NODE_ENV: 'production',
        FRONTEND_DIST_DIR: path.resolve(serverRoot, '..', 'dist')
      }
    }
  ]
};