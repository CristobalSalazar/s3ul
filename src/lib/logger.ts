import chalk from "chalk";
import { SingleBar, Presets } from "cli-progress";
import { Progress } from "aws-sdk/lib/request";

class Logger {
  private progressBar = new SingleBar(
    {
      format: `${chalk.cyanBright("{bar}")} ${chalk.yellowBright(
        "{percentage}%"
      )} | ETA: {eta}s | {value}/{total}`,
      hideCursor: true
    },
    Presets.shades_classic
  );

  createProgressBar(message: string) {
    return new SingleBar(
      {
        format: `${message} ${chalk.cyanBright("{bar}")} ${chalk.yellowBright(
          "{percentage}%"
        )} | ETA: {eta}s | {value}/{total}`,
        hideCursor: true
      },
      Presets.shades_classic
    );
  }

  error(message: string) {
    console.log(chalk.redBright("Error:", message));
  }

  warn(message: string) {
    console.log(chalk.yellowBright("Warning:", message));
  }

  success(message: string) {
    console.log(chalk.bold.cyanBright(message));
  }

  startProgressBar(total: number) {
    this.progressBar.start(total, 0);
  }

  updateProgressBar(progress: Progress) {
    this.progressBar.update(progress.loaded);
  }

  stopProgressBar() {
    this.progressBar.stop();
  }
}

export const logger = new Logger();
