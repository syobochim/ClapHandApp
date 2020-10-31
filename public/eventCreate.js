// 要素を取得
const button = document.getElementById("createEventButton");
// 最初は設定画面非表示
document.getElementById("created").style.display = "none"

console.log("url : ", window.AWS_EXPORTS.aws_appsync_graphqlEndpoint)
// Set up AppSync client
const AWSAppSyncClient = window.AWSAppSyncClient
const client = new AWSAppSyncClient({
    url: window.AWS_EXPORTS.aws_appsync_graphqlEndpoint,
    region: window.AWS_EXPORTS.aws_appsync_region,
    auth: {
        type: window.AWS_EXPORTS.aws_appsync_authenticationType,
        apiKey: window.AWS_EXPORTS.aws_appsync_apiKey
    },
    fetchPolicy: 'network-only',
    disableOffline: true
});

const createMutation = window.gql(/* GraphQL */ `
    mutation CreateClap($input: CreateClapInput!) {
        createClap(input: $input) {
            id
            emoji
            count
        }}
`)

let emoji = "👏";
let eventCode = null;
let eventName = "default";
let eventOwner = "default";

function createEvent() {
    const timestamp = new Date().getTime()
    const inputClap = { emoji: emoji, timestamp: timestamp, count: 0, type: "Clap", event: eventName, owner: eventOwner };

    client.hydrated().then(function (client) {
        client.mutate({
            mutation: createMutation,
            variables: {
                input: inputClap
            }
        }).then(function logData(data) {
            eventCode = data.data.createClap.id
            const EVENT_URL = "https://dprn9mw3rdpyz.cloudfront.net/?id=" + eventCode
            document.getElementById('url').textContent = EVENT_URL
            document.getElementById('qrcode').src = "https://chart.apis.google.com/chart?chs=150x150&cht=qr&chl=" + EVENT_URL
            window.ipcRenderer.invoke('eventCode', eventCode)
        }).catch(console.error);
    });
}

async function clickEvent() {
    if (document.getElementById("emoji").value != "") {
        emoji = document.getElementById("emoji").value
    }
    if (document.getElementById("eventName").value === "" || document.getElementById("eventOwner").value === "") {
        document.getElementById("error").textContent = "event name and owner are required."
        return
    } else {
        document.getElementById("error").textContent = ""
    }
    eventName = document.getElementById("eventName").value
    eventOwner = document.getElementById("eventOwner").value
    createEvent()
    document.getElementById("input").style.display = "none"
    document.getElementById("created").style.display = "flex"
};

//addEventListenerで登録
button.addEventListener("click", clickEvent);