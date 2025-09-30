import mongoose from 'mongoose'

// MongoDB User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['business', 'admin'], default: 'business' }
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function checkUser() {
  const email = process.argv[2]

  if (!email) {
    console.error('❌ Usage: npm run check-user <email>')
    process.exit(1)
  }

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Vercel-Admin-taxflow-db:6aWf0UVqFNzkVVEQ@taxflow-db.vvbfmn6.mongodb.net/?retryWrites=true&w=majority'

  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const user = await User.findOne({ email })
    if (!user) {
      console.error(`❌ User with email ${email} not found`)
      process.exit(1)
    }

    console.log('📧 Email:', user.email)
    console.log('👤 Name:', user.name)
    console.log('🔑 Role:', user.role)
    console.log('🆔 ID:', user._id)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkUser()