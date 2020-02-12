const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dbConnection = require('_helpers/db');

//const User = db.User;

var db;
dbConnection.then(function(initializedDB) {
    db = initializedDB;
});

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};


async function authenticate({ username, password }) {
    if(!db)
        throw 'Database is not initialized';
    var users = db.getCollection("users");

    const user = users.find({ 'username': username })[0];
    if(!user)
        return;

    if (user && bcrypt.compareSync(password, user.hash)) {
        const { hash, ...userWithoutHash } = user;
        const token = jwt.sign({ 
            id: user.$loki, 
            username: user.username
        }, config.secret);
        return {
            ...userWithoutHash,
            token
        };
    }
}

async function getAll() {
    if(!db)
        throw 'Database is not initialized';
    var users = db.getCollection("users").chain().data();
    if(users.length == 0)
        return;

    //remove hash
    var ui, users_filtered = [];
    for (usr of users) {
        ui = {};
        ui.username = usr.username;
        ui.firstName = usr.firstName;
        ui.lastName = usr.lastName;
        ui.createdDate = usr.createdDate;
        ui.id = usr.$loki;
        users_filtered.push(ui);
    }

    return users_filtered;
}

async function getById(id) { // id == username
    if(!db)
        throw 'Database is not initialized';
    var users = db.getCollection("users");

    
    return users.get(id);
}

async function create(userParam) {
    if(!db)
        throw 'Database is not initialized';
    var users = db.getCollection("users");

    // validate
    if ( users.find({'username': userParam.username})[0] ) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    const user = {
        username : userParam.username,
        hash: '',
        firstName: userParam.firstName,
        lastName: userParam.lastName,
        createdDate: userParam.createdDate  
    }
    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    users.insert(user);
}

async function update(id, userParam) {
    if(!db)
        throw 'Database is not initialized';
    var users = db.getCollection("users");

    var user = users.find({'username': userParam.username})[0];

    // validate
    if (!user) throw 'User not found';
    //if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
    //    throw 'Username "' + userParam.username + '" is already taken';
    //}

    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    users.update(user);
}

async function _delete(id) {
    if(!db)
        throw 'Database is not initialized';
    var users = db.getCollection("users");

    var user = users.get(id);
    users.remove(user);
}