const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Undo = require("../Models/login.model"); 

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await Undo.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = new Undo({
    username,
    password, 
    successCounter: 0, 
    failCounter: 0,   
  });

  try {
    await newUser.save();
    return res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    return res.status(500).json({ message: "Error registering user", error: err.message });
  }
});

router.post("/", async (req, res) => {
  const session = await mongoose.startSession(); 
  session.startTransaction();

  try {
    const { username, password } = req.body;

    // Find user
    const user = await Undo.findOne({ username }).session(session);

    if (!user || user.password !== password) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.successCounter += 1;
    await user.save({ session });

    
    const apiResponse = await simulateApiCall();

    if (apiResponse.success) {
      await session.commitTransaction(); 
      session.endSession();
      return res.json({ message: "Login and API call successful", user });
    } else {
      
      await session.abortTransaction(); 
      session.endSession();

     
      const retrySession = await mongoose.startSession();
      retrySession.startTransaction();

      user.failCounter += 1;
      await user.save({ session: retrySession });

      try {
        const retryApiResponse = await simulateApiCall();

        if (retryApiResponse.success) {
          user.successCounter += 1;
          if (user.failCounter > 0) {
            user.failCounter -= 1; 
          }
          await user.save({ session: retrySession }); 

          await retrySession.commitTransaction(); 
          retrySession.endSession();
          return res.json({ message: "Retry successful, counters updated", user });
        } else {
          await retrySession.abortTransaction(); 
          retrySession.endSession();
          return res.status(500).json({ message: "API call failed , login unsuccessful", user });
        }
      } catch (retryError) {
        await retrySession.abortTransaction();
        retrySession.endSession();
        return res.status(500).json({ message: "Retry failed due to an error", error: retryError.message });
      }
    }

  } catch (err) {
    await session.abortTransaction(); 
    session.endSession();
    return res.status(500).json({ message: "Login or transaction failed", error: err.message });
  }
});

async function simulateApiCall() {
  const success = Math.random() > 0.5;
  return success ? { success: true } : { success: false };
}

module.exports = router;
