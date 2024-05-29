var db = require('../config/connections');
var collections = require('../config/collections');
const bcrypt = require('bcrypt');

module.exports = {
    DoSignUp: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10);
            db.get().collection('users').insertOne(userData).then((data) => {
                resolve(data.insertedId);
            })
        })
    },
    DoLogIn: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            let user = await db.get().collection('users').findOne({ mail: userData.mail });
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        response.user = user;
                        response.status = true;
                        console.log("Login success");
                        resolve(response);
                    } else {
                        console.log("Login failed");
                        resolve({ status: false });
                    }
                });
            }
            else {
                console.log("User not found");
                resolve({ status: false });
            }
        })

    },
    AddDetails: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.Product_Collection).insertOne(data)
                .then((response) => {
                    console.log(response.insertedId);
                    resolve(response.insertedId); // Resolve the promise with the inserted ID
                })
                .catch((error) => {
                    console.error("Error inserting data:", error);
                    reject(error); // Reject the promise if an error occurs
                });
        });
    },
    
    GetItems: ()=>{
        return new Promise(async(resolve,reject)=>{
            let product =await db.get().collection(collections.Product_Collection).find().toArray().then((response)=>{
                resolve(response);
            })
        })
    },

    FoundItems: (data)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.Found_Collection).insertOne(data).then((response)=>{
                console.log(response.insertedId);
                resolve(response.insertedId);
            })
            .catch((err)=>{
                console.log("error : ", err);
                reject(err);
            })
        })
    },

    GeFound : ()=>{
        return new Promise(async(resolve,reject)=>{
            let product = await db.get().collection(collections.Found_Collection).find().toArray().then((response)=>{
                resolve(response);
            })
            .catch((err)=>{
                reject(err);
            })
        })
    }
}