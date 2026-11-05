// Compatibilidad con el comando npm start de Progreso 1.
const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const local = path.join(root, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const result = spawnSync(existsSync(local) ? local : 'python', ['app.py'], { cwd: root, stdio: 'inherit' });
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
