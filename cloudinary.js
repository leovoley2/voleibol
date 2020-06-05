const cloudinary = require ('cloudinary');
require('dotenv').config({path: 'variables.env'});

dotenv.config()

cloudinary.config({

    cloud_name= process.env.CLOUD_NAME,
    api_key= process.env.API_KEY,
    api_secret= process.env.API_SECRET

    });

exports.uploads = (File,folder) => {
    return new Promise(resolve => {
        cloudinary.uploader.upload(File,(result) => {
            resolve({
                url:result.url,
                id:result.public_id
            })
        }, {
            resource_type: "auto",
            folder:folder
        })
    })
}