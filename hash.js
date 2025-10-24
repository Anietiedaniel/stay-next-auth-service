import bcrypt from "bcrypt";

const password = "12345abcde.com"; // your chosen password
const saltRounds = 10;

const hashPassword = async (password) => {
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log("Hashed password:", hash);
    return hash;
  } catch (err) {
    console.error("Error hashing password:", err);
  }
};

// Run the function
hashPassword(password);
