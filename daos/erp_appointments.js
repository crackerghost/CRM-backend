const { User } = require("../models");
const Erp_Appointments = require("../models/appointment");
const { createRecord, findRecords } = require("../utils/Sequalize");
const dayjs = require("dayjs");
exports.createAppointments = async (
  parent_id,
  name,
  createdby,
  date,
  time,
  description,
  mlink,
  glink,
  email,
  id,
  module_name
) => {
  try {
    const create = await createRecord(Erp_Appointments, {
      parent_id: parent_id,
      user_id: id,
      name: name,
      creator: createdby,
      description: description,
      date: date,
      time: time,
      meet_link: mlink,
      sender_email: email,
      receiver_email: glink,
      module_name: module_name,
    });
    return create;
  } catch (error) {
    throw new Error(error);
  }
};

exports.fetchAppointments = async (parent_id) => {
  try {
    const appointments = await findRecords(Erp_Appointments, {
      where: { parent_id },
      order: [["createdAt", "DESC"]],
      includes : User
    });

    const now = new Date();
    const upcoming = [];
    const past = [];

    appointments.forEach((app) => {
      const fullDateTime = new Date(`${app.date}T${app.time}`);

      const formatted = {
        ...app.dataValues,
        formattedDate: dayjs(fullDateTime).format("DD MMM YYYY"),
        formattedTime: dayjs(fullDateTime).format("hh:mm A"),
        isUpcoming: fullDateTime >= now,
      };

      if (fullDateTime >= now) {
        upcoming.push(formatted);
      } else {
        past.push(formatted);
      }
    });

    const data = {
      upcoming: upcoming,
      past: past,
    };

    return {
      data,
    };
  } catch (error) {
    throw new Error(error);
  }
};
