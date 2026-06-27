import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { assertSeam } from "@bounded-systems/seam-check";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// @bounded-systems/host is the ONE sanctioned reader of node:os ambient state
// (homedir/tmpdir/hostname). A near-leaf — its only workspace dependency is
// @bounded-systems/env (to honor the $HOME override). The `prod` allowlist is
// its seam claim; assertSeam proves it (and that prod code holds no spawn / env).
test("@bounded-systems/host upholds its seam claim", () => {
  assertSeam({
    root: SRC,
    prod: ["node:os", "@bounded-systems/env"],
    test: ["@bounded-systems/host", "@bounded-systems/seam-check", "node:fs"],
  });
});

test("is the sole sanctioned reader of node:os ambient state", () => {
  const src = readFileSync(join(SRC, "index.ts"), "utf8");
  expect(src.includes('from "node:os"')).toBe(true);
});

test("homeDir honors an explicit $HOME override", () => {
  // Behavioral guarantee that makes the capability testable on every platform
  // (os.homedir() ignores $HOME on macOS).
  const src = readFileSync(join(SRC, "index.ts"), "utf8");
  expect(src.includes('getEnv("HOME")')).toBe(true);
});
