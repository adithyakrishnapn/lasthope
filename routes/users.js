var express = require("express");
var router = express.Router();
var userhelper = require("../helpers/user-helper");
const session = require("express-session");
const { response } = require("../app");
const { helpers } = require("handlebars");
const ChatMessage = require("../config/chatMessage");
const fs = require("fs");
const path = require("path");
//middleware for login
const login = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    req.session.formData = req.body;

    if (req.files && req.files.Image) {
      req.session.ImageSave = req.files.Image.name;
      let name = req.files.Image.name;
      let image = req.files.Image;
      image.mv("./public/temp/" + name + ".jpg", (err, done) => {
        if (!err) {
          console.log("successfully images moved");
        } else {
          console.log(err);
        }
      });
    } else {
      console.log("No image file found");
    }

    res.redirect("/signIn");
  }
};

const loginChat = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    req.session.Chatid = req.params.id;
    res.redirect("/signIn");
  }
};



const mailcheck = async (req, res, next) => {
  try {
    // Fetch all user data
    const fetchmail = await userhelper.fetchUser();
    
    // Log fetched data and request body for debugging
    console.log("Fetched emails from database:", fetchmail);
    console.log("Request body mail:", req.body.mail);
    
    // Check if the email already exists (case-insensitive)
    const emailExists = fetchmail.some((user) => user.mail.toLowerCase() === req.body.mail.toLowerCase());
    
    if (emailExists) {
      console.log("Email already exists:", req.body.mail);
      res.redirect("/signup?error=email_exists"); 
      
    } else {
      console.log("Email does not exist:", req.body.mail);
      // Proceed to the next middleware or handler
      next()
    }
  } catch (err) {
    console.error("Error checking email:", err);
    // Handle the error, e.g., by passing it to the next middleware
  }
};



/* GET home page. */
router.get("/", function (req, res, next) {
  let user = req.session.user;
  res.render("users/index", { user, title: "Lasthope", main: true });
});

router.get("/lostSomething", (req, res) => {
  let user = req.session.user;
  res.render("users/lostSomething", {
    user,
    title: "Add Your Thing",
    ls: true,
  });
});

router.get("/govAutherized", (req, res) => {
  let user = req.session.user;
  res.render("users/products/gov", { user, title: "Select Details", ls: true });
});

router.get("/other", (req, res) => {
  let user = req.session.user;
  res.render("users/products/otherstuffs", {
    user,
    title: "Select Details",
    ls: true,
  });
});

router.get("/otherfound", (req, res) => {
  let user = req.session.user;
  res.render("users/found/otherfound", {
    user,
    title: "Select Details",
    fs: true,
  });
});

router.get("/signIn", (req, res) => {
  res.render("users/login", { title: "Log In", sn: true });
});

router.get("/signup", (req, res) => {
  res.render("users/signup", { title: "Create Account", sp: true, error: req.query.error });
});


