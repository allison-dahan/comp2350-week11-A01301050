const router = require("express").Router();
const database = include("databaseConnection");
const { ObjectId } = require("mongodb");
const Joi = require("joi");
//const dbModel = include('databaseAccessLayer');
//const dbModel = include('staticData');

// const userModel = include('models/web_user');
// const petModel = include('models/pet');

const crypto = require("crypto");
const { v4: uuid } = require("uuid");

const passwordPepper = "SeCretPeppa4MySal+";

router.get("/", async (req, res) => {
  console.log("page hit");
  try {
    const userCollection = database.db("lab_example").collection("users");
    const users = await userCollection
      .find()
      .project({ first_name: 1, last_name: 1, email: 1, _id: 1 })
      .toArray();
    if (users === null) {
      res.render("error", { message: "Error connecting to MySQL" });
      console.log("Error connecting to userModel");
    } else {
      console.log(users);
      res.render("index", { allUsers: users });
    }
  } catch (ex) {
    res.render("error", { message: "Error connecting to MySQL" });
    console.log("Error connecting to MySQL");
    console.log(ex);
  }
});



router.get("/pets", async (req, res) => {
  console.log("page hit");
  const schema = Joi.string().max(10).required();

  // Validate the query parameter 'id' against the schema
  const validationResult = schema.validate(req.query.id);

  // If there's an error in the validation result, log it and send an error response
  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.status(400).send(validationResult.error.details[0].message);
    return;
  }
  try {
	const petCollection = database.db('lab_example').collection('pets');
	const pets = await petCollection.find({"_id": ObjectId(req.query.id)}).toArray();
  
	if (pets.length === 0) {
	  res.render("error", { message: "No pets found with the provided id" });
	  console.log("No pets found with the provided id");
	} else {
	  console.log(pets);
	  res.render("pets", { allPets: pets });
	}
  } catch (ex) {
	res.render("error", { message: "Error connecting to MongoDB" });
	console.log("Error connecting to MongoDB");
	console.log(ex);
  }
});

// router.get("/showPets", async (req, res) => {
//   console.log("page hit");
//   try {
//     let userId = req.query.id;
//     const user = await userModel.findByPk(userId);
//     if (user === null) {
//       res.render("error", { message: "Error connecting to MySQL" });
//       console.log("Error connecting to userModel");
//     } else {
//       let pets = await user.getPets();
//       console.log(pets);
//       let owner = await pets[0].getOwner();
//       console.log(owner);

//       res.render("pets", { allPets: pets });
//     }
//   } catch (ex) {
//     res.render("error", { message: "Error connecting to MySQL" });
//     console.log("Error connecting to MySQL");
//     console.log(ex);
//   }
// });

router.get("/deleteUser", async (req, res) => {
    try {
        const schema = Joi.string().max(26).required();
        const validationResult = schema.validate(req.query.id);
        if (validationResult.error) {
            throw new Error(validationResult.error.details[0].message);
        }
        const userId = new ObjectId(req.query.id);
        const userCollection = database.db("lab_example").collection("users");
        const result = await userCollection.deleteOne({ _id: userId });
        if (result.deletedCount === 1) {
            console.log("User deleted:", userId);
        } else {
            console.log("User not found:", userId);
        }
        res.redirect("/");
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(400).send(error.message);
    }
});

router.post("/addUser", async (req, res) => {
	try {
	  // Validate user input using Joi
	  const schema = Joi.object({
		first_name: Joi.string().required(),
		last_name: Joi.string().required(),
		email: Joi.string().email().required(),
		password: Joi.string().required(),
	  });
	  const validationResult = schema.validate(req.body);
	  if (validationResult.error) {
		throw new Error(validationResult.error.details[0].message);
	  }
  
	  // Insert user into the database
	  const newUser = req.body;
	  const userCollection = database.db("lab_example").collection("users");
	  const result = await userCollection.insertOne(newUser);
	  console.log("User added:", result.insertedId);
	  res.redirect("/");
	} catch (error) {
	  console.error("Error adding user:", error);
	  res.render("error", { message: "Error adding user: " + error.message });
	}
  });

/*
router.get('/', (req, res) => {
	console.log("page hit");
	database.getConnection(function (err, dbConnection) {
		if (err) {
			res.render('error', {message: 'Error connecting to MySQL'});
			console.log("Error connecting to mysql");
			console.log(err);
		}
		else {
			
			dbModel.getAllUsers((err, result) => {
				if (err) {
					res.render('error', {message: 'Error reading from MySQL'});
					console.log("Error reading from mysql");
					console.log(err);
				}
				else { //success
					res.render('index', {allUsers: result});

					//Output the results of the query to the Heroku Logs
					console.log(result);
				}
			});
			dbConnection.release();
		}
	});
});
*/

/*
router.post('/addUser', (req, res) => {
	console.log("form submit");
	database.getConnection(function (err, dbConnection) {
		if (err) {
			res.render('error', {message: 'Error connecting to MySQL'});
			console.log("Error connecting to mysql");
			console.log(err);
		}
		else {
			console.log(req.body);
			dbModel.addUser(req.body, (err, result) => {
				if (err) {
					res.render('error', {message: 'Error writing to MySQL'});
					console.log("Error writing to mysql");
					console.log(err);
				}
				else { //success
					res.redirect("/");

					//Output the results of the query to the Heroku Logs
					console.log(result);
				}
			});
			
			dbConnection.release();
		}
	});

});
*/

/*
router.get('/deleteUser', (req, res) => {
	console.log("delete user");
	database.getConnection(function (err, dbConnection) {
		if (err) {
			res.render('error', {message: 'Error connecting to MySQL'});
			console.log("Error connecting to mysql");
			console.log(err);
		}
		else {
			console.log(req.query);

			let userId = req.query.id;
			if (userId) {
				dbModel.deleteUser(userId, (err, result) => {
					if (err) {
						res.render('error', {message: 'Error writing to MySQL'});
						console.log("Error writing to mysql");
						console.log(err);
					}
					else { //success
						res.redirect("/");

						//Output the results of the query to the Heroku Logs
						console.log(result);
					}
				});
			}
			else {
				res.render('error', {message: 'Error on Delete'});
			}
		
			dbConnection.release();
		}
	});
});
*/

module.exports = router;
