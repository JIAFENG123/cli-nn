#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const yargs = require("yargs");
const chalk = require("chalk");
const ora = require("ora");
const { program } = require("commander");
const CHOICES = fs.readdirSync(path.join(__dirname, "../templates"));
program.usage("<command>");

program.version(require("../package").version);

program.parse()
const QUESTIONS = [
  {
    name: "template",
    type: "list",
    message: "What project template would you like to generate?",
    choices: CHOICES,
    when: () => !yargs.argv["template"],
  },
  {
    name: "name",
    type: "input",
    message: "Project name:",
    when: () => !yargs.argv["name"],
    validate: (input) => {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
      else
        return "Project name may only include letters, numbers, underscores and hashes.";
    },
  },
];

//current dir
const CURR_DIR = process.cwd();

inquirer.prompt(QUESTIONS).then((answers) => {
  answers = Object.assign({}, answers, yargs.argv);

  const projectChoice = answers["template"];
  const projectName = answers["name"];
  const templatePath = path.join(__dirname, "../templates", projectChoice);
  const tartgetPath = path.join(CURR_DIR, projectName);
  const templateConfig = getTemplateConfig(templatePath);

  const options = {
    projectName,
    templateName: projectChoice,
    templatePath,
    tartgetPath,
    config: templateConfig,
  };
  if (!createProject(tartgetPath)) {
    return;
  }

  // 出现加载图标
  const spinner = ora("Downloading Files...");
  spinner.start();
  createDirectoryContents(templatePath, projectName, templateConfig);
  spinner.succeed();

  console.log(chalk.green(`completed!`));
  // if (!postProcess(options)) {
  //   return;
  // }

  showMessage(options);
});
function showMessage(options) {
  console.log("");
  console.log(chalk.green("Done."));
  console.log(chalk.green(`Go into the project: cd ${options.projectName}`));

  const message = options.config.postMessage;

  if (message) {
    console.log("");
    console.log(chalk.yellow(message));
    console.log("");
  }
}
function createProject(projectPath) {
  if (fs.existsSync(projectPath)) {
    console.log(
      chalk.red(`Folder ${projectPath} exists. Delete or use another name.`)
    );
    return false;
  }

  fs.mkdirSync(projectPath);
  return true;
}

function getTemplateConfig(templatePath) {
  const configPath = path.join(templatePath, ".template.json");

  if (!fs.existsSync(configPath)) return {};

  const templateConfigContent = fs.readFileSync(configPath);

  if (templateConfigContent) {
    return JSON.parse(templateConfigContent.toString());
  }

  return {};
}

const SKIP_FILES = ["node_modules", ".template.json"];

function createDirectoryContents(templatePath, projectName, config) {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach((file) => {
    const origFilePath = path.join(templatePath, file);

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (SKIP_FILES.indexOf(file) > -1) return;

    if (stats.isFile()) {
      let contents = fs.readFileSync(origFilePath, "utf8");

      //   contents = template.render(contents, { projectName });

      const writePath = path.join(CURR_DIR, projectName, file);
      fs.writeFileSync(writePath, contents, "utf8");
    } else if (stats.isDirectory()) {
      fs.mkdirSync(path.join(CURR_DIR, projectName, file));

      // recursive call
      createDirectoryContents(
        path.join(templatePath, file),
        path.join(projectName, file),
        config
      );
    }
  });
}
