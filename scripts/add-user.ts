import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// MongoDB User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['business', 'admin'], default: 'business' }
}, { timestamps: true })

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function addUser() {
  // Prendi i parametri da linea di comando
  const email = process.argv[2]
  const password = process.argv[3]
  const name = process.argv[4] || 'Admin User'
  const role = (process.argv[5] as 'admin' | 'business') || 'admin'

  if (!email || !password) {
    console.error('❌ Usage: npm run add-user <email> <password> [name] [role]')
    console.error('Example: npm run add-user admin@taxflow.com Password123 "Admin User" admin')
    console.error('Example: npm run add-user cliente@test.com Password123 "Cliente Test" business')
    process.exit(1)
  }

  if (role !== 'admin' && role !== 'business') {
    console.error('❌ Role must be either "admin" or "business"')
    process.exit(1)
  }

  const MONGODB_URI = process.env.MONGODB_URI

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not defined')
    console.error('Please set MONGODB_URI in your .env file')
    process.exit(1)
  }

  try {
    // Connessione a MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Verifica se l'utente esiste già
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.error(`❌ User with email ${email} already exists`)
      process.exit(1)
    }

    // Crea nuovo utente
    const user = new User({
      email,
      password,
      name,
      role
    })

    await user.save()

    console.log(`✅ ${role.charAt(0).toUpperCase() + role.slice(1)} user created successfully!`)
    console.log('📧 Email:', user.email)
    console.log('👤 Name:', user.name)
    console.log('🔑 Role:', user.role)
    console.log('🆔 ID:', user._id)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating user:', error)
    process.exit(1)
  }
}

addUser()