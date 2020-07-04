const chalk = require('chalk');
const inquirer = require('inquirer');
const { spawnSync } = require('child_process');
const { getLocalBranch,getRemoteBranch } = require('./branch');

const log = console.log;

// 命令行交互配置
function inputCommit() {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'desc',
            message: '请输入commit描述:'
        }
    ]);
}

function diffConfirm() {
    return inquirer.prompt([
        {
            type: 'confirm',
            name: 'isDiff',
            default: false,
            message: '提交前diff了吗:'
        }
    ]);
}

function callSpawn({ name, desc = '', curBranch = 'master' }) {
    let args;
    if (name === 'diff') args = [name];
    if (name === 'add') args = [name, '-A'];
    if (name === 'commit') args = [name, '-m', ` ${desc}`];
    if (name === 'pull' || name === 'push') args = [name, 'origin', curBranch];
    const { status } = spawnSync('git', args, { stdio: 'inherit' });
    if (status !== 0) {
        log(chalk.red(`${name} filed`));
        process.exit();
    }
    if (name === 'push') return log(chalk.green('the end'));
    if (name !== 'diff' && name !== 'push') log(chalk.green(`${name} ok...`));
}

async function add() {
    const { isDiff } = await diffConfirm();
    if (!isDiff) callSpawn({ name: 'diff' });
    callSpawn({ name: 'add' });
    next();
}

async function commit() {
    const { desc } = await inputCommit();
    callSpawn({ name: 'commit', desc });
    next();
}

async function pull() {
    const { curBranch } = await getLocalBranch();
    const allRemoteBranch = await getRemoteBranch();
    console.log('allRemoteBranch========',allRemoteBranch);
    console.log('curBranch========',curBranch);
    if(allRemoteBranch.find(curBranch)){ // 如果远程有当前分支才执行pull命令，否则不执行
        callSpawn({ name: 'pull', curBranch });
    }
    next(curBranch);
}

function push(curBranch) {
    callSpawn({ name: 'push', curBranch });
}

const tasks = [add, commit, pull, push];

function next(...args) {
    if (tasks.length <= 0) return;
    tasks.shift()(args);
}

module.exports = next;
