const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () =>
      console.log("server running at https://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const movieDbObjectIntoResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//API 1
app.get("/movies/", async (request, response) => {
  const movieQuery = `
    SELECT 
    movie_name
    FROM 
    movie;`;
  const movieNames = await db.all(movieQuery);
  response.send(movieNames.map((each) => ({ movieName: each.movie_name })));
});

//API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const query = `
  INSERT INTO 
  movie(director_id,movie_name,lead_actor)
  VALUES (${directorId},'${movieName}','${leadActor}');
  `;
  await db.run(query);
  response.send("Movie Successfully Added");
});

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetailsQuery = `
    SELECT * 
    FROM movie
    WHERE movie_id = ${movieId};`;
  const resArray = await db.get(movieDetailsQuery);
  response.send(movieDbObjectIntoResponseObject(resArray));
});

//API 4
