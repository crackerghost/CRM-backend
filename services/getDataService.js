const { fetchAttachments } = require("../daos/erp_attachments");
const { get_erp_Data } = require("../daos/erp_data");
const { erp_drop_down } = require("../daos/erp_dropdown");
const { erp_Tab_labels } = require("../daos/erp_tabels");
const { form_field } = require("../daos/form_field");
const { pageLabel } = require("../daos/page_labels");

exports.getField_data = async (form_id, client_Data) => {
  try {
    const data = await form_field(form_id, client_Data);
    return data;
  } catch (error) {
    throw new Error("Error fetching form data.");
  }
};

exports.getLabels = async (page_id) => {
  try {
    const data = await pageLabel(page_id);
    return data;
  } catch (error) {
    throw new Error("Error fetching Labels data.");
  }
};

exports.getErpData = async (
  client_id,
  page,
  pageSize,
  module,
  query,
  filter
) => {
  try {
    const data = await get_erp_Data(
      client_id,
      page,
      pageSize,
      module,
      query,
      filter
    );
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

exports.getDropDowns = async (client_id) => {
  try {
    const data = await erp_drop_down(client_id);
    return data;
  } catch (error) {
    throw new Error("Error fetching DropDown data.");
  }
};


exports.Attachments = async (parent_id) => {
  try {
    if (!parent_id) return null;

    const data = await fetchAttachments(parent_id);
    return data;
  } catch (error) {
    throw new Error("Error fetching attachments.");
  }
};
