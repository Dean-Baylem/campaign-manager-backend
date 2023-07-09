const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../../models/http-error");
const Campaign = require("../../models/campaign-models/campaign");
const Event = require("../../models/campaign-models/events");
const World = require("../../models/worldbuilding-models/world");
const campaign = require("../../models/campaign-models/campaign");

const addEvent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs. Please try again!", 422));
  }

  let campaign;
  try {
    campaign = await Campaign.findById(req.params.campaignid);
  } catch (err) {
    return next(new HttpError("Finding Campaign details failed.", 500));
  }

  const { eventTitle, eventDesc, eventType, eventImgs, heroic } = req.body;

  const newEvent = Event({
    eventTitle,
    eventDesc,
    eventType,
    eventImgs,
    heroic,
    campaign: req.params.campaignid,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newEvent.save({ session: sess });
    campaign.events.push(newEvent);
    await campaign.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(
      new HttpError(
        "Unable to create new event at this time, please try again later",
        500
      )
    );
  }

  res.status(201).json({ event: newEvent.toObject({ getters: true }) });
};

const getEventsByCampaignID = async (req, res, next) => {
  let events;
  try {
    events = await Event.find({ campaign: req.params.campaignid });
  } catch (err) {
    return next(
      new HttpError("Unable to find events. Please try again later.", 500)
    );
  }

  if (events.length === 0) {
    res.status(200).json({ events: "none" });
  } else {
    res.status(200).json({ events: events });
  }
};

const updateEventById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs. Please try again!", 422));
  }

  let event;
  try {
    event = await Event.findById(req.params.eventid);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find this event. Please check the details and try again",
        422
      )
    );
  }

  const { eventTitle, eventDesc, eventType, heroic } = req.body;

  event.eventTitle = eventTitle;
  event.eventDesc = eventDesc;
  event.eventType = eventType;
  event.heroic = heroic;

  try {
    await event.save();
  } catch (err) {
    return next(
      new HttpError("Unable to update. Please try again later.", 500)
    );
  }

  res.status(200).json({ event: event.toObject({ getters: true }) });
};

const deleteEventById = async (req, res, next) => {
  console.log(req.params.eventid);
  let event;

  try {
    event = await Event.findById(req.params.eventid).populate("campaign");
  } catch (err) {
    return next(
      new HttpError("Unable to find event. Please try again later.", 500)
    );
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await event.deleteOne({ session: sess });
    event.campaign.events.pull(event);
    await event.campaign.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Could not delete. Please try again later.", 500)
    );
  }

  res.status(200).json({ message: "delete successful" });
};

const getHeroicEventsByWorldId = async (req, res, next) => {
  let world;
  try {
    world = await World.findById(req.params.worldid).populate({ path: 'campaigns', populate: {path: "events"}});
  } catch (err) {
    return next(
      new HttpError("Unable to find world events. Please try again later", 500)
    );
  }
  
  let heroicEvents = [];

  for (let i =0; i < world.campaigns.length; i++) {
    for (let x=0; x < world.campaigns[i].events.length; x++) {
        if (world.campaigns[i].events[x].heroic === true) {
            heroicEvents.push(world.campaigns[i].events[x].toObject({getters: true}));
        }
    }
  }

  res.status(200).json({heroicEvents: heroicEvents});

};

const getEventsByWorldId = async (req, res, next) => {
  let world;
  try {
    world = await World.findById(req.params.worldid).populate({path: 'campaigns', populate: {path: "events"}});
  } catch (err) {
    return next(new HttpError("Unable to find world. Please check the details and try again.", 500));
  }

  let events = [];
  for (let i = 0; i < world.campaigns.length; i++) {
    for (let x = 0; x < world.campaigns[i].events.length; x++) {
      events.push(world.campaigns[i].events[x].toObject({getters: true}));
    }
  }

  res.status(200).json({events: events});

}

const changeHeroicEvents = async (req, res, next) => {
  const becomeHeroic = req.body.toHeroic;
  const nonHeroic = req.body.nonHeroic;
  for (let i = 0; i < becomeHeroic.length; i++) {
    let event;
    try {
      event = await Event.findById(becomeHeroic[i]);
    } catch (err) {
      console.log(err);
    }

    event.heroic = true;
    
    try {
      await event.save();
    } catch (err) {
      console.log(err);
    }
  }

  for (let i = 0; i < nonHeroic.length; i++) {
    let event;
    try {
      event = await Event.findById(nonHeroic[i]);
    } catch (err) {
      console.log(err);
    }

    event.heroic = false;

    try {
      await event.save();
    } catch (err) {
      console.log(err);
    }
  }

  res.status(200).json({message: "All changes complete"})
}


exports.addEvent = addEvent;
exports.getEventsByCampaignID = getEventsByCampaignID;
exports.updateEventById = updateEventById;
exports.deleteEventById = deleteEventById;
exports.getHeroicEventsByWorldId = getHeroicEventsByWorldId;
exports.getEventsByWorldId = getEventsByWorldId;
exports.changeHeroicEvents = changeHeroicEvents;
