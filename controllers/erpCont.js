const {
  getField_data,
  fetchLabels,
  getErpData,
  getTableLabels,
} = require("../services/getDataService");

exports.getData = async (req, res) => {
  const { page_id, form_id, page, pageSize, module } = req.query;
  const { client_id } = req.user;
  try {
    const field_data = await getField_data(form_id);
    const labels = await fetchLabels(page_id);
    const erp_tabel = await getErpData(client_id, page, pageSize, module);
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
