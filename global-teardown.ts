import * as fs from 'fs';
import * as path from 'path';
import { killApp } from './support/desktop-launcher';

const DESKTOP_PID_FILE = path.resolve(__dirname, '.desktop-pid');

export default async function globalTeardown() {
  if (!fs.existsSync(DESKTOP_PID_FILE)) return;

  try {
    const pid = parseInt(fs.readFileSync(DESKTOP_PID_FILE, 'utf-8').trim(), 10);
    if (!isNaN(pid)) {
      console.log(`[teardown] Killing desktop app (PID ${pid})`);
      killApp(pid);
    }
    fs.unlinkSync(DESKTOP_PID_FILE);
  } catch (e: any) {
    console.warn('[teardown] Could not kill desktop app:', e.message);
  }
}
