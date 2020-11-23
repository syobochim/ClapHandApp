// Set up AppSync client
const client = window.AppSyncClient

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

// const audio = document.querySelector('#audio')
// function audioPlay(){
//     audio.play()
// }

window.ipcRenderer.on('eventId', (event, eventId) => {
    const observable = client.subscribe({
        query: subquery,
        variables: {
            id: eventId
        }
    });
    const realtimeResults = function realtimeResults(data) {
        // audioPlay()
        const x = 100 + Math.random() * 70;
        const y = 200;
        const fontSize = 50 + Math.random() * 80
        let reaction = document.createElement('div');
        reaction.textContent = data.data.onUpdateClapCount.emoji
        reaction.setAttribute('class', 'reaction');
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
    };
    observable.subscribe({
        next: realtimeResults,
        complete: console.log,
        error: console.error,
    });
});
