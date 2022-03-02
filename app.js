const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server is running on http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error:${e.message}`);
  }
};

initializeDBAndServer();

const convertDBObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//API 1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `select * from cricket_team order by player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDBObjectToResponseObject(eachPlayer)
    )
  );
});

//API 2
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    insert into cricket_team (player_name,jersey_number,role)
    values(
        '${playerName}',
        ${jerseyNumber},
        '${role}'
        )`;
  const player = await db.run(addPlayerQuery);

  response.send("Player Added to Team");
});

//API 3
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getBooksQuery = `select * from cricket_team
  where player_id = ${playerId};`;
  const player = await db.get(getBooksQuery);
  response.send(convertDBObjectToResponseObject(player));
});

//API 4
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;

  const updatePlayerQuery = `
    update 
    cricket_team 
    set 
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
    where player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API 5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
  delete from cricket_team where player_id = ${playerId}`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
