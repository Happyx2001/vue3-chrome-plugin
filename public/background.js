let mainData = { data: [] }; // 保存集锦信息
let haveContextMenus = false; // 是否已经有右键菜单
let backgroundHashId = 1; // 不会重复的id

// runtime.onInstalled 插件安装时才会开启，如果关闭浏览器则无法再次运行
chrome.runtime.onInstalled.addListener(() => {
    // 右键菜单运行
    createContextMenus();
});

// 后台监听消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // 收到 reload 消息：更新右键菜单、更新mainData数据
    if (request.msg == 'reload') {
        createContextMenus();
    }
    // 收到 catch err 消息：打印抛出的错误
    if (request.msg == 'catchErr') {
        console.log(request.errMsg);
    }

    // 收到了body信息
    if (request.msg == 'body') {
        console.log('content-script获取的body', request.tabBody);
    }
});

// 创建、更新右键菜单函数
function createContextMenus() {
    chrome.storage.sync.get('hashId', ({ hashId }) => {
        if (hashId) {
            backgroundHashId = parseInt(hashId);
        }
        console.log(backgroundHashId);
    });

    // 先判断是否有右键菜单，如果有，则需要先删除全部菜单
    if (haveContextMenus) {
        chrome.contextMenus.removeAll(function () {
            console.log('更新右键菜单');
        });
        haveContextMenus = false;
    }

    chrome.storage.sync.get('data', ({ data }) => {
        mainData.data = [];
        console.log(data);
        // 处理数据
        if (data) {
            // tips：从chrome.storage中取出的数据为 JSON 格式，因此将对象内的数据遍历存到数组中去
            for (let index in data) {
                mainData.data.push(data[index]);
            }
            mainData.data.forEach((item) => {
                let newChild = [];
                for (let index in item.children) {
                    newChild.push(item.children[index]);
                }
                item.children = newChild;
            });
        } else {
            mainData.data = [];
        }
        console.log(mainData);

        // 生成右键菜单
        mainData.data.forEach((item) => {
            chrome.contextMenus.create({
                id: item.id.toString(),
                title: item.name,
            });
        });

        // just：分割线
        chrome.contextMenus.create({
            id: '分隔线',
            title: '分割线',
            type: 'separator',
        });

        // 直接新建一个新集锦并且添加当前页面
        chrome.contextMenus.create({
            id: 'create_new_collection',
            title: '创建新集锦',
        });

        haveContextMenus = true;
    });
}

// 菜单项点击事件！
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    console.log('收藏get！', info, tab);
    let id = info.menuItemId;
    if (id !== 'create_new_collection') {
        // 添加到已有的集锦里面
        console.log('添加到已有的集锦里面');
        for (let i = 0; i < mainData.data.length; i++) {
            if (mainData.data[i].id == id) {
                let newChild = {
                    title: tab.title,
                    url: tab.url,
                    icon_url: tab.favIconUrl,
                    cId: backgroundHashId,
                    img_url: '...',
                };
                backgroundHashId++;
                mainData.data[i].children.push(newChild);
                chrome.storage.sync.set({
                    data: mainData.data,
                    hashId: backgroundHashId,
                });
                break;
            }
        }
    } else {
        // 新建集锦并且添加
        console.log('新建集锦并且添加');
        let data = new Date().toLocaleDateString().split('/');
        data = data[0] + '年' + data[1] + '月' + data[2] + '日';
        let newCollect = {
            id: backgroundHashId,
            name: data,
            img_url: '...',
            children: [
                {
                    title: tab.title,
                    url: tab.url,
                    icon_url: tab.favIconUrl,
                    cId: backgroundHashId + 1,
                    img_url: '...',
                },
            ],
        };
        backgroundHashId = backgroundHashId + 2;
        mainData.data.push(newCollect);
        chrome.storage.sync.set({
            data: mainData.data,
            hashId: backgroundHashId,
        });
        createContextMenus();
    }
});

// // 创建右键菜单
// chrome.contextMenus.create({
//     id: '1',
//     title: '集锦1',
// });
// chrome.contextMenus.create({
//     id: '2',
//     title: '集锦2',
// });
// // 相应右键菜单点击事件:
// // info 是一个字典数据，包含页面及菜单的一些信息，以及在页面上选中的内容文本
// // tab 是一个字典数据，包含页面比较具体的一些信息
// chrome.contextMenus.onClicked.addListener(function (info, tab) {
//     console.log('收藏get！', info, tab);
// });
