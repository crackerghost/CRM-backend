const ErpData = require("../models/Form/erp_data");

exports.erp_Data = async (client_id, page = 1, pageSize = 10, module) => {
  try {
    pageSize = Number(pageSize);
    const offset = (page - 1) * pageSize;

    const result = await ErpData.findAndCountAll({
      where: {
        client_id: client_id,
        moduleName: module,
      },
      limit: pageSize,
      offset: offset,
    });

    return {
      data: result.rows,
      totalItems: result.count,
      currentPage: Number(page),
      totalPages: Math.ceil(result.count / pageSize),
    };
  } catch (error) {
    console.error("Error fetching ERP data:", error);
    throw new Error("Error fetching ERP data");
  }
};
