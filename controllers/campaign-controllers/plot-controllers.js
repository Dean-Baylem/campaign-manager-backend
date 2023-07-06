const mongoose = require("mongoose");

const HttpError = require("../../models/http-error");
const Campaign = require("../../models/campaign-models/campaign");
const Plot = require("../../models/campaign-models/plot");

const createPlot = async (req, res, next) => {
  let { act, name, description, levelStart, levelFinish, ongoing, visible } =
    req.body;

  let campaign;
  try {
    campaign = await Campaign.findById(req.params.campaignid);
  } catch (err) {
    return next(
      new HttpError("Please check campaign details and try again", 500)
    );
  }

  const newPlot = Plot({
    act,
    name,
    description,
    levelStart,
    levelFinish,
    ongoing,
    visible,
    campaign: req.params.campaignid,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newPlot.save({ session: sess });
    campaign.plots.push(newPlot);
    await campaign.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(
      new HttpError("Failed to create new Plot. Please try again later", 500)
    );
  }

  res.status(201).json({ plot: newPlot.toObject({ getters: true }) });
};

const updatePlotById = async (req, res, next) => {
  let plot;
  try {
    plot = await Plot.findById(req.params.plotid);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find Plot, please check details and try again",
        422
      )
    );
  }

  let { act, name, description, levelStart, levelFinish, ongoing, visible } = req.body;

  plot.act = act;
  plot.name = name;
  plot.description = description;
  plot.levelStart = levelStart;
  plot.levelFinish = levelFinish;
  plot.ongoing = ongoing;
  plot.visible = visible;

  try {
    await plot.save()
  } catch (err) {
    return next(new HttpError("Oops, there was a problem saving changes. Please try again later", 500));
  }

  res.status(200).json({message: "Plot updated!"});
};

const deletePlotById = async (req, res, next) => {
    let plot;
    try {
        plot = await Plot.findById(req.params.plotid).populate("campaign");
    } catch (err) {
        return next(new HttpError("Unable to find plot act, please check details and try again", 422));
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await plot.deleteOne({session: sess});
        plot.campaign.plots.pull(plot);
        await plot.campaign.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError("Could not delete plot act. Please try again later.", 500));
    }

    res.status(200).json({message: "Delete Successful"});
}

exports.createPlot = createPlot;
exports.updatePlotById = updatePlotById;
exports.deletePlotById = deletePlotById;
