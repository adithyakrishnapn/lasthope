const { ObjectId } = require("mongodb");
var db = require("../config/connections");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");

module.exports = {
  DoSignUp: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.password = await bcrypt.hash(userData.password, 10);
      db.get()
        .collection("users")
        .insertOne(userData)
        .then((data) => {
          resolve(data.insertedId);
        });
    });
  },
  DoLogIn: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await db
        .get()
        .collection("users")
        .findOne({ mail: userData.mail });
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
      } else {
        console.log("User not found");
        resolve({ status: false });
      }
    });
  },
  AddDetails: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.Product_Collection)
        .insertOne(data)
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

  //These are the products which are lost
  GetItems: () => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collections.Product_Collection)
        .find()
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },

  //These are the found ones
  FoundItems: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.Found_Collection)
        .insertOne(data)
        .then((response) => {
          console.log(response.insertedId);
          resolve(response.insertedId);
        })
        .catch((err) => {
          console.log("error : ", err);
          reject(err);
        });
    });
  },

  GeFound: () => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collections.Found_Collection)
        .find()
        .toArray()
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  UserDetails: (mail) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collections.Product_Collection)
        .find({ email: mail })
        .toArray()
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          console.log("error found", err);
          reject(err);
        });
    });
  },

  ProdDetails: (mail) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collections.Found_Collection)
        .find({ email: mail })
        .toArray()
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          console.log("error found", err);
          reject(err);
        });
    });
  },

  //This categories and place are is for lost items
  GetCategories: () => {
    return db
      .get()
      .collection(collections.Product_Collection)
      .distinct("category")
      .then((response) => {
        return response;
      })
      .catch((err) => {
        console.log("There is a small error:", err);
        throw err;
      });
  },

  GetPlace: () => {
    return db
      .get()
      .collection(collections.Product_Collection)
      .distinct("lostPlace")
      .then((response) => {
        return response;
      })
      .catch((err) => {
        throw err;
      });
  },

  //This categories and place are is for found items
  GetCategoriesFound: () => {
    return db
      .get()
      .collection(collections.Found_Collection)
      .distinct("category")
      .then((response) => {
        return response;
      })
      .catch((err) => {
        console.log("There is a small error:", err);
        throw err;
      });
  },

  GetPlaceFound: () => {
    return db
      .get()
      .collection(collections.Found_Collection)
      .distinct("findPlace")
      .then((response) => {
        return response;
      })
      .catch((err) => {
        throw err;
      });
  },

  //filter fetching for found items
  FilterPlace: (data) => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collections.Found_Collection)
        .find({ findPlace: data })
        .toArray()
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  FilterCategories: (data) => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collections.Found_Collection)
        .find({ category: data })
        .toArray()
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  FilterAll: (data, place) => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collections.Found_Collection)
        .find({ category: data, findPlace: place })
        .toArray()
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  //filter fetching for lost items
  ProductFilterPlace: (data) => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collections.Product_Collection)
        .find({ lostPlace: data })
        .toArray()
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  ProductFilterCategories: (data) => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collections.Product_Collection)
        .find({ category: data })
        .toArray()
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  ProductFilterAll: (data, place) => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collections.Product_Collection)
        .find({ category: data, lostPlace: place })
        .toArray()
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  //This is for fetching found items using id on view products
  // Fetch found item by ID
  GetfoundById: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const dbInstance = await db.get();
        let objectId;

        // Validate the ID format
        if (!ObjectId.isValid(id)) {
          return reject(new Error(`Invalid ID format: ${id}`));
        }

        objectId = new ObjectId(id);

        const response = await dbInstance
          .collection(collections.Found_Collection)
          .findOne({ _id: objectId });

        if (response) {
          resolve(response);
        } else {
          reject(new Error(`No document found with the given ID: ${id}`));
        }
      } catch (err) {
        console.error(
          `Error occurred while fetching the document with ID: ${id}`,
          err
        );
        reject(
          new Error(`Error occurred while fetching the document with ID: ${id}`)
        );
      }
    });
  },

  //This is for fetching lost items using id on view products
  // Fetch lost item by ID
  GetLostById: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const dbInstance = await db.get();
        let objectId;

        // Validate the ID format
        if (!ObjectId.isValid(id)) {
          return reject(new Error(`Invalid ID format: ${id}`));
        }

        objectId = new ObjectId(id);

        const response = await dbInstance
          .collection(collections.Product_Collection)
          .findOne({ _id: objectId });

        if (response) {
          resolve(response);
        } else {
          reject(new Error(`No document found with the given ID: ${id}`));
        }
      } catch (err) {
        console.error(
          `Error occurred while fetching the document with ID: ${id}`,
          err
        );
        reject(
          new Error(`Error occurred while fetching the document with ID: ${id}`)
        );
      }
    });
  },

  ShowMessages: (smail, id, rmail) => {
    return new Promise(async (resolve, reject) => {
      let message = await db
        .get()
        .collection(collections.Mesage_Collection)
        .find({
          sendermail: smail,
          productId: id,
          receivermail: rmail,
        })
        .toArray()
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  ShowMessagesUser: (mail) => {
    return new Promise(async (resolve, reject) => {
      try {
        const messages = await db
          .get()
          .collection(collections.Mesage_Collection)
          .aggregate([
            {
              $match: {
                receivermail: mail,
                sendermail: { $ne: mail },
              },
            },
            {
              $group: {
                _id: "$userId",
                message: { $last: "$message" },
                username: { $first: "$username" },
                productId: { $first:"$productId"},
                sendermail: { $first: "$sendermail" },
                category : { $first: "$category"},
                timestamp: { $first: "$timestamp" },
              },
            },
          ])
          .toArray();

        resolve(messages);
      } catch (err) {
        reject(err);
      }
    });
  },

  ShowMessagesId: (mail,name) => {
    return new Promise(async (resolve, reject) => {
      try {
        const messages = await db
          .get()
          .collection(collections.Mesage_Collection)
          .aggregate([
            {
              $match: {
                $or: [
                  { sendermail: mail },
                  { receivermail: mail },
                ],
                username: {$ne : name},
              },
            },
            {
              $sort: {
                timestamp: -1,
              },
            },
            {
              $group: {
                _id: "$productId",
                message: { $last: "$message" },
                userId: { $first: "$userId" },
                username: { $first: "$username" },
                sendermail: { $first: "$sendermail" },
                receivermail: { $first: "$receivermail" },
                category: { $first: "$category" },
                timestamp: { $first: "$timestamp" },
              },
            },
          ])
          .toArray();
  
        resolve(messages);
      } catch (err) {
        reject(err);
      }
    });
  },
  

};
