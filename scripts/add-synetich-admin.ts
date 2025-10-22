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
  role: { type: String, enum: ['business', 'admin', 'synetich_admin'], default: 'business' },
  company: { type: String }
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

async function addSynetichAdmin() {
  // Prendi i parametri da linea di comando
  const email = process.argv[2]
  const password = process.argv[3]
  const name = process.argv[4] || 'Synetich Admin'

  if (!email || !password) {
    console.error('❌ Usage: npm run add-synetich-admin <email> <password> [name]')
    console.error('Example: npm run add-synetich-admin chiara.alberti@synetich.com Password123 "Chiara Alberti"')
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
      console.log('Existing user details:')
      console.log('📧 Email:', existingUser.email)
      console.log('👤 Name:', existingUser.name)
      console.log('🔑 Role:', existingUser.role)
      console.log('🏢 Company:', existingUser.company || 'N/A')
      process.exit(1)
    }

    // Crea nuovo utente Synetich Admin
    const user = new User({
      email,
      password,
      name,
      role: 'synetich_admin',
      company: 'Synetich'
    })

    await user.save()

    console.log('✅ Synetich Admin created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:', user.email)
    console.log('👤 Name:', user.name)
    console.log('🔑 Role:', user.role)
    console.log('🏢 Company:', user.company)
    console.log('🆔 ID:', user._id)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('🎓 This user can now access the Synetich Course Management Dashboard')
    console.log('🔐 Login at: http://localhost:5173 (or your production URL)')
    console.log('')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating Synetich admin:', error)
    process.exit(1)
  }
}

addSynetichAdmin()
