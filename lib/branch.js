const inquirer = require('inquirer');
const { exec, spawnSync } = require('child_process');

// 命令行交互配置
function selectBranch(data) {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'select',
            message: '请选择要切换的分支',
            choices: data
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
