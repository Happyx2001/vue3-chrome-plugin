(function () {
    // 因为background在退出重进浏览器的时候会失效，因此需要content-script发送信息过去重新激活background，确保右键菜单的正确性
    chrome.runtime.sendMessage({ msg: 'reload' });

    // 发送当前页面的body节点，方便截图
    let body = document.body;
    console.log(body);
    chrome.runtime.sendMessage({ msg: 'body', tabBody: body });
})();
