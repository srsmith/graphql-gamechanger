const { GraphQLSchema, 
        GraphQLObjectType, 
        GraphQLString, 
        GraphQLList, 
        GraphQLInt } = require('graphql');
const fetch = require('node-fetch')

const GameType = new GraphQLObjectType({
    name: 'Game',
    description: 'The game that is being scored',
    fields: () => ({
        id: {
            type: GraphQLString,
            resolve: (root, args) => JSON.parse(root).stream.game['$id']
        },
        utcStart: {
            type: GraphQLString,
            resolve: (root, args) => JSON.parse(root).stream.utc_start
        },
        players: {
            type: new GraphQLList(PlayerType),
            resolve: (root, args) => JSON.parse(root).stream.players
        },
        events: {
            type: new GraphQLList(EventType),
            resolve: (root, args) => JSON.parse(root).events[0]
        }
    })
})

const EventType = new GraphQLObjectType({
    name: 'EventType',
    description: 'Represents events in a game',
    fields: () => ({
        inning: {
            type: GraphQLString,
            resolve: (root, args) => root.inning
        },
        code: {
            type: GraphQLString,
            resolve: (root, args) => root.code
        },
        shortDescription: {
            type: GraphQLString,
            resolve: (root, args) => root.short_description
        },
        description: {
            type: GraphQLString,
            resolve: (root, args) => root.description
        },
        timestamp: {
            type: GraphQLString,
            resolve: (root, args) => root.timestamp
        },
        
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
                    gameId: { type: GraphQLString }
                },
                resolve: (root, args, context) => context.gameLoader.load(args.gameId)
                // resolve: (root, args) => fetch(
                //     'https://push.gamechanger.io/push/game/59ee7f5b3793048e3f00001e/stream/59ee7f5b3793048ff9000037'
                // )
                // .then(response => response.text())
            }
        })
    })
})