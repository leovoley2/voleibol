const cloudinary = require('cloudinary');

require('dotenv');

const cloudinaryConfig = (req, res, next) => {

config  ({
cloud_name: process.env.CLOUD_NAME,
api_key: process.env.API_KEY,
api_secret: process.env.API_SECRET,
});

next();

}
export { cloudinaryConfig, uploader };