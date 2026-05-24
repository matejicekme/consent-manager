import { copyFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const targets = [["src/styles.css", "dist/styles.css"]];

for (const [from, to] of targets) {
  await mkdir(dirname(to), { recursive: true });
  await copyFile(from, to);
  console.log(`copied ${from} -> ${to}`);
}
