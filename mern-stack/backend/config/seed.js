import User from "./user.js";
console.log('Seed.js loaded');
const users = {
  "king.glory11@gmail.com": { password: "A123", role: "employee" },
  "tobinmgraham@csus.edu": { password: "A123", role: "employee" },
  "alyssamjimenez@csus.edu": { password: "A123", role: "employee" },
  "imranahmad@csus.edu": { password: "A123", role: "employee" },
  "rylandporter@csus.edu": { password: "A123", role: "employee" },
  "lol@csus.edu": { password: "A123", role: "user" },
  "hsuppal@csus.edu": { password: "A123", role: "admin" },
};

export async function seedUsers() {
  for (const email in users) {
    const user = users[email];
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      console.log(`Creating user: ${email}`);

      const newUser = new User({
        email,
        password: user.password, 
        role: user.role,
      });

      try {
        await newUser.save();
        console.log(`User ${email} saved to the database`);
      } catch (err) {
        console.log(`Error saving user ${email}: ${err}`);
      }
    } else {
      console.log(`User ${email} already exists, skipping.`);
    }
  }
}
