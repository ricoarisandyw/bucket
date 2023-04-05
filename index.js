require('dotenv').config();

const express = require('express');
const BucketUtils = require('./bucket')
const formidable = require('formidable')

const app = express();
const PORT = process.env.PORT || 3000;

// // Connect to MongoDB
// const conn = mongoose.createConnection(process.env.DATABASE_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });

// Route to upload file
app.post('/upload', async (req, res) => {
    const form = formidable({ multiples: true });
    const file = await new Promise((resolve) =>
        form.parse(req, (err, fields, files) => {
            resolve(files);
        })
    );
    const uploadResult = await BucketUtils.upload(file.file);
    res.json({
        url: uploadResult
    });
});

// Route to get file by filename
app.get('/download/:filename', async (req, res) => {
    const filename = req.params.filename;
    (await BucketUtils.download(filename)).pipe(res)
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
