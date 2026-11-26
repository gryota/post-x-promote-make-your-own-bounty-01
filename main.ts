// A working post-x-promote-make-your-own-bounty-01 entry (Node 22, standard library only): it copies POST.json from the
// repository root to /output/POST.json, where the gate reads it, and verifies the copied file parses as JSON with a
// string `url` field before finishing. That is all the program has to do. The entry is the post itself: one post of
// your own on X that quotes make.fun's make-your-own-bounty post
// (https://x.com/makefunai/status/2124915864336236646) or links to it, a photo of its own attached, make.fun or the
// @makefunai tag and your play code in its text; POST.json names the post, and the house reads its replies, reposts and
// quotes from X. Nothing this program writes about the post is scored.
//
// The POST.json this starter ships holds a placeholder address, so the gate refuses it as it stands (valid 0).
// Replace it with your post's address before you submit.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(OUTPUT_DIR, { recursive: true });
const outPath = join(OUTPUT_DIR, 'POST.json');
try {
  copyFileSync(join(BOT_DIR, 'POST.json'), outPath);
} catch (err) {
  console.error(`POST.json could not be copied from ${BOT_DIR}: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}

// The gate reads /output/POST.json, so confirm the copy is a JSON object naming one post address.
let postUrl = '';
try {
  const parsed: { url?: unknown } = JSON.parse(readFileSync(outPath, 'utf8'));
  if (typeof parsed !== 'object' || parsed === null || typeof parsed.url !== 'string') {
    throw new Error('POST.json must be a JSON object with a string "url" field');
  }
  postUrl = parsed.url;
} catch (err) {
  console.error(`POST.json is not usable: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}

// The gate reads the post from X, so the address must name an X post, not any other page:
// https://x.com/<handle>/status/<id> (or twitter.com). A non-X address is refused here
// instead of failing silently at the gate.
if (!postUrl.startsWith('https://x.com/') && !postUrl.startsWith('https://twitter.com/')) {
  console.error(`POST.json "url" must start with https://x.com/ or https://twitter.com/, got: ${postUrl}`);
  process.exit(1);
}
if (!postUrl.includes('/status/')) {
  console.error(`POST.json "url" must name an X post (contain /status/), got: ${postUrl}`);
  process.exit(1);
}
