const { gmailToken } = require("../models");
const {
  createRecord,
  updateRecords,
  findRecords,
} = require("../utils/Sequalize");

exports.saveAccessToken = async (ac_token, rf_token, email) => {
  try {
    const exist = await findRecords(gmailToken, {
      where: { gmail: email },
    });

    if (exist && exist.length > 0) { 
      const updated = await updateRecords(
        gmailToken,
        { access_token: ac_token, refresh_token: rf_token },
        { where: { gmail: email } }
      );
      return updated;
    } else {
      const created = await createRecord(gmailToken, {
        access_token: ac_token,
        gmail: email,
        refresh_token: rf_token,
      });
      return created;
    }
  } catch (error) {
    throw new Error(error);
  }
};
