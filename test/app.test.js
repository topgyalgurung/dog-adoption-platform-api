process.env.NODE_ENV = "test";

import chaiHttp from "chai-http";
import * as chai from "chai";

const should = chai.should();
const expect = chai.expect();

const use = chai.use;
const request = use(chaiHttp).request.execute;

import app from "../app.js";
import mongoose from "../db.js";

import User from "../models/User.js";
import Dog from "../models/Dog.js";

import { generateToken } from "../utils/jwtUtils.js"; // Import token function

// dotenv.config();

// let chai;
// before(async () => {
//   await import("chai").then((result) => {
//     // chai = result.use(chaiHttp);

//     // Configure chai
//     // chai.use(chaiHttp);
//     chai.should();
//   });
// });

describe("Dog Adoption API Testing ", () => {
  let token; // Token for authenticated requests
  let token_for_dog_adopter;
  let testUserId; // Store the test user's ID
  let adopter_userId;
  let testDogId; // Store the test dog's ID

  let testUser;
  beforeEach(async () => {
    // Clean up the database before each test
    await User.deleteMany({});
    await Dog.deleteMany({});

    testUser = new User({
      username: "testuser",
      password: "password123",
    });
    await testUser.save(); // save the test user

    const newUser = {
      username: "user2",
      password: "password123",
    };
    await request(app).post("/api/users/register").send(newUser);
    // Login to get the token
    const loginResponse1 = await request(app)
      .post("/api/users/login")
      .send(newUser);

    token = loginResponse1.body.token;
    testUserId = loginResponse1.body.userId; // Assuming the response contains userId

    const testDog = {
      name: "Buddy",
      description: "A friendly dog",
    };
    request(app)
      .post("/api/dogs/register")
      .set("Authorization", `Bearer ${token}`)
      .send(testDog)
      .end((err, res) => {
        testDogId = res.body.dog._id; // Store the registered dog's ID for later tests
      });

    // different user to adopt the dog
    const diffUser = {
      username: "user3",
      password: "password321",
    };
    await request(app).post("/api/users/register").send(diffUser);

    // Login to get the token
    const loginResponse2 = await request(app)
      .post("/api/users/login")
      .send(diffUser);

    token_for_dog_adopter = loginResponse2.body.token;
    adopter_userId = loginResponse2.body.userId; // Assuming the response contains userId
  });

  after(async () => {
    await mongoose.connection.close();
    console.log("Disconnected from mongodb after tests");
  });

  describe("Register ", () => {
    it("utest1: should register a new user successfully", (done) => {
      const newUser = {
        username: "newuser",
        password: "password123",
      };

      request(app)
        .post("/api/users/register")
        .send(newUser)
        .end((err, res) => {
          console.log(res.body);
          res.should.have.status(201);
          res.body.should.have
            .property("message")
            .equal("User registered successfully");
          done();
        });
    });

    it("utest2: should return error if username already exists", (done) => {
      const newUser = {
        username: "testuser",
        password: "password123",
      };
      request(app)
        .post("/api/users/register")
        .send(newUser)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.status(409);
          res.body.should.have
            .property("message")
            .equal("Username already exists");
          done();
        });
    });
  });

  /*** LOGIN  */
  // LOGIN TEST
  describe("Login", () => {
    // login with correct credential
    it("should login user with correct credentials", (done) => {
      const loginData = {
        username: "testuser",
        password: "password123",
      };
      request(app)
        .post("/api/users/login")
        .send(loginData)
        .end((err, res) => {
          if (err) return done(err);
          res.body.should.have.property("token");
          done();
        });
    });

    // login with incorrect username
    it("should return error if username does not exist", (done) => {
      const loginData = {
        username: "nonexistentuser",
        password: "password123",
      };

      request(app)
        .post("/api/users/login")
        .send(loginData)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.status(401);
          res.body.should.have.property("error").eql("User does not exist");
          done();
        });
    });

    // login with incorrect password
    it("should return error if password is incorrect", (done) => {
      const loginData = {
        username: "testuser",
        password: "wrongpassword",
      };

      request(app)
        .post("/api/users/login")
        .send(loginData)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.status(401);
          res.body.should.have.property("error").eql("Password is incorrect");
          done();
        });
    });

    // internal server error
    it("should handle internal server error", (done) => {
      // Simulate an error by modifying the login function (mocking or using incorrect logic)
      const loginData = {
        username: "testuser",
        password: "password123",
      };

      // Temporarily break the code to test server error handling (optional, depends on your test environment)
      const originalFindOne = User.findOne;
      User.findOne = () => {
        throw new Error("Simulated DB error");
      };
      request(app)
        .post("/api/users/login")
        .send(loginData)
        .end((err, res) => {
          User.findOne = originalFindOne; // Restore original function

          if (err) return done(err);
          res.should.have.status(500);
          res.body.should.have.property("error").eql("internal server error");
          done();
        });
    });
  });

  // DOG API TEST
  describe("Register Dog", () => {
    it("should register a dog successfully", (done) => {
      const newDog = {
        name: "Max",
        description: "Loyal dog",
      };

      request(app)
        .post("/api/dogs/register")
        .set("Authorization", `Bearer ${token}`)
        .send(newDog)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.have
            .property("message")
            .equal("Dog registered successfully");
          testDogId = res.body.dog._id; // Store the registered dog's ID for later tests
          done();
        });
    });

    it("should adopt a dog successfully", (done) => {
      request(app)
        .post(`/api/dogs/adopt/${testDogId}`)
        .set("Authorization", `Bearer ${token_for_dog_adopter}`)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.status(200); // gets 404 error instead
          done();
        });
    });

    // return error if trying to adopt an already adopted dog
    it("should return error if trying to adopt an already adopted dog", (done) => {
      request(app)
        .post(`/api/dogs/adopt/${testDogId}`)
        .set("Authorization", `Bearer ${token_for_dog_adopter}`)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.status(200); // gets 404 error instead
          done();
        });
      request(app)
        .post(`/api/dogs/adopt/${testDogId}`)
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.status(400);

          done();
        });
    });

    // return error if trying to remove an adopted dog
    // last three test need further troubleshoot...
    it("should return error if trying to remove an adopted dog", (done) => {
      request(app)
        .post(`/api/dogs/adopt/${testDogId}`)
        .set("Authorization", `Bearer ${token_for_dog_adopter}`)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.status(200); // gets 404 error instead
          done();
        });

      request(app)
        .delete(`/api/dogs/${testDogId}`)
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.status(400);
          res.body.should.have
            .property("message")
            .equal("Adopted dog can not be removed");
          done();
        });
    });

    // should list owned dog
    it("should list owned dogs", (done) => {
      request(app)
        .get("/api/dogs/owned")
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });

    // should list adopted dog
    it("should list adopted dogs", (done) => {
      request(app)
        .get("/api/dogs/adopted")
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });
});
