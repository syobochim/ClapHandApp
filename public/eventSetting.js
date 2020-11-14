// 要素を取得
const button = document.getElementById("eventSettingButton");

async function setEventId() {
    const eventCode = document.getElementById("eventCode").value
    const result = await window.ipcRenderer.invoke('eventCode', eventCode)
    const eventURL = "https://dprn9mw3rdpyz.cloudfront.net/?id=" + eventCode
    location.href = './info.html?eventURL=' + eventURL
};

//addEventListenerで登録
button.addEventListener("click", setEventId);