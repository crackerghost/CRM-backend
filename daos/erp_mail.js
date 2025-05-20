const { gmailToken } = require("../models");
const {
  createRecord,
  findByPkRecord,
  updateRecords,
} = require("../utils/Sequalize");

exports.saveAccessToken = async (ac_token, rf_token, email) => {
  try {
    const exist = findByPkRecord(gmailToken, {
      where: {
        gmail: email,
      },
    });
    if (exist) {
      updateRecords(gmailToken, {
        where: {
          access_token: ac_token,
          refresh_token: rf_token,
        },
      });
    }
    const data = createRecord(gmailToken, {
      access_token: ac_token,
      gmail: email,
      refresh_token: rf_token,
    });
    return data;
  } catch (error) {
    throw new Error(error);
  }
};
