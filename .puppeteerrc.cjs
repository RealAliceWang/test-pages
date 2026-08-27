const { homedir } = require('node:os');
const { join } = require('node:path');

/**
 * Pin the browser cache to the user's home directory. Without this, a sandboxed
 * run resolves a temporary cache path and fails to find the installed Chrome.
 */
module.exports = {
  cacheDirectory: join(homedir(), '.cache', 'puppeteer'),
};
