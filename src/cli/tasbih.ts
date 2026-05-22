// `tasbih` — interactive counter TUI. Space counts, auto-advances
// 33 → 33 → 34, then shows the closing dua.
import { stdin, stdout } from "node:process";

interface Phase {
  dhikr: string;
  target: number;
}

const PHASES: readonly Phase[] = [
  { dhikr: "سبحان الله", target: 33 },
  { dhikr: "الحمد لله", target: 33 },
  { dhikr: "الله أكبر", target: 34 },
];

const CLOSING =
  "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير";

export async function runTasbih(): Promise<void> {
  if (!stdin.isTTY) {
    stdout.write("tasbih needs an interactive terminal.\n");
    return;
  }

  let phase = 0;
  let count = 0;
  let done = false;

  const draw = () => {
    stdout.write("\x1b[2J\x1b[H\n  ✦ Tasbih ✦\n\n");
    if (done) {
      stdout.write(`  ${CLOSING}\n\n  Tasbih complete — may it be accepted.\n\n  q: quit\n`);
      return;
    }
    const p = PHASES[phase]!;
    const bar = "█".repeat(count) + "░".repeat(p.target - count);
    stdout.write(
      `  ${p.dhikr}    (${phase + 1}/${PHASES.length})\n\n` +
        `  ${count} / ${p.target}\n  ${bar}\n\n` +
        `  space: count   r: reset phase   q: quit\n`,
    );
  };

  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");
  draw();

  return new Promise<void>((resolve) => {
    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeAllListeners("data");
      stdout.write("\n");
      resolve();
    };

    stdin.on("data", (key: string) => {
      if (key === "q" || key === "") return cleanup();
      if (done) return;
      if (key === "r") {
        count = 0;
      } else if (key === " " || key === "\r" || key === "\n") {
        count++;
        if (count >= PHASES[phase]!.target) {
          if (phase < PHASES.length - 1) {
            phase++;
            count = 0;
          } else {
            done = true;
          }
        }
      }
      draw();
    });
  });
}
