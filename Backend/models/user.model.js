import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      minLength: [3, "Username must contain at least 3 characters"],
      maxLength: [40, "Username cannot exceed 40 characters"],
    },
    password: {
      type: String,
      select: false, 
      minLength: [5, "Password must contain at least 5 characters"],
      maxLength: [20, "Password cannot exceed 20 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    address: String,
    phone: {
      type: String,
      minLength: [10, "Phone number must contain 10 digits"],
      maxLength: [10, "Phone number must contain 10 digits"],
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    profileImage: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    paymentMethods: {
      bankTransfer: {
        bankAccountNumber: String, 
        bankAccountName: String,
        bankName: String,
      },
      paypal: {
        paypalEmail: String,
      },
      phonepe: {
        phonepeNumber: String, 
      },
    },
    role: {
      type: String,
      enum: ["Auctioneer", "Bidder", "super Admin"], 
      default: "Auctioneer",
    },
    unpaidCommission: {
      type: Number,
      default: 0,
    },
    auctionsWon: {
      type: Number,
      default: 0,
    },
    moneySpent: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Hash the password before saving the user
userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

// Compare the given password with the hashed password in the database
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Generate a JSON Web Token
userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_KEY_SECRET, {
    expiresIn: "7d",
  });
};

export const User = mongoose.model("User", userSchema);
