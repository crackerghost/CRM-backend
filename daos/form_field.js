const { Op, where } = require("sequelize");
const DropDown = require("../models/erp_dropdown");
const FormField = require("../models/form_field");
const State = require("../models/state");
const Citie = require("../models/cities");
const Country = require("../models/countries");


exports.form_field = async (form_id, client_id) => {
  try {
    const fields = await FormField.findAll({
      where: { form_id: form_id },
    });

    const colNames = fields.map((field) => field.col_name);

    // Determine which client_id to use
    const dropdownCount = await DropDown.count({
      where: {
        client_id: client_id,
        col_name: { [Op.in]: colNames },
      },
    });

    const effectiveClientId = dropdownCount > 0 ? client_id : 1;
    // Dynamically determine the dropdown values based on col_name
    const formData = await FormField.findAll({
      where: { form_id: form_id },
      include: [
        {
          model: DropDown,
          where: {
            client_id: effectiveClientId,
            col_name: { [Op.in]: colNames },
          },
          required: false,
        },
      ],
    });

    // Dynamic dropdown population based on col_name
    const populatedFormData = await Promise.all(
      formData.map(async (field) => {
        const fieldData = field.toJSON();

        // Dynamically fetch dropdown options for state, country, and city
        if (fieldData.col_name === "state") {
          const states = await State.findAll(); // Assuming this model exists
          fieldData.erp_dropdowns = states.map((state) => ({
            id: state.id,
            value: state.state_name,
          }));
        } else if (fieldData.col_name === "country") {
          const countries = await Country.findAll(); // Assuming this model exists
          fieldData.erp_dropdowns = countries.map((country) => ({
            id: country.id,
            value: country.country_name,
          }));
        } else if (fieldData.col_name === "city") {
          const cities = await Citie.findAll({
            where: {
              client_id: client_id,
            },
          }); // Assuming this model exists
          fieldData.erp_dropdowns = cities.map((city) => ({
            id: city.id,
            value: city.city_name,
          }));
        }

        // Remove empty dropdowns
        if (!fieldData.erp_dropdowns || fieldData.erp_dropdowns.length === 0) {
          delete fieldData.erp_dropdowns;
        }

        return fieldData;
      })
    );

    return populatedFormData;
  } catch (error) {
    console.error("Error fetching form data:", error);
    throw new Error("Error fetching form data");
  }
};
