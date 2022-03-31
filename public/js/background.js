let mainData = { data: [] };

// 开启background运行监听
chrome.runtime.onInstalled.addListener(() => {
    createContextMenus();
});

// 后台监听消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('开始reload');
    if (request.msg == 'reload') {
        createContextMenus();
    }
});

function createContextMenus() {
    chrome.storage.sync.get('data', ({ data }) => {
        mainData.data = [];
        console.log(data);
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

        mainData.data.forEach((item) => {
            chrome.contextMenus.create({
                id: item.id.toString(),
                title: item.name,
            });
        });
    });
}

// 菜单项点击事件！
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    console.log('收藏get！', info, tab);
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
