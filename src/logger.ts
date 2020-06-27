import chalk from "chalk";
import { SingleBar, Presets } from "cli-progress";
import { Progress } from "aws-sdk/lib/request";

const progressBar = new SingleBar(
  {
    format: `Uploading... ${chalk.cyanBright("{bar}")} ${chalk.yellowBright(
      "{percentage}%"
    )} | ETA: {eta}s | {value}/{total}`,
    hideCursor: true
  },
  Presets.shades_classic
);

export const logger = {
  error: (message: string) => {
    console.log(chalk.redBright("Error:", message));
  },
  warn: (message: string) => {
    console.log(chalk.yellowBright("Warning:", message));
  },
  success: (message: string) => {
    console.log(chalk.bold.cyanBright(message));
  },
  startProgressBar: (total: number) => {
    progressBar.start(total, 0);
  },
  updateProgressBar: (progress: Progress) => {
    progressBar.update(progress.loaded);
  },
  stopProgressBar: () => {
    progressBar.stop();
  }
};
