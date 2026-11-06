// Restaura o db.json para os dados iniciais (git checkout do arquivo).
const { execSync } = require('child_process');
execSync('git checkout -- db.json', { stdio: 'inherit', cwd: __dirname + '/..' });
console.log('db.json restaurado para os dados iniciais.');
