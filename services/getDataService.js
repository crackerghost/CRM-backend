const { erp_Data } = require("../daos/erp_data");
const { erp_Tab_labels } = require("../daos/erp_tabels");
const { form_field } = require("../daos/form_field");
const { pageLabel } = require("../daos/page_labels");

exports.getField_data = async (form_id) => {
  try {
    const data = await form_field(form_id);
    return data;
  } catch (error) {
    throw new Error("Error fetching form data.");
  }
};

exports.fetchLabels = async (page_id) => {
  try {
    const data = await pageLabel(page_id);
    return data;
  } catch (error) {
    throw new Error("Error fetching Labels data.");
  }
};

exports.getErpData = async (client_id, page, pageSize, module) => {
  try {
    const data = await erp_Data(client_id, page, pageSize, module);
    return data;
  } catch (error) {
    throw new Error("Error fetching Erp data.");
  }
};

exports.getTableLabels = async (page_id) => {
  try {
    const data = await erp_Tab_labels(page_id);
    return data;
  } catch (error) {
    throw new Error("Error fetching Erp data.");
  }
};
