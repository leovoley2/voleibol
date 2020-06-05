const cloudinary = require ('cloudinary');
require('dotenv').config({path: 'variables.env'});

cloudinary.config({
    cloud_name = process.env.CLOUD_NAME,
    api_key = process.env.API_KEY,
    api_secret = process.env.API_SECRET
 });

exports.uploads = (File,folder) => {
    stream = cloudinary.uploader.upload_stream(function(result) {
        console.log(result);
        res.send('Done:<br/> <img src="' + result.url + '"/><br/>' +
                 cloudinary.image(result.public_id, { format: "png", width: 100, height: 130, crop: "fill" }));
      }, { public_id: req.body.title } );
      fs.createReadStream(req.files.image.path, {encoding: 'binary'}).on('data', stream.write).on('end', stream.end);
    });
}