// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

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


// 初期表示用データを取得する
const initQuery = window.gql(/* GraphQL */ `
query GetClap($id : ID!) {
  getClap(id: $id) {
    id
    count
    emoji
  }}
`)

// Set up a subscription query
const subquery = window.gql(/* GraphQL */ `
subscription OnUpdateClapCount($id: ID) {
  onUpdateClapCount(id: $id) {
    id
    count
    emoji
  }}
  `);

window.ipcRenderer.on('eventId', (event, eventId) => {
    client.hydrated().then(function (client) {
        client.query({
            query: initQuery,
            variables: {
                id: eventId
            }
        }).then(function logData(data) {
            document.getElementById('emoji').textContent = data.data.getClap.emoji
            document.getElementById('count').textContent = data.data.getClap.count
        }).catch(console.error);

        const observable = client.subscribe({
            query: subquery,
            variables: {
                id: eventId
            }
        });
        const realtimeResults = function realtimeResults(data) {
            document.getElementById('count').textContent = data.data.onUpdateClapCount.count
        };
        observable.subscribe({
            next: realtimeResults,
            complete: console.log,
            error: console.error,
        });
    });
})
