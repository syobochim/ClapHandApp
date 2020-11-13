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

let hand = document.getElementById('hand')

window.ipcRenderer.on('eventId', (event, eventId) => {
    const observable = client.subscribe({
        query: subquery,
        variables: {
            id: eventId
        }
    });
    const realtimeResults = function realtimeResults(data) {
        const x = 100 + Math.random() * 70;
        const y = 180;
        const fontSize = 30 + Math.random() * 40
        let reaction = document.createElement('div');
        reaction.textContent = data.data.onUpdateClapCount.emoji
        reaction.setAttribute('class', 'clap');
        reaction.setAttribute('style', 'left:' + x + 'px; font-size:' + fontSize + 'px;');
        const reactionAnimation = reaction.animate(
            [
                { top: y + 'px' },
                { top: '0px', opacity: 0 }
            ],
            {
                duration: 1500,
                easing: 'ease-in'
            }
        )
        reactionAnimation.onfinish = function () {
            reaction.remove()
        }
        document.body.appendChild(reaction);

        hand.animate(
            [
                { top: '215px' },
                { top: '200px' }
            ],
            {
                duration: 500
            }
        )
    };
    observable.subscribe({
        next: realtimeResults,
        complete: console.log,
        error: console.error,
    });
});
