const mongoose = require("mongoose");

const HttpError = require("../../models/http-error");
const Campaign = require("../../models/campaign-models/campaign");
const Location = require("../../models/campaign-models/location");

const createLocation = async (req, res, next) => {
    let { locationName, locationDesc } = req.body;

    const newLocation = Location({
        locationName,
        locationDesc,
        campaign: req.params.campaignid,
    });

    let campaign;
    try {
        campaign = await Campaign.findById(req.params.campaignid);
    } catch (err) {
        return next(new HttpError("Unable to find Campaign for the new location. Please check details and try again", 500));
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await newLocation.save({session: sess});
        campaign.locations.push(newLocation);
        await campaign.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError("Failed to create new location. Please try again later", 500));
    }

    res.status(201).json({location: newLocation.toObject({getters: true})});
}

const getLocationById = async (req, res, next) => {
    let location;
    try {
        location = await Location.findById(req.params.locationid);
    } catch (err) {
        return next(new HttpError("Unable to find location, please check details and try again", 500));
    }

    res.status(200).json({location: location});
}

const getLocationsByCampaign = async (req, res, next) => {
    let locations;
    const campaignId = req.params.campaignid;

    try {
        locations = await Location.find({campaign: campaignId});
    } catch (err) {
        return next(new HttpError("Unable to find locations, please check details and try again", 500));
    }

    res.status(200).json({locations: locations});
}

const setCurrentLocation = async (req, res, next) => {
    let location;
    try {
        location = await Location.findById(req.params.locationid);
    } catch (err) {
        return next(new HttpError("Unable to find location details. Please check and try again later", 422));
    }

    location.currentLoaction = true;
    try {
        await location.save();
    } catch (err) {
        return next(new HttpError("Unable to make this the current location at this time. Please try again later", 500));
    }

    res.status(200).json({message: "Current Location Updated"});
}

const removeCurrentLocation = async (req, res, next) => {
    let location;
    try {
      location = await Location.findById(req.params.locationid);
    } catch (err) {
      return next(
        new HttpError(
          "Unable to find location details. Please check and try again later",
          422
        )
      );
    }

    location.currentLoaction = false;
    try {
      await location.save();
    } catch (err) {
      return next(
        new HttpError(
          "Unable to make this the current location at this time. Please try again later",
          500
        )
      );
    }

    res.status(200).json({ message: "Current Location Updated" });
}

const updateLocationDetails = async (req, res, next) => {
    let location;
    try {
        location = await Location.findById(req.params.locationid);
    } catch (err) {
        return next(new HttpError("Unable to find the location. Please check details and try again.", 422));
    }

    let { locationName, locationDesc } = req.body;

    location.locationName = locationName;
    location.locationDesc = locationDesc;

    try {
        await location.save();
    } catch (err) {
        return next(new HttpError("Unable to make changes at this time. Please try again later.", 500));
    }

    res.status(200).json({message: "Location updated!"});
}

const deleteLocationById = async (req, res, next) => {
    let location;
    try {
        location = await Location.findById(req.params.locationid).populate("campaign");
    } catch (err) {
        return next(new HttpError("Unable to find location. Please check details and try again later", 422));
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await location.deleteOne({session: sess});
        location.campaign.locations.pull(location);
        await location.campaign.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError("Could not delete at this time. Please try again later", 500));
    }

    res.status(200).json({message: "Location deleted!"});
}

exports.createLocation = createLocation;
exports.getLocationById = getLocationById;
exports.getLocationsByCampaign = getLocationsByCampaign;
exports.setCurrentLocation = setCurrentLocation;
exports.removeCurrentLocation = removeCurrentLocation;
exports.updateLocationDetails = updateLocationDetails;
exports.deleteLocationById = deleteLocationById
