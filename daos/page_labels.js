const PageLabel = require("../models/Form/erp_labels");

exports.pageLabel = async (page_id) => {
  return await PageLabel.findAll({
    where: {
      page_id: page_id,
    },
  });
};
