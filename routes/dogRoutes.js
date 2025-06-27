import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authenticate.js";

import {
  registerDog,
  adoptDog,
  removeDog,
  listOwnedDogs,
  listAdoptedDogs,
} from "../controllers/dogController.js";

// r3: authenticated users can register dogs awaiting adoption
router.post("/register", authenticate, registerDog);

// r4: dog adoption: authenticated users can adopt a dog by its id include thank you message for orginal owner
// dog already adopted can not adopted again, users can not adopt dogs they registered
router.post("/adopt/:dogId", authenticate, adoptDog);

router.delete("/:dogId", authenticate, removeDog);

router.get("/owned", authenticate, listOwnedDogs); // or registeredDogs

router.get("/adopted", authenticate, listAdoptedDogs);

export default router;
