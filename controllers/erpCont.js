exports.create = async (req, res) => {
  const {
    industry,
    source,
    status,
    primaryContactName,
    primaryContactNumber,
    primaryContactEmail,
    cityState,
    country,
    productService,
    expectedCloseDate,
    expectedGoLiveDate,
    assignedRepresentative,
    interestLevel,
  } = req.body;

  if (
    !industry ||
    !source ||
    !status ||
    !primaryContactName ||
    !primaryContactNumber ||
    !primaryContactEmail ||
    !cityState ||
    !country ||
    !productService ||
    !expectedCloseDate ||
    !expectedGoLiveDate ||
    !assignedRepresentative ||
    !interestLevel
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  return res.status(201).json({
    message: "Lead created successfully",
    lead: {
      industry,
      source,
      status,
      primaryContactName,
      primaryContactNumber,
      primaryContactEmail,
      cityState,
      country,
      productService,
      expectedCloseDate,
      expectedGoLiveDate,
      assignedRepresentative,
      interestLevel,
    },
  });
};



exports.getLabels = async()=>{
     try {
         const {moduleName} = req.body
     } catch (error) {
      
     }
}
