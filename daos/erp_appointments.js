const Erp_Appointments = require("../models/appointment");
const { createRecord, findRecords } = require("../utils/Sequalize");

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

exports.fethcAppointments = async (parent_id) => {
  try {
    const appointments = await findRecords(Erp_Appointments, {
      where: {
        parent_id: parent_id,
      },
    });

    return appointments;
  } catch (error) {
    throw new Error(error);
  }
};
