const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running");
    });
  } catch (e) {
    console.log(`Db Error :${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
//get
app.get("/players/", async (request, response) => {
  const getPlayers = `
      SELECT * FROM player_details;
    `;
  const playersArr = await db.all(getPlayers);
  response.send(playersArr);
});
//get
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
      SELECT * FROM player_details
      WHERE player_id = ${playerId};
    `;
  const player = await db.get(getPlayer);
  response.send(player);
});
//put
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayer = `
     UPDATE 
       player_details
     SET 
       player_name = '${playerName}'
     WHERE player_id = ${playerId};`;
  await db.run(updatePlayer);
  response.send("Player Details Updated");
});
//get
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatch = `
      SELECT * FROM match_details
      WHERE match_id = ${matchId};
    `;
  const match = await db.get(getMatch);
  response.send(match);
});
//get
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const playerMatches = `
     SELECT * 
     FROM player_match_score 
     INNER JOIN match_details 
     ON player_match_score.match_id = match_details.match_id
     WHERE player_id = ${playerId};`;
  const matchesArr = await db.all(playerMatches);
  response.send(matchArr);
});
const convertToResponse = (obj) => {
  return {
    matchId: obj.match_id,
    match: obj.match,
    year: obj.year,
  };
};
//get
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const playerMatches = `
     SELECT * 
     FROM player_match_score 
     INNER JOIN player_details 
     ON player_match_score.player_id = player_details.player_id
     WHERE player_id = ${matchId};`;
  const matchesArr = await db.all(playerMatches);
  response.send(matchesArr.map((obj) => convertToResponse(obj)));
});
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const totalQuery = `
     SELECT * 
     FROM player_details 
     INNER JOIN player_match_score
     ON player_details.player_id = player_match_score.player_id
     GROUP BY player_id = ${playerId}`;
  const details = await db.all(totalQuery);
  response.send(details);
});
module.exports = app;
