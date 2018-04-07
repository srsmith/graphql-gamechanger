const express = require('express')
const fetch = require('node-fetch')
const graphqlHTTP = require('express-graphql')
const DataLoader = require('dataloader')
const app = express()

const schema = require('./schema');

const fetchGame = (props) => {
    let { accountId, gameId } = props;
    return fetch(`https://push.gamechanger.io/push/game/${gameId}/stream/${accountId}?index=0`)
    .then(response => response.text())
}

app.use('/graphql', graphqlHTTP( req => {

    const gameLoader = new DataLoader(keys =>
        Promise.all(keys.map(fetchGame)))
    
    return {
        schema,
        context: {
            gameLoader,
        },
        graphiql: true
    }
    }))

// app.use('/graphql', graphqlHTTP({
//     schema,
//     context: {
//         fetchGame
//     },
//     graphiql: true
// }))
app.listen(8080)

console.log('Listening...')