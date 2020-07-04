const inquirer = require('inquirer');
const { exec, spawnSync } = require('child_process');

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

// 命令行交互配置
function selectBranch(allBranch) {
  return inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'select',
      message: '请输入或选择要切换的分支',
      source: (answersSoFar, input) => {
        let data;
        if (input) {
          data = allBranch.filter((item) => item.includes(input));
        } else {
          data = allBranch;
        }
        return Promise.resolve(data);
      },
    },
  ]);
}

function getLocalBranch() {
  return new Promise((resolve) => {
    exec('git branch --sort=-committerdate', (err, stdout) => {
      if (err) return log(chalk.red(err));
      let allBranch = stdout.trim().split('\n');
      let curBranch;
      allBranch = allBranch.map((item) => {
        if (item.includes('* ')) {
          item = item.replace('* ', '');
          curBranch = item;
        }
        return item.trim();
      });
      resolve({ allBranch, curBranch });
    });
  });
}

function getRemoteBranch() {
  return new Promise((resolve) => {
    exec('git branch -a', (err, stdout) => {
      if (err) return log(chalk.red(err));
      let allRemoteBranch = stdout
        .trim()
        .split('\n')
        .filter((item) => item.includes('remotes/origin') && !item.includes('->'));
      allRemoteBranch = allRemoteBranch.map((item) => {
        item = item.trim();
        return item.replace('remotes/origin/', '');
      });
      resolve(allRemoteBranch);
    });
  });
}

async function selectAndCheckoutBranch() {
  const { allBranch } = await getLocalBranch();
  const { select } = await selectBranch(allBranch);
  spawnSync('git', ['checkout', select], { stdio: 'inherit' });
}

module.exports = {
  getLocalBranch,
  getRemoteBranch,
  selectAndCheckoutBranch,
};
