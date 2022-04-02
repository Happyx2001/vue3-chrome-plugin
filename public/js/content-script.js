(function () {
    // 因为background在退出重进浏览器的时候会失效，因此需要content-script发送信息过去重新激活background，确保右键菜单的正确性
    console.log('reload');
    chrome.runtime.sendMessage({ msg: 'reload' });
})();
