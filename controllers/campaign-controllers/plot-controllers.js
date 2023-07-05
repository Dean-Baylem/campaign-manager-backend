const mongoose = require("mongoose");

const HttpError = require("../../models/http-error");
const Campaign = require("../../models/campaign-models/campaign");
const Plot = require("../../models/campaign-models/plot");

const createPlot = async (req, res, next) => {
    let { act, name, description, levelStart, levelFinish, ongoing, visible } = req.body;

    let campaign;
    try {
        campaign = await Campaign.findById(req.params.campaignid);
    } catch (err) {
        return next(new HttpError("Please check campaign details and try again", 500));
    }

    const newPlot = Plot({
        act,
        name,
        description,
        levelStart,
        levelFinish,
        ongoing,
        visible,
        campaign: req.params.campaignid
    })

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await newPlot.save({session: sess});
        campaign.plots.push(newPlot);
        await campaign.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError("Failed to create new Plot. Please try again later", 500));
    }

    res.status(201).json({plot: newPlot.toObject({getters: true})});
}

exports.createPlot = createPlot;