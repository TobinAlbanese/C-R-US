import User from "./user.js";
console.log('Seed.js loaded');
const users = {
  "king.glory11@gmail.com": { password: "A123", role: "employee", firstName: "King", lastName: "Glory" },
  "tobinmgraham@csus.edu": { password: "A123", role: "employee", firstName: "Tobin", lastName: "Graham" },
  "alyssamjimenez@csus.edu": { password: "A123", role: "employee", firstName: "Alyssa", lastName: "Jimenez" },
  "imranahmad@csus.edu": { password: "A123", role: "employee", firstName: "Imran", lastName: "Ahmad" },
  "rylandporter@csus.edu": { password: "A123", role: "employee", firstName: "Ryland", lastName: "Porter" },
  "lol@csus.edu": { password: "A123", role: "user", firstName: "Lol", lastName: "User" },
  "hsuppal@csus.edu": { password: "A123", role: "admin", firstName: "Harkeerat", lastName: "Uppal" },
};


export async function seedUsers() {
  for (const email in users) {
    const user = users[email];
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      const newUser = new User({
        email,
        password: user.password, 
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      try {
        await newUser.save();
      } catch (err) {
        console.log(`Error saving user ${email}: ${err}`);
      }
    } else {
      console.log(`User ${email} already exists, skipping.`);
    }
  }
}
