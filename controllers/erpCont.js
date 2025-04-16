const ErpData = require("../models/Form/erp_data");
const {
  getField_data,
  getLabels,
  getErpData,
  getTableLabels,
} = require("../services/getDataService");

exports.getData = async (req, res) => {
  const { page_id, form_id, page, pageSize, module, query, filter } = req.query;
  const { client_id } = req.user;

  try {
    const field_data = await getField_data(form_id, client_id);
    const labels = await getLabels(page_id);
    const erp_tabel = await getErpData(
      client_id,
      page,
      pageSize,
      module,
      query,
      filter
    );
    const erp_tab_lab = await getTableLabels(page_id);

    res.status(200).send({
      client_Data: erp_tabel,
      tabel_labels: erp_tab_lab,
      fields: field_data,
      labels: labels,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Error fetching data", error });
  }
};

exports.saveData = async (req, res) => {
  try {
    const { id, client_id } = req.user; // Destructure user details from the request
    const moduleName = "CRM";
    // Merge client_id and user_id with the body data
    const savedData = await ErpData.create({
      client_id: client_id,
      user_id: id,
      moduleName: moduleName,
      ...req.body, // Spread the rest of the data from the request body
    });

    // Send success response with saved data
    res.status(201).json({
      message: "Data saved successfully",
      savedData,
    });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({
      message: "Error saving data",
      error: error.message,
    });
  }
};
