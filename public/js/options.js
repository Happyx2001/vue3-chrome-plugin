(function () {
    // 打印后台集锦的JSON文件
    let JSONData = '';
    let Json = document.getElementById('collection-json');
    let downloadBtn = document.getElementById('downloadBtn');
    let showBtn = document.getElementById('showBtn');
    let updateBtn = document.getElementById('updateBtn');
    let updateInp = document.getElementById('updateInp');

    // 绑定事件
    downloadBtn.addEventListener('click', downloadJSON);
    showBtn.addEventListener('click', showJSON);
    updateBtn.addEventListener('click', updateJSON);

    // chrome.runtime.onMessage.addListener(function (
    //     request,
    //     sender,
    //     sendResponse
    // ) {
    //     // 收到 reload 消息：更新右键菜单、更新mainData数据
    //     if (request.msg == 'reload') {
    //         chrome.storage.sync.get('data', ({ data }) => {
    //             JSONData = Json.innerText = JSON.stringify(data);
    //         });
    //     }
    // });
    // 展示JSON文件
    function showJSON() {
        chrome.storage.sync.get('data', ({ data }) => {
            Json.innerText = JSON.stringify(data);
        });
    }

    // 下载JSON文件
    function downloadJSON() {
        chrome.storage.sync.get('data', ({ data }) => {
            JSONData = JSON.stringify(data);
            let dataStr =
                'data:text/plan;charset=utf-8,' + encodeURIComponent(JSONData);
            // 创建虚拟标签进行下载
            let downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute('href', dataStr);
            downloadAnchorNode.setAttribute('download', '集锦配置.json');
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });
    }

    // 上传JSON文件
    function updateJSON() {
        let val = updateInp.value;
        chrome.storage.sync.set({ data: JSON.parse(val) });
        alert('集锦配置已经恢复');
        console.log(JSON.parse(val));
    }
})();