router.post("/signup", mailcheck,(req, res) => {
    userhelper.DoSignUp(req.body).then((response) => {
      console.log(req.body);
      console.log(response);
      req.session.loggedIn = true;
      req.session.user = response.username;
      req.session.mail = req.body.mail;

      if (req.session.formData) {
        // Append email to the formData before saving
        const detailsToSave = {
          ...req.session.formData,
          email: req.body.mail,
        };

        console.log(req.session.formData.category);
        // Determine which helper function to use based on the form data or some identifier
        const helperFunction =
          req.session.formData.check === "found"
            ? userhelper.FoundItems
            : userhelper.AddDetails;

        // Insert the form data along with the email into the database
        helperFunction(detailsToSave)
          .then((id) => {
            if (req.session.ImageSave) {
              let imageName = req.session.ImageSave;

              if (!imageName) {
                console.log("No image name found in session.");
                return res.status(400).send("No image to move.");
              }

              // Define paths
              const tempPath = path.join(
                __dirname,
                "..",
                "public",
                "temp",
                `${imageName}.jpg`
              );
              const finalPath = path.join(
                __dirname,
                "..",
                "public",
                "product-images",
                `${id}.jpg`
              );

              // Log paths for debugging
              console.log("Temp Path:", tempPath);
              console.log("Final Path:", finalPath);

              // Check if the source file exists
              if (!fs.existsSync(tempPath)) {
                console.log("Source file does not exist at:", tempPath);
                return res.status(404).send("Source file not found.");
              }

              // Ensure the product-images directory exists
              const productImagesDir = path.dirname(finalPath);
              if (!fs.existsSync(productImagesDir)) {
                fs.mkdirSync(productImagesDir, { recursive: true });
              }

              // Move the image
              fs.rename(tempPath, finalPath, (err) => {
                if (err) {
                  console.log("Error moving image:", err);
                  return res.status(500).send("Failed to move image.");
                }
                console.log("Image moved successfully to", finalPath);

                // Clean up and respond
                req.session.formData = null; // Clear the formData from session after saving
                req.session.ImageSave = null;
                res.redirect("/userpanel"); // Redirect to home or another appropriate route after successful insertion
              });
            } else {
              console.log("No iage found so Inserting Data with default Image");
              req.session.formData = null; // Clear the formData from session after saving
              res.redirect("/userpanel"); // Redirect to home or another appropriate route after successful insertion
            }
          })
          .catch((error) => {
            console.error("Error inserting data: ", error);
            res.status(500).send("Failed to insert form data");
          });
      } else if (req.session.Chatid) {
        const chatId = req.session.Chatid;
        req.session.Chatid = null; // Clear Chat ID
        // Adjust this condition based on your user model
        if (response.user.isFound) {
          res.redirect(`/chat/found${chatId}`);
        } else {
          res.redirect(`/chat/product${chatId}`);
        }
      } else {
        console.log("Messed Up bro");
        // No form data to process, redirect to home or another appropriate route
        res.redirect("/");
      }
    });
});

router.post("/login", (req, res) => {
  userhelper
    .DoLogIn(req.body)
    .then((response) => {
      if (response.status) {
        // Setting the session variables
        req.session.loggedIn = true;
        req.session.user = response.user;
        req.session.mail = response.user.mail; // Assuming response.user.mail contains the user's email
        console.log(response.user.mail);

        // Check if there is form data stored in the session to be saved
        if (req.session.formData) {
          // Append email to the formData before saving
          const detailsToSave = {
            ...req.session.formData,
            email: response.user.mail,
          };

          console.log(req.session.formData.category);
          // Determine which helper function to use based on the form data or some identifier
          const helperFunction =
            req.session.formData.check === "found"
              ? userhelper.FoundItems
              : userhelper.AddDetails;

          // Insert the form data along with the email into the database
          helperFunction(detailsToSave)
            .then((id) => {
              if (req.session.ImageSave) {
                let imageName = req.session.ImageSave;

                if (!imageName) {
                  console.log("No image name found in session.");
                  return res.status(400).send("No image to move.");
                }

                // Define paths
                const tempPath = path.join(
                  __dirname,
                  "..",
                  "public",
                  "temp",
                  `${imageName}.jpg`
                );
                const finalPath = path.join(
                  __dirname,
                  "..",
                  "public",
                  "product-images",
                  `${id}.jpg`
                );

                // Log paths for debugging
                console.log("Temp Path:", tempPath);
                console.log("Final Path:", finalPath);

                // Check if the source file exists
                if (!fs.existsSync(tempPath)) {
                  console.log("Source file does not exist at:", tempPath);
                  return res.status(404).send("Source file not found.");
                }

                // Ensure the product-images directory exists
                const productImagesDir = path.dirname(finalPath);
                if (!fs.existsSync(productImagesDir)) {
                  fs.mkdirSync(productImagesDir, { recursive: true });
                }

                // Move the image
                fs.rename(tempPath, finalPath, (err) => {
                  if (err) {
                    console.log("Error moving image:", err);
                    return res.status(500).send("Failed to move image.");
                  }
                  console.log("Image moved successfully to", finalPath);

                  // Clean up and respond
                  req.session.formData = null; // Clear the formData from session after saving
                  req.session.ImageSave = null;
                  res.redirect("/userpanel"); // Redirect to home or another appropriate route after successful insertion
                });
              } else {
                console.log(
                  "No iage found so Inserting Data with default Image"
                );
                req.session.formData = null; // Clear the formData from session after saving
                res.redirect("/userpanel"); // Redirect to home or another appropriate route after successful insertion
              }
            })
            .catch((error) => {
              console.error("Error inserting data: ", error);
              res.status(500).send("Failed to insert form data");
            });
        } else if (req.session.Chatid) {
          const chatId = req.session.Chatid;
          req.session.Chatid = null; // Clear Chat ID
          // Adjust this condition based on your user model
          if (response.user.isFound) {
            res.redirect(`/chat/found${chatId}`);
          } else {
            res.redirect(`/chat/product${chatId}`);
          }
        } else {
          // No form data to process, redirect to home or another appropriate route
          res.redirect("/userpanel");
        }
      } else {
        console.log("Login failed");
        res.status(401).send("Login failed"); // Send a response on failed login
      }
    })
    .catch((error) => {
      console.error("Error during login: ", error);
      res.status(500).send("Internal Server Error");
    });
});

