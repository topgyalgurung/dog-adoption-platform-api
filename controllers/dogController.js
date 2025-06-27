// common js load using (require) and export with module.exports
// es module import/export
// const Dog = require("../models/Dog");
// const User = require("../models/User");
// const mongoose = require("mongoose");
import Dog from "../models/Dog.js";
import User from "../models/User.js";
import mongoose from "mongoose";

//r3: register a dog for adoption providing name and description
const registerDog = async (req, res) => {
  const { name, description } = req.body;
  // console.log(req.userId); // giving undefined
  if (!req.user || !req.user.userId) {
    return res.status(400).json({ message: "Unauthorized: No user ID found" });
  }
  try {
    const newDog = new Dog({ name, description, owner: req.user.userId }); // get user from jwt token, set current user as the owner
    await newDog.save();

    // update user document to include new dog's id
    await User.findByIdAndUpdate(req.userId, {
      // current authenticated user
      $push: { ownedDogs: newDog._id },
    });
    res
      .status(201)
      .json({ message: "Dog registered successfully", dog: newDog });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

// r4: dog adoption: authenticated users can adopt a dog by its id
//  include thank you message for original owner
// dog already adopted can not adopted again, users can not adopt dogs they registered

const adoptDog = async (req, res) => {
  const { dogId } = req.params;
  try {
    const dog = await Dog.findById(dogId);
    if (!dog) {
      return res.status(404).json({ message: "Dog not found" });
    }

    // Check if the dog is already adopted
    if (dog.adoptedBy) {
      return res.status(400).json({ message: "This dog is already adopted" });
    }
    // check if user is trying to adopt their own dog
    if (dog.owner.toString() === req.user.userId) {
      return res
        .status(400)
        .json({ message: "You can not adopt your own dog" });
    }

    // proceed to adopt the dog, ensure successful adoption first then update user's record
    dog.adoptedBy = req.user.userId;
    dog.adoptionStatus = "ADOPTED";
    await dog.save();

    // add adopted adog to the user's adopted dog field
    const user = await User.findById(req.user.userId);
    user.adoptedDogs.push(dog._id); // Add the dog's ID to the adoptedDogs array
    await user.save();

    // send thank you message to original owner
    const originalOwner = await User.findById(dog.owner);
    if (originalOwner) {
      console.log(
        `Thank you, ${originalOwner.username}, for giving ${dog.name} a loving home. ${dog.name} has been adopted by ${req.user.username}.`
      );
      originalOwner.notifications.push({
        message: `Thank you, ${originalOwner.username}, for giving ${dog.name} a loving home. ${dog.name} has been adopted by ${req.user.username}.`,
        date: new Date(),
      });
      await originalOwner.save(); // save updated user with new notification
    }
    // respond with a message to the adopter
    res.status(200).json({
      message: `Thank you for adopting ${dog.name}! We hope you enjoy your new companion.`,
      dog,
    });
  } catch (error) {
    res.status(500).json({ message: "server error ", error: error.message });
  }
};

// r5: Remove dogs: owner can remove their register dogs unless is adopted
// user can not remove dogs registered by others

const removeDog = async (req, res) => {
  const { dogId } = req.params;

  try {
    // Validate if dogId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(String(dogId))) {
      return res.status(400).json({ message: "Invalid Dog ID" });
    }
    const dogObjectId = new mongoose.Types.ObjectId(String(dogId));
    console.log("dobObjectid: ", dogObjectId);
    console.log("user id: ", req.user.userId);

    //  In Mongoose, findOne() is a static method, and it should not be called with new.
    const dog = await Dog.findOne({ _id: dogObjectId, owner: req.user.userId });

    if (!dog) {
      return res.status(403).json({
        message: "No dog or you do not have permission to remove this dog",
      });
    }
    if (dog.adoptedBy) {
      return res
        .status(400)
        .json({ message: "Adopted dog can not be removed" });
    }
    await Dog.findByIdAndDelete(dogId);
    res.status(200).json({ message: "dog removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// r6: list registered dogs: authenticated users can list dogs they have registered with support for filtering by status and pagination
// GET /api/dogs/owned?status=AVAILABLE&page=1&limit=10
// GET /api/dogs/owned?page=2&limit=5
const listOwnedDogs = async (req, res) => {
  //  support for filtering by status and pagination
  // current page
  console.log("User ID from request ", req.user.userId);
  const { status, page = 1, limit = 2 } = req.query;

  // two ways skip or limit
  try {
    // Checks if userId is already an ObjectId. owner field might be string, convert to objectid
    // const userObjectId = mongoose.isValidObjectId(req.user.userId)
    //   ? new mongoose.Types.ObjectId(req.user.userId)
    //   : req.user.userId;
    // build filter based on status
    const filter = { owner: req.user.userId }; // ensure only current user's dogs are listed
    if (status) {
      filter.adoptionStatus = status.toUpperCase();
    }
    // convert to integers. interpret string as base 10
    const pageNum = parseInt(page, 10);
    const dogsPerPage = parseInt(limit, 10);

    // filter by req.userId, ensure only current user's dogs are listed
    const dogs = await Dog.find(filter) // { owner: req.userId })
      .skip((pageNum - 1) * dogsPerPage) // skip previous page
      .limit(dogsPerPage);
    if (dogs.length === 0) {
      return res.status(200).json({ message: "You don't owned any dogs" });
    }
    console.log(dogs);
    res.json(dogs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// r7: list adopted dogs: authenticated users can list dogs they have adopted with pagination support
// exports.listAdoptedDogs = async (req, res) => {
const listAdoptedDogs = async (req, res) => {
  const { page = 1, limit = 2 } = req.query;
  try {
    const filter = { adoptedBy: req.user.userId };

    const pageNum = parseInt(page, 10);
    const dogsPerPage = parseInt(limit, 10);

    const dogs = await Dog.find(filter)
      .skip((pageNum - 1) * dogsPerPage)
      .limit(dogsPerPage);

    if (!dogs || dogs.length === 0) {
      return res.status(200).json({ message: "You have not adopted any dogs" });
    }
    console.log(dogs);
    res.json(dogs);
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

export { registerDog, adoptDog, removeDog, listOwnedDogs, listAdoptedDogs };
