// build.js文件
// #!/usr/bin/env node
// node build.js --type=hotfix
// node build.js --type=release
// node build.js --type=release --version=1.2.3

var exec = require('child_process').exec;
var fs = require('fs');

var packageJSON = require('./package.json');
/** package.json文件的version参数 */
var version = packageJSON.version;
/** 命令行的所有参数 */
var options = process.argv;
/** 命令行的type参数 */
var type = null;
var publish = false;
/** 新的version参数 */
var newVersion = null;

//判断命令行是否存在type参数或version参数进行逻辑处理
for (let i=0; i<options.length; i++) {
    if (options[i].indexOf('type') > -1) {//存在type参数
        type = options[i].split("=")[1];
    } else if (options[i].indexOf('version') > -1) {//存在version参数
        newVersion = options[i].split("=")[1];
    } else if (options[i].indexOf('publish') > -1) {
        publish = true;
    }
}

if (newVersion) {//存在设置version参数则改变原来的version
    version = newVersion;
} else if (type) {//不设置version则根据type来进行修改version
    version = handleType(version, type);
} else {
    version = null;
    console.log("-----------没有改变version-----------");
}

//修改了version则写入
if (version) {
    packageJSON.version = version;
    //同步写入package.json文件
    fs.writeFileSync('package.json', JSON.stringify(packageJSON, null, 4));
    console.log("-----------更新package的version为：%s参数成功-----------", version);
    if (publish) {
        pullRemote();
    }
}

/**
 * 根据分支类型处理版本号version
 * @param {string} oldVersion 旧的版本号
 * @param {string} type 分支类型
 * @private
 */
function handleType(oldVersion, type) {
    var oldVersionArr = oldVersion.split(".");
    //版本号第一位 如：1.2.3 则为 1
    var firstNum = +oldVersionArr[0];
    //版本号第二位 如：1.2.3 则为 2
    var secondNum = +oldVersionArr[1];
    //版本号第三位 如：1.2.3 则为 3
    var thirdNum = +oldVersionArr[2];
    switch (type) {
        case "release":
            //release分支的处理逻辑
            ++secondNum;
            break;
        case "hotfix":
            //hotfix分支的处理逻辑
            ++thirdNum;
            break;
        default:
            break;
    }

    return `${firstNum}.${secondNum}.${thirdNum}`;
}

/**
 * 将package.json推送到远程新创建的分支
 */
function pullRemote() {
    //创建新分支
    handleGitCreate(`${type}/${version}`);
}

/**
 * 创建新分支
 * @param {string} branch 分支名
 */
function handleGitCreate(branch) {
    exec(`git branch ${branch}`, function (error, stdout, stderr) {
        console.log("-----------创建新分支:%s DONE-----------", branch);
        //切换分支
        handleGitCheckOut(branch);
    });
}

/**
 * 切换分支
 * @param {string} branch 分支名
 */
function handleGitCheckOut(branch) {
    exec(`git checkout ${branch}`, function (error, stdout, stderr) {
        console.log("-----------切换新分支:%s DONE-----------", branch);
        //添加修改文件
        handleGitAdd("./package.json");
    });
}

/**
 * 添加修改文件
 * @param {string} filePath 文件路径
 */
function handleGitAdd(filePath) {
    exec(`git add ${filePath}`, function (error, stdout, stderr) {
        console.log("[添加修改文件输出：%s]", stdout);
        //提交文件
        handleGitCommit("更新package.json文件");
    });
}

/**
 * 提交文件
 * @param {string} prompt commit文字备注
 */
function handleGitCommit(prompt) {
    var branch = `${type}/${version}`;
    exec(`git commit -m "${prompt}"`, function (error, stdout, stderr) {
        console.log("[提交修改文件输出：%s]", stdout);
        //推送分支
        handleGitPush(branch);
    });
}

/**
 * 推送分支
 * @param {string} branch 推送至哪个分支
 */
function handleGitPush(branch) {
    exec(`git push -u origin ${branch}`, function (error, stdout, stderr) {
        console.log("[推送至分支:%s输出：%s]", branch, stdout || error || stderr);
        console.log("-----------提交修改文件完成-----------");
    });
}

/**
 * 自动生成版本号脚本思路
 * 1.获取传进来的参数 √
 * 2.根据参数进行逻辑处理 √
 * 3.获取package.json中的version参数 √
 * 4.修改version的值写入package.json文件 √
 * 5.git提交package.json文件 √
 */

