/* const config = require('config.json');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || config.connectionString, { useCreateIndex: true, useNewUrlParser: true });
mongoose.Promise = global.Promise; */


//*********************************
///// !!! Lokijs logical MODEL

// User = {
//     username: name,
//     hash: hash,
//     firstName: firstName,
//     lastName: lastName,
//     createdDate: createdDate
// }

var loki = require('lokijs');

var db;
var connectionPromise = new Promise(function(resolve, reject) {
    db = new loki('user_accounts.db', {
        autoload: true,
        autoloadCallback : function() {
            var entries = db.getCollection("users");
            if (entries === null) {
                entries = db.addCollection("users");
            }
            resolve(db);  
        },
        autosave: true, 
        autosaveInterval: 4000
    });
});

module.exports = connectionPromise;