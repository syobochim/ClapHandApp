// 要素を取得
const button = document.getElementById("createEventButton");

// Set up AppSync client
const AWSAppSyncClient = window.AWSAppSyncClient
const AppSyncClient = new AWSAppSyncClient({
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

let emoji = "👍";
let eventCode = null;

async function createEvent(eventName, eventOwner) {
    const timestamp = new Date().getTime()
    const inputClap = {
        emoji: emoji,
        timestamp: timestamp,
        count: 0,
        type: "Clap",
        event: eventName,
        owner: eventOwner
    };
    const client = await AppSyncClient.hydrated()
    const data = await client.mutate({
        mutation: createMutation,
        variables: {
            input: inputClap
        }
    })
    eventCode = data.data.createClap.id
    window.ipcRenderer.invoke('eventCode', eventCode)
    return "https://dprn9mw3rdpyz.cloudfront.net/?id=" + eventCode
}

async function clickEvent() {
    if (document.getElementById("emoji").value != "") {
        emoji = document.getElementById("emoji").value
    }
    const nameForm = document.getElementById("eventName")
    const ownerForm = document.getElementById("eventOwner")
    if (nameForm.value === "" || ownerForm.value === "") {
        nameForm.setAttribute('class', 'error')
        ownerForm.setAttribute('class', 'error')
        nameForm.placeholder = "EventName - required"
        ownerForm.placeholder = "EventOwner - required"
        return
    }
    const eventURL = await createEvent(nameForm.value, ownerForm.value)
    location.href = './info.html?eventURL=' + eventURL
};

//addEventListenerで登録
button.addEventListener("click", clickEvent);