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
    const observable = client.subscribe({
        query: subquery,
        variables: {
            id: eventId
        }
    });
    const realtimeResults = function realtimeResults(data) {
        const x = window.innerWidth - 250 + Math.random() * 120;
        const y = window.innerHeight - 250 + Math.random() * 120;
        let emoji = document.createElement('div');
        console.log(data.data.onUpdateClapCount)
        emoji.textContent = data.data.onUpdateClapCount.emoji
        emoji.setAttribute('class', 'clap');
        emoji.setAttribute('style', 'top:' + y + 'px; left:' + x + 'px;')
        const clapAnimation = emoji.animate(
            [
                { top: y + 'px', left: x + 'px'},
                { top: y + 40 + 'px', left: x + 40 + 'px'}
            ],
            {
                duration: 1000,
                easing: 'ease-in'
            }
        )
        clapAnimation.onfinish = function () {
            emoji.remove()
            console.log("finish")
        }
        document.body.appendChild(emoji);
    };
    observable.subscribe({
        next: realtimeResults,
        complete: console.log,
        error: console.error,
    });
});
