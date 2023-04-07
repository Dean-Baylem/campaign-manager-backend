const express = require('express');
const app = express();
const mongoose = require('mongoose');

const worldRoutes = require('./routes/world-routes');
const userPlaces = require('./routes/user-routes');
const HttpError = require('./models/http-error');

const connectionCode = require('./secrets');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/user', userPlaces);
app.use('/worlds', worldRoutes);

// Handling Errors

app.use((req, res, next) => {
    const error = new HttpError('Unable to find this route', 404);
    return next(error);
});

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({message: error.message || 'Unknown error occured'});
});

mongoose
  .connect(
    connectionCode,
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