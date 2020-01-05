const fs = require('fs-extra');
const path = require('path');
const {QueryEngineComunica} = require('graphql-ld-comunica/index');
const {Client} = require('graphql-ld/index');

async function getCountryHomeAwayID() {
  return await getRankingID(ranking => {
    return (ranking['type'].indexOf('https://dancehallbattle.org/ontology/CountryRanking') !== -1 &&
      ranking['type'].indexOf('https://dancehallbattle.org/ontology/HomeRanking') === -1 &&
      ranking['type'].indexOf('https://dancehallbattle.org/ontology/AwayRanking') === -1);
  });
}

async function getCountryHomeID() {
  return await getRankingID(ranking => {
    return (ranking['type'].indexOf('https://dancehallbattle.org/ontology/CountryRanking') !== -1 &&
      ranking['type'].indexOf('https://dancehallbattle.org/ontology/HomeRanking') !== -1);
  });
}

async function getCountryAwayID() {
  return await getRankingID(ranking => {
    return (ranking['type'].indexOf('https://dancehallbattle.org/ontology/CountryRanking') !== -1 &&
      ranking['type'].indexOf('https://dancehallbattle.org/ontology/AwayRanking') !== -1);
  });
}

async function getDancerCombinedID() {
  return await getRankingID(ranking => {
    return (ranking['type'].indexOf('https://dancehallbattle.org/ontology/DancerRanking') !== -1 &&
      ranking['type'].indexOf('https://dancehallbattle.org/ontology/1vs1Ranking') === -1 &&
      ranking['type'].indexOf('https://dancehallbattle.org/ontology/2vs2Ranking') === -1);
  });
}

async function getDancer1vs1ID() {
  return await getRankingID(ranking => {
    return (ranking['type'].indexOf('https://dancehallbattle.org/ontology/DancerRanking') !== -1 &&
      ranking['type'].indexOf('https://dancehallbattle.org/ontology/1vs1Ranking') !== -1);
  });
}

async function getDancer2vs2ID() {
  return await getRankingID(ranking => {
    return (ranking['type'].indexOf('https://dancehallbattle.org/ontology/DancerRanking') !== -1 &&
      ranking['type'].indexOf('https://dancehallbattle.org/ontology/2vs2Ranking') !== -1);
  });
}

async function getRankingID(filter) {
  let rankings = await getRankings();

  rankings = rankings.filter(filter);

  if (rankings.length > 0) {
    let latestRanking = rankings[0];

    for (let i = 1; i < rankings.length; i ++) {
      if (new Date(latestRanking.created) < new Date(rankings[i].created)) {
        latestRanking = rankings[i];
      }
    }

    return latestRanking.id;
  } else {
    return null;
  }
}

async function getRankings() {
  const context = {
    '@context': await fs.readJson(path.resolve(__dirname, 'context.json'))
  };
  const comunicaConfig = {sources: [
      { "type": "hypermedia", "value": "https://data.dancehallbattle.org/data" },
      { "type": "hypermedia", "value": "https://data.dancehallbattle.org/rankings" }
    ]};
  const queryEngine = new QueryEngineComunica(comunicaConfig);
  const client = new Client({context, queryEngine});
  const query = `
  query { 
    id @single
    type(_:RANKING)
    type
    created @single
  }`;

  return (await client.query({query})).data;
}

module.exports = {
  getRankingID,
  getRankings,
  getCountryHomeAwayID,
  getCountryHomeID,
  getCountryAwayID,
  getDancerCombinedID,
  getDancer1vs1ID,
  getDancer2vs2ID
};