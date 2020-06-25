import chalk from "chalk";

export const logger = {
  error: (message: string) => {
    console.log(chalk.redBright("Error:", message));
  },
  warn: (message: string) => {
    console.log(chalk.yellowBright("Warning:", message));
  },
  success: (message: string) => {
    console.log(chalk.greenBright(message));
  }
};
