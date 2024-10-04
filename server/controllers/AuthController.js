import User from "../models/UserModel.js";
import jwt from 'jsonwebtoken';
import { compare } from "bcrypt";
import bcrypt from 'bcrypt';
import { renameSync, unlinkSync } from "fs";



const maxAge = 3 * 24 * 60 * 60; 

const createToken = (email, userId) => {
    return jwt.sign({ email, userId }, process.env.JWT_KEY, { expiresIn: maxAge });
};

export const signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send("Email and password are required");
        }

        const user = await User.create({ email, password });

        // Set cookie with token
        res.cookie("jwt", createToken(email, user.id), {
            maxAge: maxAge * 1000, 
            secure: true,
            sameSite: "None",
        });

        return res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
            },
        });

    } catch (error) {
        console.log({ error });
        return res.status(500).send(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send("Email and password are required");
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(404).send("User not found");
        }
        const auth = await compare(password, user.password);
        if(!auth){
            return res.status(400).send("Password is incorrect");
        }

        // Set cookie with token
        res.cookie("jwt", createToken(email, user.id), {
            maxAge: maxAge * 1000, 
            secure: true,
            sameSite: "None",
        });

        return res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
                firstName:user.firstName,
                lastName:user.lastName,
                image:user.image,
                color:user.color,
            },
        });

    } catch (error) {
        console.log({ error });
        return res.status(500).send("Internal server error");
    }
};

export const getUserInfo = async (req, res, next) => {
    
    try{
        const userData = await User.findById(req.userId);
        if(!userData){
            return res.status(404).send("User not found");
        }
        return res.status(200).json({
                id: userData.id,
                email: userData.email,
                profileSetup: userData.profileSetup,
                firstName:userData.firstName,
                lastName:userData.lastName,
                image:userData.image,
                color:userData.color,
        });
    }
        catch (error) {
        console.log({ error });
        return res.status(500).send("Internal server error");
    }
};


export const updateProfile = async (request, response, next) => {
    try {
      const { userId } = request;
  
      const { firstName, lastName, color } = request.body;
  
      if (!userId) {
        return response.status(400).send("User ID is required.");
      }
  
      if (!firstName || !lastName) {
        return response.status(400).send("Firstname and Last name is required.");
      }
  
      const userData = await User.findByIdAndUpdate(
        userId,
        {
          firstName,
          lastName,
          color,
          profileSetup: true,
        },
        {
          new: true,
          runValidators: true,
        }
      );
      return response.status(200).json({
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        image: userData.image,
        profileSetup: userData.profileSetup,
        color: userData.color,
      });
    } catch (error) {
      return response.status(500).send("Internal Server Error.");
    }
  };

  export const addProfileImage = async (request, response, next) => {
    try {
      if (request.file) {
        const date = Date.now();
        let fileName = "uploads/profiles/" + date + request.file.originalname;
        renameSync(request.file.path, fileName);
        const updatedUser = await User.findByIdAndUpdate(
          request.userId,
          { image: fileName },
          {
            new: true,
            runValidators: true,
          }
        );
        return response.status(200).json({ image: updatedUser.image });
      } else {
        return response.status(404).send("File is required.");
      }
    } catch (error) {
      console.log({ error });
      return response.status(500).send("Internal Server Error.");
    }
  };
  
  export const removeProfileImage = async (request, response, next) => {
    try {
      const { userId } = request;
  
      if (!userId) {
        return response.status(400).send("User ID is required.");
      }
  
      const user = await User.findById(userId);
  
      if (!user) {
        return response.status(404).send("User not found.");
      }
  
      if (user.image) {
        unlinkSync(user.image);
      }
  
      user.image = null;
      await user.save();
  
      return response
        .status(200)
        .json({ message: "Profile image removed successfully." });
    } catch (error) {
      console.log({ error });
      return response.status(500).send("Internal Server Error.");
    }
  };

  export const logout = async (request, response, next) => {
    try {
      response.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });
      return response.status(200).send("Logout successful");
    } catch (err) {
      return response.status(500).send("Internal Server Error");
    }
  };
  
  