const mongoose = require('mongoose');

const connect = function() {
    const url = 'mongodb://localhost:27017';
    const dbname = 'lasthope';

    return mongoose.connect(url + '/' + dbname)
    .then(()=>{
        console.log("Connected to database");
    })
    .catch(err => {
        console.error('Failed to connect', err);
        throw err;
    });
};

module.exports.connect = connect;

module.exports.get = function () {
    return mongoose.connection;
};