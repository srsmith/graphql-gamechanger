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
        homeTeamId: {
            type: GraphQLString,
            resolve: (root, args) => JSON.parse(root).stream.home_id   
        },
        awayTeamId: {
            type: GraphQLString,
            resolve: (root, args) => JSON.parse(root).stream.away_id   
        },
        players: {
            type: new GraphQLList(PlayerType),
            resolve: (root, args) => JSON.parse(root).stream.players
        },
        events: {
            type: new GraphQLList(EventType),
            args: {
                excludeCodes: { type: GraphQLList(GraphQLString) },
                excludeShortDesc: { type: GraphQLList(GraphQLString) }
            },
            resolve: (root, args) => { 
                const { excludeCodes = [], excludeShortDesc = []} = args
                return JSON.parse(root).events[0]
                .filter(event => !excludeCodes.includes(event.code))
                .filter(event => !excludeShortDesc.includes(event.short_description));
            }
        }
    })
})

const EventType = new GraphQLObjectType({
    name: 'EventType',
    description: 'Represents events in a game',
    fields: () => ({
        inning: {
            type: GraphQLInt,
            resolve: (root, args) => parseInt(root.inning, 10)
        },
        code: {
            type: GraphQLString
        },
        shortDescription: {
            type: GraphQLString,
            resolve: (root, args) => root.short_description
        },
        description: {
            type: GraphQLString
        },
        timestamp: {
            type: GraphQLString
        },
        participants: {
            type: new GraphQLList(ParticipantType),
            resolve: (root, args) =>  root.participants
        },
        result: {
            type: ResultType
        },
        score: {
            type: new GraphQLObjectType({
                name: 'ScoreType',
                description: 'Game score for this event',
                fields: () => ({
                    home: {
                        type: GraphQLInt
                    },
                    away: {
                        type: GraphQLInt
                    }
                })
            }),
        }
    })
})

const ResultType = new GraphQLObjectType({
    name: 'ResultType',
    description: 'Represents the outcome of an event in the game',
    fields: () => ({
        count: {
            type: new GraphQLObjectType({
                name: 'CountType',
                description: 'The ball/strike/out count for this result',
                fields: () => ({
                    balls: {
                        type: GraphQLInt
                    },
                    strikes: {
                        type: GraphQLInt
                    },
                    outs: {
                        type: GraphQLInt
                    }
                })
            }),
            resolve: (root, args) => root.count
        },
        bases: {
            type: new GraphQLList(new GraphQLObjectType({
                name: 'BasesType',
                description: 'The bases for this event',
                fields: () => ({
                    base: {
                        type: GraphQLInt
                    },
                    playerId: {
                        type: GraphQLString,
                        resolve: (root, args) => root.player['$id']
                    },
                })
            })),
            resolve: (root, args) => root.situation.bases
        },
        // pitcherId: {
        //     type: GraphQLString,
        //     resolve: (root, args) => root.situation.pitcher['$id']
        // },
        // batterId: {
        //     type: GraphQLString,
        //     resolve: (root, args) => root.situation.batter['$id']
        // }
        // situation: {
            
        // }
        // "result": {
        //     "count": { "outs": 1, "strikes": 0, "balls": 0 },
        //     "situation": {
        //       "inning": 1,
        //       "home_lineupindex": 2,
        //       "pitcher": {
        //         "$ref": "player",
        //         "$id": "59ac7f5b37f2575f17000003",
        //         "$db": ""
        //       },
        //       "bases": [
        //         {
        //           "base": 1,
        //           "player": {
        //             "$ref": "player",
        //             "$id": "59ee7f5b3793048ef700002a",
        //             "$db": ""
        //           }
        //         }
        //       ],
        //       "batter": {
        //         "$ref": "player",
        //         "$id": "59ee7f5b3793048ef700002a",
        //         "$db": ""
        //       },
        //       "half": 0,
        //       "away_lineupindex": 0
        //     },
    }),
})

const PlayerType = new GraphQLObjectType({
    name: 'PlayerType',
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
            type: GraphQLString
        },
        teamId: {
            type: GraphQLString,
            resolve: (root, args) => root.team['$id']
        },


    })
})

const ParticipantType = new GraphQLObjectType({
    name: 'Particpant',
    description: 'Represents a player involved in a given play',
    fields: () => ({
        roles: {
            type: GraphQLList(GraphQLString)
        },
        teamId: {
            type: GraphQLString,
            resolve: (root, args) => root.team_id
        },
        player: {
            type: PlayerType
        }
    }),
})

module.exports = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        description: 'Queries GameChanger for a specific game with a specific account #',
        fields: () => ({
            game: {
                type: GameType,
                args: {
                    accountId: { type: GraphQLString },
                    gameId: { type: GraphQLString }
                },
                resolve: (root, args, context) =>  context.gameLoader.load(args)
            }
        })
    })
})