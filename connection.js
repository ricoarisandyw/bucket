const mongoose = require('mongoose')

const con = () => mongoose.connect(process.env.DATABASE_URL);

module.exports = con