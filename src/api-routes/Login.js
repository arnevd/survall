import express from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { MongoClient } from 'mongodb';
import assert from 'assert';


var url = 'mongodb://localhost:27017/cocacola'

var insertUsers = function (db) {
    var collection = db.collection('users');
    // Insert some documents
    collection.insert([
        { _id: "arnevdamme@gmail.com", password: "kalender" }
    ], function (err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        assert.equal(1, result.ops.length);
        console.log('Inserted 1 doc into the collection');
    });
}

var findUsers = function (email, password, db) {
    // Get the documents collection
    var collection = db.collection('users');
    let users = false;
    // Find some documents
    collection.find({_id : email, password: password}).toArray(function (err, results) {
        assert.equal(err, null);
        console.log("Found the following records");
        console.log(results);
        users = results;
    });
    return users;
}


var checkLogin = function (email, password) {
    let users = false;
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        users = findUsers(email, password, db);
        console.log(users)
        db.close();
    })
    return users;
};


var loginApi = express.Router();


loginApi.route('/').post((req, res) => {
    // replace with real database check in production
    // const user = graphql.find(req.login, req.password);
    let user = false;
    const login = req.body.login;
    const password = req.body.password;
    if (login && password) {
        //db lookup
        if (checkLogin("arnevdamme@gmail.com", "kalender")) {
            user = { user, login };
        }

    }

    if (user) {
        const expiresIn = 60 * 60 * 24 * 180; // 180 days
        const token = jwt.sign(user, config.auth.jwt.secret, { expiresIn });
        res.cookie('id_token', token, { maxAge: 1000 * expiresIn, httpOnly: false });
        res.json({ id_token: token });
    } else {
        res.status(401).json({ message: 'To login use user/password' });
    }
});

export default loginApi;
