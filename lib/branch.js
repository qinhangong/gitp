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
                    data = allBranch.filter(item => item.includes(input));
                } else {
                    data = allBranch;
                }
                return Promise.resolve(data);
            }
        }
    ]);
}

function getLocalBranch() {
    return new Promise(resolve => {
        exec('git branch', (err, stdout) => {
            if (err) return log(chalk.red(err));
            let allBranch = stdout.trim().split('\n');
            let curBranch;
            allBranch = allBranch.map(item => {
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

async function selectAndCheckoutBranch() {
    const { allBranch } = await getLocalBranch();
    const { select } = await selectBranch(allBranch);
    spawnSync('git', ['checkout', select], { stdio: 'inherit' });
}

module.exports = {
    getLocalBranch,
    selectAndCheckoutBranch
};
