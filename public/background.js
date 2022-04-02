let mainData = { data: [] }; // 保存集锦信息
let haveContextMenus = false; // 是否已经有右键菜单
let backgroundHashId = 1; // 不会重复的id
let img_url = '';

// runtime.onInstalled 插件安装时才会开启，如果关闭浏览器则无法再次运行
chrome.runtime.onInstalled.addListener(() => {
    // 获取当前页面
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
});

// 创建、更新右键菜单函数
function createContextMenus() {
    chrome.tabs.captureVisibleTab(null, async function (imgUrl) {
        img_url = await compress(imgUrl, 30, 0.5);
    });
    console.log(img_url);

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

    chrome.tabs.captureVisibleTab(null, async function (imgUrl) {
        img_url = await compress(imgUrl, 30, 0.5);
    });

    let id = info.menuItemId;
    setTimeout(() => {
        if (JSON.stringify(mainData.data).length > 6000) {
            img_url = '';
        }
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
                        img_url,
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
                img_url: '',
                children: [
                    {
                        title: tab.title,
                        url: tab.url,
                        icon_url: tab.favIconUrl,
                        cId: backgroundHashId + 1,
                        img_url,
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
    }, 2000);
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

// 图片压缩方法
function compress(base64String, w, quality) {
    let getMimeType = function (urlData) {
        let arr = urlData.split(',');
        let mime = arr[0].match(/:(.*?);/)[1];
        // return mime.replace("image/", "");
        return mime;
    };
    let newImage = new Image();
    let imgWidth, imgHeight;

    let promise = new Promise((resolve) => (newImage.onload = resolve));
    newImage.src = base64String;
    return promise.then(() => {
        imgWidth = newImage.width;
        imgHeight = newImage.height;
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        if (Math.max(imgWidth, imgHeight) > w) {
            if (imgWidth > imgHeight) {
                canvas.width = w;
                canvas.height = (w * imgHeight) / imgWidth;
            } else {
                canvas.height = w;
                canvas.width = (w * imgWidth) / imgHeight;
            }
        } else {
            canvas.width = imgWidth;
            canvas.height = imgHeight;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(newImage, 0, 0, canvas.width, canvas.height);
        let base64 = canvas.toDataURL(getMimeType(base64String), quality);
        while (base64.length > 1500) {
            quality -= 0.01;
            base64 = canvas.toDataURL(getMimeType(base64String), quality);
        }
        // 防止最后一次压缩低于最低尺寸，只要quality递减合理，无需考虑
        // while (base64.length < 500) {
        //     quality += 0.001;
        //     base64 = canvas.toDataURL(getMimeType(base64String), quality);
        // }
        console.log(base64);
        return base64;
    });
}
