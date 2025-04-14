const FormField = require("../models/Form/form_field");

exports.form_field = async (form_id) => {
  return  await FormField.findAll({
    where: {
      form_id: form_id,
    },
  });
};
