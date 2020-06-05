const cloudinary = require ('cloudinary');
const dotenv = require ('dotenv');

dotenv.config()

cloudinary.config({

    CLOUD_NAME= 'hmslt7ffb',
    API_KEY= '626868985755416',
    API_SECRET= 'AzZDYJnyVXT4h96RIv_6TyVCfAg'
    
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