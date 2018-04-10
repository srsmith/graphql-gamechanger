
require('isomorphic-fetch');
const moment = require('moment');
const fs = require('file-system');

const params = { 
    gameId: process.argv[3] || `5aa57f5b376308472300001a`,
    accountId: process.argv[4] || `5aa57f5b3763088489000189`
}

fetch(`http://localhost:8080/graphql`, {
    method: `POST`,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        query: `query {
        game(gameId: "${params.gameId}",
             accountId: "${params.accountId}") {
          id,
          homeTeamId,
          awayTeamId,
          events(excludeCodes: ["act"], 
                       includeParticipants: [{playerId: "5a317f5b379d84c67300000b"}]
          ) {
            inning,
            code,
            shortDescription,
            description,
            timestamp,
            result {
              bases {
                base,
                playerId
              },
              count {
                balls,
                strikes,
                outs
              }
            },
                participants {
              roles,
              teamId,
              playerId
            }
          },
          players {
            id,
            teamId,
            lastName,
            firstName,
            number
          },
        }
      }`})
})
.then(res => res.json())
.then(json => json.data.game.events.reduce((pbp, event, i, allEvents) => {
    pbp.firstEventTs = pbp.firstEventTs || moment(event.timestamp); // set first time through
    pbp.events = pbp.events || []; 

    if (event.code !== 'pitch') {
        /**
         * Need to get the last event that has an earlier timestamp than the current non-pitch event.
         * Sometimes, that means rolling back more than one event because sometimes there are multiple
         * events with the same timestamp
         **/
        
        let eventTs = moment(event.timestamp);
        let prevEvent = allEvents.slice(0, i).reverse().find(e => moment(e.timestamp).isBefore(eventTs));
        let prevEventTs = moment(prevEvent.timestamp);
        let durationFromFirst = moment.duration(prevEventTs.diff(pbp.firstEventTs));
        pbp.events.push({ ...event,
            time: {
                firstEventTs: pbp.firstEventTs,
                prevEventTs: prevEventTs,
                eventTs: eventTs,
                prevEventDescription: prevEvent.description,
                startClip: moment.utc(durationFromFirst.asMilliseconds()).format('hh:mm:ss'),
                clipLengthSeconds: eventTs.diff(prevEventTs, 'seconds')
            }
        })
    }
    return pbp
}, {}))
.then(pbp =>  console.log(`reduced events`, JSON.stringify(pbp,null,2)));