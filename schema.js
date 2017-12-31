
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList } = require('graphql');
const fetch = require('node-fetch')



const GameType = new GraphQLObjectType({
    name: 'Game',
    description: 'The game that is being scored',
    fields: () => ({
        id: {
            type: GraphQLString,
            resolve: (root, args) => JSON.parse(root).stream.game['$id']
        },
        players: {
            type: new GraphQLList(PlayerType),
            resolve: (root, args) => JSON.parse(root).stream.players
        }
    })
})

const PlayerType = new GraphQLObjectType({
    name: 'Player',
    description: 'Represents a player in the game',
    fields: () => ({
        id: {
            type: GraphQLString,
            resolve: (root, args) => root.id
        },
        firstName: {
            type: GraphQLString,
            resolve: (root, args) => root.first_name
        },
        lastName: {
            type: GraphQLString,
            resolve: (root, args) => root.last_name
        }, 
        batHand: {
            type: GraphQLString,
            resolve: (root, args) => root.bat_hand
        },
        throwHand: {
            type: GraphQLString,
            resolve: (root, args) => root.throw_hand
        },
        number: {
            type: GraphQLString,
            resolve: (root, args) => root.number
        },


    })
})

module.exports = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        description: '...',
        fields: () => ({
            game: {
                type: GameType,
                args: {

                },
                resolve: (root, args) => fetch(
                    'https://push.gamechanger.io/push/game/59ee7f5b3793048e3f00001e/stream/59ee7f5b3793048ff9000037'
                )
                .then(response => response.text())
            }
        })
    })
})