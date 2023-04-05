const connection = require('./connection');

const { createReadStream } = require('fs')
const { GridFSBucket } = require('mongodb')

console.log("URL", process.env.DATABASE_URL)

function getFileExtension(filename) {
    const split = filename.split('.');
    if (!filename.includes('data')) {
        return split[split.length - 1] || '';
    }
    return 'base64';
}

const Bucket = async () => {
    // initialize gridfs system
    let bucket;
    try {
        const con = await connection();
        bucket = new GridFSBucket(con.connection.db, {
            bucketName: 'images'
        });

        process.stdout.write('connected to database. \n');
    } catch (error) {
        process.stdout.write('could not connect to database \n', error);
        process.exit();
    }

    return bucket;
};

const BucketUtils = {
    /**
     * upload to grid fs, return filename
     */
    upload: async (file) => {
        try {
            const bucket = await Bucket();
            const ext = getFileExtension(file.originalFilename);
            const filename = `${new Date().getTime()}.${ext}`;
            const writeStream = bucket.openUploadStream(filename);

            const readStream = createReadStream(file.filepath);
            readStream.pipe(writeStream);

            const result = await new Promise((resolve) => {
                writeStream.on('finish', () => {
                    resolve(filename);
                });
            });
            return result;
        } catch (e) {
            throw new Error(e);
        }
    },
    download: async (filename) => {
        const bucket = await Bucket();

        const found = await bucket
            .find({
                filename
            })
            .next();
        return bucket.openDownloadStream(found._id);
    }
};

module.exports = BucketUtils