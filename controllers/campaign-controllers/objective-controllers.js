const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../../models/http-error");
const Campaign = require("../../models/campaign-models/campaign");
const Objective = require("../../models/campaign-models/objectives");

const createObjective = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new HttpError("Invalid inputs. Please try again!", 422));
    }

    let { objectiveTitle, objectiveDesc, main } = req.body;

    let campaign;
    try {
        campaign = await Campaign.findById(req.params.campaignid);
    } catch (err) {
        return next(new HttpError("Please check campaign details and try again.", 500));
    }

    const newObjective = Objective({
        objectiveTitle,
        objectiveDesc,
        main,
        campaign: req.params.campaignid
    });

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await newObjective.save({session: sess});
        campaign.objectives.push(newObjective);
        await campaign.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError("Failed to create objective. Please try again later.", 500));
    }

    res.status(201).json({objective: newObjective.toObject({getters: true})});

}

const getObjectivesByCampaignId = async (req, res, next) => {
    let objectives;
    const campaignId = req.params.campaignid;
    try {
        objectives = await Objective.find({campaign: campaignId});
    } catch (err) {
        return next(new HttpError("Unable to find. Please check details and try again", 422));
    }

    if (objectives.length === 0) {
        res.status(200).json({objectives: false, message: "No objectives for this campaign"});
    } else {
        res.status(200).json({objectives: objectives});
    }
}

const editObjectiveById = async (req, res, next) => {
    let objective;
    try {
        objective = await Objective.findById(req.params.objectiveid);
    } catch (err) {
        return next(new HttpError("Unable to find objective. Please check details and try again", 422));
    }

    const { objectiveTitle, objectiveDesc, main, completed, successful } = req.body;

    objective.objectiveTitle = objectiveTitle;
    objective.objectiveDesc = objectiveDesc;
    objective.main = main;
    objective.completed = completed;
    objective.successful = successful;

    try {
        await objective.save();
    } catch (err) {
        return next(new HttpError("Unable to save changes. Please try again later", 500));
    }
    
    res.status(200).json({objective: objective.toObject({getters: true})});
}

const deleteObjectiveById = async (req, res, next) => {
    let objective;
    try {
        objective = await Objective.findById(req.params.objectiveid).populate("campaign");
    } catch (err) {
        return next(new HttpError("Unable to find objective. Please check details and try again.", 500));
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await objective.deleteOne({session: sess});
        objective.campaign.objectives.pull(objective);
        await objective.campaign.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError("Could not delete. Please try again later", 500));
    }

    res.status(200).json({message: "Delete successful!"});
}

exports.createObjective = createObjective;
exports.getObjectivesByCampaignId = getObjectivesByCampaignId;
exports.editObjectiveById = editObjectiveById;
exports.deleteObjectiveById = deleteObjectiveById;