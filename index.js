require('dotenv').config();

const express = require('express');
const BucketUtils = require('./bucket')
const formidable = require('formidable')
// const https = require('https')
const cors = require('cors')
// const fs = require('fs')
const Docker = require('dockerode');
const docker = new Docker();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Route to upload file
app.get('/', async (req, res) => {
  res.json({
    message: "it works"
  });
});

// get sample image
app.get('/', async (req, res) => {
  BucketUtils
  res.json({
    message: "it works"
  });
});

// Route to upload file
app.post('/upload', async (req, res) => {
  const form = formidable({ multiples: true, maxFileSize: 300 * 1024 * 1024 });
  form.max
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
app.get('/download/batch/:filename', async (req, res) => {
  const filename = req.params.filename;
  const result = await BucketUtils.download(filename)
  const buffers = []
  result.on('data', (chunk) => {
    buffers.push(chunk)
  })

  const final = await new Promise((resolve) => {
    result.on('end', () => {
      const buffer = Buffer.concat(buffers);
      const base64 = buffer.toString('base64');
      const chunkSize = 100;

      for (let i = 0; i < base64.length; i += chunkSize) {
        const chunk = base64.slice(i, i + chunkSize);
        console.log(chunk);
      }
      resolve(chunk)
    })
  })

  res.send({
    final: final
  })
});

// Route to get file by filename
app.get('/download/:filename', async (req, res) => {
  const filename = req.params.filename;
  (await BucketUtils.download(filename)).pipe(res)
});

app.get('/monitor', async (req, res) => {
  docker.listContainers((err, containers) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal server error');
      return;
    }
    res.json(containers);
  });
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// https
//   .createServer(
//     {
//       key: fs.readFileSync("server.key"),
//       cert: fs.readFileSync("server.cert"),
//     },
//     app
//   )
//   .listen(PORT, function () {
//     console.log(
//       `Example app listening on port ${PORT}! Go to https://localhost:4000/`
//     );
//   });