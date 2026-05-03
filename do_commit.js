const { execSync } = require('child_process');
execSync('git add -A', { stdio: 'inherit' });
execSync('git commit -m "fix: clean eslint config, add gitignore, move verifyWithVertexAI to global scope"', { stdio: 'inherit' });
console.log('Committed successfully.');
