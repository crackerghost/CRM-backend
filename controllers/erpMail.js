const { saveAccessToken } = require("../daos/erp_mail");
const { fetchAccessTokens } = require("../services/maiService");

exports.storeToken = async (req, res) => {
  const code = req.query.token;
  if (!code) return res.status(400).send("Missing authorization code");

  try {
    const response = await fetchAccessTokens(code);
    const { access_token, refresh_token, expires_in } = response.data;
    const saveData = await saveAccessToken(
      access_token,
      refresh_token,
      req.user.email
    );
    if (saveData) {
      res.status(200).send({
        message: "success",
      });
    }
  } catch (error) {
    console.error(
      "Error fetching tokens:",
      error.response?.data || error.message
    );
    res.status(500).send("Failed to fetch tokens");
  }
};
