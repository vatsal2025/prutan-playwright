import * as fs from 'fs';
import * as net from 'net';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { execSync } from 'child_process';

/** Ordered list of candidate paths per platform */
function candidatePaths(): string[] {
  const appName = process.platform === 'win32' ? 'Prutan.exe' : 'Prutan';

  if (process.platform === 'win32') {
    const local  = process.env['LOCALAPPDATA'] ?? '';
    const pf64   = process.env['ProgramFiles'] ?? 'C:\\Program Files';
    const pf86   = process.env['ProgramFiles(x86)'] ?? 'C:\\Program Files (x86)';
    const appData = process.env['APPDATA'] ?? '';
    return [
      path.join(local,   'Programs', 'Prutan', appName),
      path.join(pf64,    'Prutan',   appName),
      path.join(pf86,    'Prutan',   appName),
      path.join(appData, 'Local', 'Programs', 'Prutan', appName),
    ];
  }

  if (process.platform === 'darwin') {
    return [
      '/Applications/Prutan.app/Contents/MacOS/Prutan',
      `${process.env['HOME'] ?? ''}/Applications/Prutan.app/Contents/MacOS/Prutan`,
    ];
  }

  // Linux
  return [
    '/usr/bin/prutan',
    '/usr/local/bin/prutan',
    '/opt/Prutan/prutan',
    '/opt/prutan/prutan',
  ];
}

/** Try to find the Prutan binary via env override, common paths, or PATH lookup */
export function findPrutanApp(envOverride?: string): string | null {
  if (envOverride && fs.existsSync(envOverride)) return envOverride;
  if (envOverride) {
    console.warn(`[desktop] PRUTAN_APP_PATH set to "${envOverride}" but file not found`);
  }

  const found = candidatePaths().find(p => fs.existsSync(p));
  if (found) return found;

  // Last resort: check PATH via which/where
  try {
    const cmd = process.platform === 'win32' ? 'where Prutan' : 'which prutan';
    const result = execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().split('\n')[0];
    if (result && fs.existsSync(result)) return result;
  } catch {
    // not in PATH — that's fine
  }

  return null;
}

/** Check if a TCP port is accepting connections */
export function isPortOpen(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise(resolve => {
    const sock = new net.Socket();
    sock.setTimeout(1000);
    sock.on('connect', () => { sock.destroy(); resolve(true); });
    sock.on('error',   () => { sock.destroy(); resolve(false); });
    sock.on('timeout', () => { sock.destroy(); resolve(false); });
    sock.connect(port, host);
  });
}

/** Poll until the port is open, or timeout */
export async function waitForPort(port: number, timeoutMs = 20_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isPortOpen(port)) return true;
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

/** Launch the Prutan desktop app with CDP enabled. Returns the spawned process. */
export function launchApp(appPath: string, cdpPort: number): ChildProcess {
  const proc = spawn(appPath, [`--remote-debugging-port=${cdpPort}`], {
    detached: true,
    stdio: 'ignore',
    env: process.env,
  });
  proc.unref();
  return proc;
}

/** Kill an app process, using taskkill on Windows to kill the full process tree */
export function killApp(pid: number): void {
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
    } else {
      process.kill(-pid, 'SIGTERM');
    }
  } catch {
    // process may have already exited
  }
}
