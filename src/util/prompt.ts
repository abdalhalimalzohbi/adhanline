// Minimal readline prompts — interactive subcommands only, never the hot path.
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

export async function ask(question: string, fallback = ""): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const suffix = fallback ? ` [${fallback}]` : "";
    const answer = (await rl.question(`${question}${suffix}: `)).trim();
    return answer || fallback;
  } finally {
    rl.close();
  }
}

export async function confirm(question: string, defaultYes = true): Promise<boolean> {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const answer = (await rl.question(`${question} [${defaultYes ? "Y/n" : "y/N"}]: `))
      .trim()
      .toLowerCase();
    if (!answer) return defaultYes;
    return answer === "y" || answer === "yes";
  } finally {
    rl.close();
  }
}

export async function choose<T extends string>(
  question: string,
  options: readonly T[],
  defaultIndex = 0,
): Promise<T> {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    stdout.write(`${question}\n`);
    options.forEach((opt, i) => {
      stdout.write(`  ${i === defaultIndex ? "*" : " "} ${i + 1}) ${opt}\n`);
    });
    const answer = (await rl.question(`Choice [${defaultIndex + 1}]: `)).trim();
    const idx = answer ? Number(answer) - 1 : defaultIndex;
    return options[idx] ?? options[defaultIndex] ?? options[0]!;
  } finally {
    rl.close();
  }
}
