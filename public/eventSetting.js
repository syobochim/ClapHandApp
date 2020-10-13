// 要素を取得
const button = document.getElementById("eventSettingButton");

async function setEventId() {
    const result = await window.ipcRenderer.invoke('eventCode', document.getElementById("eventCode").value)
    window.close()
};

//addEventListenerで登録
button.addEventListener("click", setEventId);