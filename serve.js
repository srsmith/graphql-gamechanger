const express = require('express')
const fetch = require('node-fetch')
const graphqlHTTP = require('express-graphql')
const DataLoader = require('dataloader')
const app = express()

const schema = require('./schema');

const fetchGame = (gameId) => 
    //fetch(`https://push.gamechanger.io/push/game/59ee7f5b3793048e3f00001e/stream/59ee7f5b3793048ff9000037`)
    //fetch(`https://push.gamechanger.io/push/game/59ee7f5b3793048e03000010/stream/59ee7f5b3793048e6800001f`)
    //fetch(`https://push.gamechanger.io/push/game/{gameId}/stream/$59ee7f5b3793048e3f00001e`)
    fetch(`https://push.gamechanger.io/push/game/59e27f5b37af01cb1900036f/stream/59e27f5b37af01cb20000370?index=0`)
    .then(response => response.text())

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