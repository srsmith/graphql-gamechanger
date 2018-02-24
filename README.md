# graphql-gamechanger

node serve.js

query {
  game(gameId:"12345") {
    id,
    players {
      id
    }
  }
}