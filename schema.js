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
            resolve: (root, args) => { 
                console.log(`args: `, args);
                return JSON.parse(root).events[0]
            }
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
        participants: {
            type: new GraphQLList(ParticipantType),
            resolve: (root, args) => { 
                //console.log(root.participants);
                return root.participants
            }
        },
    })
})

const PlayerType = new GraphQLObjectType({
    name: 'Player',
    description: 'Represents a player in the game',
    fields: () => ({
        id: {
            type: GraphQLString,
            resolve: (root, args) =>  root.id || root['$id']
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

const ParticipantType = new GraphQLObjectType({
    name: 'Particpant',
    description: 'Represents a player involved in a given play',
    fields: () => ({
        roles: {
            type: GraphQLList(GraphQLString),
            resolve: (root, args) => { 
                return root.roles;
            }
        },
        teamId: {
            type: GraphQLString,
            resolve: (root, args) => root.team_id
        },
        player: {
            type: PlayerType,
            resolve: (root, args) => root.player
        }
        // "roles": ["new"],
        // "team_id": "59ee7f5b3793048df400000f",
        // "player": {
        //   "$ref": "player",
        //   "$id": "59ee7f5b3793048e9d000022",
        //   "$db": ""
        // }
    }),
})

module.exports = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        description: '...',
        fields: () => ({
            game: {
                type: GameType,
                args: {
                    accountId: { type: GraphQLString },
                    gameId: { type: GraphQLString },
                    eventTypes: { type: GraphQLList(GraphQLString) }
                },
                resolve: (root, args, context) =>  context.gameLoader.load(args)
            }
        })
    })
})