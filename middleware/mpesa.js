const axios = require("axios");

exports.getAccessToken = async (req, res, next) => {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  const auth = new Buffer.from(`${key}:${secret}`).toString("base64");
  const authurl = process.env.AUTH_ENDPOINT;

  try {
    const result = await axios.get(
      authurl,
      {
        headers: {
          authorization: `Basic ${auth}`,
        },
      }
    );
  
  req.token = result.data.access_token;
  next();
  } catch (err) {
    return res.status(401).send({ error: err.message });
  }
};