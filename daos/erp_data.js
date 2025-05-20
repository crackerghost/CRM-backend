const { Op, sequelize } = require('sequelize');
const ErpData = require("../models/erp_data");

exports.get_erp_Data = async (
  client_id,
  page = 1,
  pageSize = 10,
  module,
  query,
  filter
) => {
  try {
    pageSize = Number(pageSize);
    const offset = (page - 1) * pageSize;

    const whereConditions = {
      client_id: client_id,
      module_name: module,
    };

    if (filter && query) {
   
     
      whereConditions[filter] = {
        [Op.like]: `%${query.toLowerCase()}%`, 
      };
    }


    const result = await ErpData.findAndCountAll({
      where: whereConditions,
      limit: pageSize,
      offset: offset,
      order: [["updatedAt", "DESC"]],
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
