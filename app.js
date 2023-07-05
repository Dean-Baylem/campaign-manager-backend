const express = require("express");
const app = express();
const mongoose = require("mongoose");

const worldRoutes = require("./routes/world-routes");
const playerRoutes = require("./routes/player-routes");
const toolRoutes = require('./routes/tool-routes');
const campaignRoutes = require('./routes/campaign-routes');
const characterRoutes = require('./routes/character-routes');
const npcRoutes = require('./routes/npc-routes');
const commentRoutes = require('./routes/comment-routes');
const HttpError = require("./models/http-error");


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/player", playerRoutes);
app.use("/worlds", worldRoutes);
app.use("/tools", toolRoutes);
app.use("/campaign", campaignRoutes);
app.use('/character', characterRoutes);
app.use("/npc", npcRoutes);
app.use("/comment", commentRoutes);



// Handling Errors

app.use((req, res, next) => {
  const error = new HttpError("Unable to find this route!", 404);
  return next(error);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "Unknown error occured" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zual4ys.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    { useNewUrlParser: true }
  )
  .then(() => {
    app.listen(5000, () => {
      console.log("App listening on port 5000.");
    });
  })
  .catch((err) => {
    console.log(err);
  });
