const ErpTables = require("../models/Form/erp_tabels");


exports.erp_Tab_labels = async (page_id) => {
  return  await ErpTables.findAll({
    where: {
      page_id: page_id,
    },
  });
};