router.post("/submitGov", login, (req, res, next) => {
  const details = {
    email: req.session.user.mail,
    ...req.body, // Spread syntax to copy all properties from req.body into the new object
  };

  userhelper.AddDetails(details).then((id) => {
    console.log(id);
    if (req.files && req.files.Image) {
      let image = req.files.Image;
      image.mv("./public/product-images/" + id + ".jpg", (err, done) => {
        if (!err) {
          console.log("successfully images moved");
        } else {
          console.log(err);
        }
      });
    } else {
      console.log("No Image found Broooo");
    }
    res.redirect("/userpanel");
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Array to mask
const gov = ["aadhar card", "pan card", "ration card", "driving liscence"];

// Define the maskNumber function
function maskNumber(number) {
  if (typeof number === "string") {
    return number.replace(/\d(?=\d{4})/g, "*"); // Mask all but the last 4 digits
  }
  return number; // Return the original number if it's not a string
}

// Route to display all items (default view)
router.get("/views", async (req, res) => {
  try {
    let user = req.session.user;
    const [product, categories, place] = await Promise.all([
      userhelper.GetItems(),
      userhelper.GetCategories(),
      userhelper.GetPlace(),
    ]);

    // Mask the government ID numbers if they belong to the gov array
    product.forEach((item) => {
      if (
        item.category &&
        gov.includes(item.category.toLowerCase()) &&
        item.number
      ) {
        item.number = maskNumber(item.number);
      }
    });

    res.render("users/view", {
      user,
      title: "View",
      product,
      categories,
      place,
      selectedPlace: "",
      selectedCategory: "",
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to display items based on the check parameter
router.get("/views/:check", async (req, res) => {
  const check = req.params.check;
  let user = req.session.user;
  if (check === "check1") {
    try {
      const [product, categories, place] = await Promise.all([
        userhelper.GetItems(),
        userhelper.GetCategories(),
        userhelper.GetPlace(),
      ]);

      // Mask the government ID numbers if they belong to the gov array
      product.forEach((item) => {
        if (
          item.category &&
          gov.includes(item.category.toLowerCase()) &&
          item.number
        ) {
          item.number = maskNumber(item.number);
        }
      });

      res.render("users/view", {
        title: "View",
        product,
        found: [],
        categories,
        place,
        user,
        selectedPlace: "",
        selectedCategory: "",
      });
    } catch (error) {
      console.error("Error fetching data: ", error);
      res.status(500).send("Internal Server Error");
    }
  } else if (check === "check2") {
    try {
      const [found, categories, place] = await Promise.all([
        userhelper.GeFound(),
        userhelper.GetCategoriesFound(),
        userhelper.GetPlaceFound(),
      ]);

      // Mask the government ID numbers if they belong to the gov array
      found.forEach((item) => {
        if (
          item.category &&
          gov.includes(item.category.toLowerCase()) &&
          item.number
        ) {
          item.number = maskNumber(item.number);
        }
      });

      res.render("users/view", {
        title: "View",
        product: [],
        found,
        categories,
        place,
        user,
        selectedPlace: "",
        selectedCategory: "",
      });
    } catch (error) {
      console.error("Error fetching data: ", error);
      res.status(500).send("Internal Server Error");
    }
  } else if (check === "check3") {
    let data = {
      ...req.query, // Accessing query parameters instead of the request body
    };
    console.log(data);
    if (!req.query.fcategories && req.query.fplace) {
      const [found, categories, place] = await Promise.all([
        userhelper.FilterPlace(req.query.fplace),
        userhelper.GetCategoriesFound(),
        userhelper.GetPlaceFound(),
      ]);

      // Mask the government ID numbers if they belong to the gov array
      found.forEach((item) => {
        if (
          item.category &&
          gov.includes(item.category.toLowerCase()) &&
          item.number
        ) {
          item.number = maskNumber(item.number);
        }
      });

      res.render("users/view", {
        title: "View",
        found,
        categories,
        place,
        user,
        selectedPlace: req.query.fplace,
        selectedCategory: "",
      });
    } else if (req.query.fplace === "") {
      const [found, categories, place] = await Promise.all([
        userhelper.FilterCategories(req.query.fcategories),
        userhelper.GetCategoriesFound(),
        userhelper.GetPlaceFound(),
      ]);

      // Mask the government ID numbers if they belong to the gov array
      found.forEach((item) => {
        if (
          item.category &&
          gov.includes(item.category.toLowerCase()) &&
          item.number
        ) {
          item.number = maskNumber(item.number);
        }
      });

      res.render("users/view", {
        title: "View",
        found,
        categories,
        place,
        user,
        selectedPlace: "",
        selectedCategory: req.query.fcategories,
      });
    } else {
      const [found, categories, place] = await Promise.all([
        userhelper.FilterAll(req.query.fcategories, req.query.fplace),
        userhelper.GetCategoriesFound(),
        userhelper.GetPlaceFound(),
      ]);

      // Mask the government ID numbers if they belong to the gov array
      found.forEach((item) => {
        if (
          item.category &&
          gov.includes(item.category.toLowerCase()) &&
          item.number
        ) {
          item.number = maskNumber(item.number);
        }
      });

      res.render("users/view", {
        title: "View",
        found,
        categories,
        place,
        user,
        selectedPlace: req.query.fplace,
        selectedCategory: req.query.fcategories,
      });
    }
  } else if (check === "check4") {
    let data = {
      ...req.query, // Accessing query parameters instead of the request body
    };
    console.log(data);
    if (!req.query.fcategories && req.query.fplace) {
      const [product, categories, place] = await Promise.all([
        userhelper.ProductFilterPlace(req.query.fplace),
        userhelper.GetCategories(),
        userhelper.GetPlace(),
      ]);

      // Mask the government ID numbers if they belong to the gov array
      product.forEach((item) => {
        if (
          item.category &&
          gov.includes(item.category.toLowerCase()) &&
          item.number
        ) {
          item.number = maskNumber(item.number);
        }
      });

      res.render("users/view", {
        title: "View",
        product,
        categories,
        place,
        user,
        selectedPlace: req.query.fplace,
        selectedCategory: "",
      });
    } else if (req.query.fplace === "") {
      const [product, categories, place] = await Promise.all([
        userhelper.ProductFilterCategories(req.query.fcategories),
        userhelper.GetCategories(),
        userhelper.GetPlace(),
      ]);

      // Mask the government ID numbers if they belong to the gov array
      product.forEach((item) => {
        if (
          item.category &&
          gov.includes(item.category.toLowerCase()) &&
          item.number
        ) {
          item.number = maskNumber(item.number);
        }
      });

      res.render("users/view", {
        title: "View",
        product,
        categories,
        place,
        user,
        selectedPlace: "",
        selectedCategory: req.query.fcategories,
      });
    } else {
      const [product, categories, place] = await Promise.all([
        userhelper.ProductFilterAll(req.query.fcategories, req.query.fplace),
        userhelper.GetCategories(),
        userhelper.GetPlace(),
      ]);

      // Mask the government ID numbers if they belong to the gov array
      product.forEach((item) => {
        if (
          item.category &&
          gov.includes(item.category.toLowerCase()) &&
          item.number
        ) {
          item.number = maskNumber(item.number);
        }
      });

      res.render("users/view", {
        title: "View",
        product,
        categories,
        place,
        user,
        selectedPlace: req.query.fplace,
        selectedCategory: req.query.fcategories,
      });
    }
  } else {
    res.send("No data to show");
  }
});

router.get("/foundsomething", (req, res) => {
  let user = req.session.user;
  res.render("users/foundsomething", {
    user,
    title: "What did you found ?",
    fs: true,
  });
});

router.get("/found_gov", (req, res, next) => {
  let user = req.session.user;
  res.render("users/found/gov.hbs", {
    title: "found something",
    user,
    fs: true,
  });
});

router.post("/foundGov", login, (req, res) => {
  const details = {
    email: req.session.user.mail,
    ...req.body,
  };

  userhelper.FoundItems(details).then((id) => {
    console.log(id);
    if (req.files && req.files.Image) {
      let image = req.files.Image;
      image.mv("./public/product-images/" + id + ".jpg", (err, done) => {
        if (!err) {
          console.log("successfully images moved");
        } else {
          console.log(err);
        }
      });
    } else {
      console.log("No Image found Broooo");
    }
    res.redirect("/userpanel");
  });
});

//userDashboard
router.get("/userpanel", login, (req, res) => {
  let user = req.session.user;
  let mail = req.session.mail;
  let nm = "Lost";
  console.log(user);
  userhelper.UserDetails(mail).then((lostItem) => {
    console.log("fetched");

    res.render("users/userpanel", {
      title: "User",
      user,
      lostItem,
      nm,
      nofooter: true,
    });
  });
});

router.get("/userpanel/lost", login, (req, res, next) => {
  try {
    let user = req.session.user;
    let nm = "Lost";
    userhelper.UserDetails(req.session.mail).then((lostItem) => {
      console.log("Fetched Lost Items");
      res.render("users/userpanel", {
        title: "User",
        lostItem,
        user,
        nm,
        nofooter: true,
      }); // Pass foundItem to the view
    }); // Ensure the function name matches your helper method
  } catch (err) {
    next(err); // Pass the error to the error handler
  }
});

router.get("/userpanel/found", login, (req, res, next) => {
  try {
    let user = req.session.user;
    let nm = "found";
    userhelper.ProdDetails(req.session.mail).then((foundItem) => {
      console.log("Fetched founded Items");
      res.render("users/userpanel", {
        title: "User",
        foundItem,
        user,
        nm,
        nofooter: true,
      }); // Pass foundItem to the view
    }); // Ensure the function name matches your helper method
  } catch (err) {
    next(err); // Pass the error to the error handler
  }
});

router.get("/userpanel/chatspanel", login, async (req, res, next) => {
  let user = req.session.user;
  let mail = req.session.mail;
  try {
    const messages = await userhelper.ShowMessagesId(mail, user.username);
    console.log(messages);
    res.render("users/chatspanel", {
      title: "Chats",
      user,
      messages,
      nofooter: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" }); // Send an error response in case of failure
  }
});

router.get("/userpanel/founddel/:id", (req, res, next) => {
  let productId = req.params.id;
  try {
    userhelper.DeleteMessages(productId);
    userhelper.FoundMessages(productId);
    res.redirect("/userpanel/found");
  } catch (error) {
    next(error); // Handle errors appropriately
  }
});

router.get("/userpanel/Lostdel/:id", (req, res, next) => {
  let productId = req.params.id;
  try {
    userhelper.DeleteMessages(productId);
    userhelper.LostMessages(productId);
    res.redirect("/userpanel/lost");
  } catch (error) {
    next(error); // Handle errors appropriately
  }
});

router.get("/userpanel/lostcomplete/:id", (req, res, next) => {
  let productId = req.params.id;
  try {
    userhelper.updateMessageLost(productId);
    const log = userhelper.GetLostById(productId);
    console.log(log);
    res.redirect("/userpanel/lost");
  } catch (error) {
    next(error); // Handle errors appropriately
  }
});

router.get("/userpanel/foundcomplete/:id", (req, res, next) => {
  let productId = req.params.id;
  try {
    userhelper.updateMessageFound(productId);
    const log = userhelper.GetfoundById(productId);
    console.log(log);
    res.redirect("/userpanel/found");
  } catch (error) {
    next(error); // Handle errors appropriately
  }
});

router.get("/view-products/found:id", async (req, res, next) => {
  try {
    let user = req.session.user;
    const productId = req.params.id;
    const foundItem = await userhelper.GetfoundById(productId); // Ensure the function name matches your helper method
    console.log(foundItem);

    // Mask the government ID numbers if they belong to the gov array
    if (gov.includes(foundItem.category.toLowerCase())) {
      foundItem.number = maskNumber(foundItem.number);
      console.log(foundItem.number);
    }
    res.render("users/viewProducts", { title: "View", foundItem, user }); // Pass foundItem to the view
  } catch (err) {
    next("error : ", err); // Pass the error to the error handler
  }
});

router.get("/view-products/product:id", async (req, res, next) => {
  try {
    let user = req.session.user;
    const productId = req.params.id;
    const lostItem = await userhelper.GetLostById(productId); // Ensure the function name matches your helper method
    console.log(lostItem);

    // Mask the government ID numbers if they belong to the gov array
    if (gov.includes(lostItem.category.toLowerCase())) {
      lostItem.number = maskNumber(lostItem.number);
      console.log(lostItem.number);
    }
    res.render("users/viewProducts", { title: "View", lostItem, user }); // Pass lostItem to the view
  } catch (err) {
    next(err); // Pass the error to the error handler
  }
});

// In your routes file
// Fetch messages for a given product ID
router.get("/chat/found:id", loginChat, async (req, res, next) => {
  try {
    const productId = req.params.id;
    const foundItem = await userhelper.GetfoundById(productId);
    const user = req.session.user;
    let receivermail = foundItem.email;
    const category = "Found";

    let messages;
    if (foundItem.email === req.session.mail) {
      receivermail = req.session.mail;
      const senders = await userhelper.ShowMessagesUser(receivermail);

      if (senders.length > 0 && senders[0].sendermail) {
        const sendermail = senders[0].sendermail;
        messages = await userhelper.ShowMessages(
          sendermail,
          productId,
          receivermail,
          category
        );

        if (gov.includes(foundItem.category.toLowerCase())) {
          foundItem.number = maskNumber(foundItem.number);
          console.log(foundItem.number);
        }

        res.render("users/chat", {
          title: "Chat",
          foundItem,
          userSend: true,
          messages,
          receivermail,
          category,
          sendermail,
          user,
        });
      } else {
        throw new Error("Sender email not found");
      }
    } else {
      messages = await userhelper.ShowMessages(
        user.mail,
        productId,
        receivermail,
        category
      );
      console.log("messages", messages);
      // Mask the government ID numbers if they belong to the gov array
      if (gov.includes(foundItem.category.toLowerCase())) {
        foundItem.number = maskNumber(foundItem.number);
        console.log(foundItem.number);
      }
      res.render("users/chat", {
        title: "Chat",
        foundItem,
        user,
        messages,
        receivermail,
        category,
        sendermail: user.mail,
      });
    }
  } catch (err) {
    next(err);
  }
});

router.get("/chat/product:id", loginChat, async (req, res, next) => {
  try {
    const productId = req.params.id;
    const lostItem = await userhelper.GetLostById(productId);
    const user = req.session.user;
    let receivermail = lostItem.email;
    const category = "Lost";

    let messages;
    if (lostItem.email === req.session.mail) {
      receivermail = req.session.mail;
      const senders = await userhelper.ShowMessagesUser(receivermail);

      if (senders.length > 0 && senders[0].sendermail) {
        const sendermail = senders[0].sendermail;
        messages = await userhelper.ShowMessages(
          sendermail,
          productId,
          receivermail,
          category
        );

        // Mask the government ID numbers if they belong to the gov array
        if (gov.includes(lostItem.category.toLowerCase())) {
          lostItem.number = maskNumber(lostItem.number);
          console.log(lostItem.number);
        }
        res.render("users/chat", {
          title: "Chat",
          lostItem,
          userSend: true,
          messages,
          receivermail,
          category,
          sendermail,
          user,
        });
      } else {
        throw new Error("Sender email not found");
      }
    } else {
      messages = await userhelper.ShowMessages(
        user.mail,
        productId,
        receivermail,
        category
      );
      console.log("messages", messages);
      // Mask the government ID numbers if they belong to the gov array
      if (gov.includes(lostItem.category.toLowerCase())) {
        lostItem.number = maskNumber(lostItem.number);
        console.log(lostItem.number);
      }
      res.render("users/chat", {
        title: "Chat",
        lostItem,
        user,
        messages,
        receivermail,
        category,
        sendermail: user.mail,
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
