const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  password: { type: String, required: true },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('TestUser', userSchema);

mongoose.connect('mongodb://localhost:27017/real-estate-platform').then(async () => {
  try {
    const u = await User.create({ password: 'testpassword' });
    console.log("Created successfully:", u.password);
    await User.deleteOne({ _id: u._id });
  } catch(e) {
    console.error("Error creating:", e);
  }
  process.exit(0);
});
