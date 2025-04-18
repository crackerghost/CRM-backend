const PageLabel = require("../models/Form/erp_labels");
const Label_Info = require("../models/Form/erp_labels_info");

exports.pageLabel = async (page_id) => {
  try {
    // Fetch the PageLabel with its associated Label_Info entries
    const pageLabels = await PageLabel.findAll({
      where: {
        page_id: page_id,  // Use the provided page_id
      },
      include: {
        model: Label_Info,
        required: false,  
      },
    });

    return pageLabels;
  } catch (error) {
    console.error('Error fetching page label:', error);
    throw new Error('Error fetching page label');
  }
};
