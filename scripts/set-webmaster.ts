import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// MongoDB User Schema (simplified for this script)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['business', 'admin'], default: 'business' },
  webmaster: { type: Boolean, default: false }
}, { timestamps: true, strict: false })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function setWebmaster() {
  // Prendi i parametri da linea di comando
  const email = process.argv[2]
  const webmasterValue = process.argv[3]

  if (!email || !webmasterValue) {
    console.error('❌ Usage: npm run set-webmaster <email> <true|false>')
    console.error('Example: npm run set-webmaster admin@taxflow.com true')
    console.error('Example: npm run set-webmaster admin@taxflow.com false')
    process.exit(1)
  }

  if (webmasterValue !== 'true' && webmasterValue !== 'false') {
    console.error('❌ Webmaster value must be either "true" or "false"')
    process.exit(1)
  }

  const webmaster = webmasterValue === 'true'

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

    // Trova l'utente
    const user = await User.findOne({ email })
    if (!user) {
      console.error(`❌ User with email ${email} not found`)
      process.exit(1)
    }

    // Aggiorna il campo webmaster
    user.webmaster = webmaster
    await user.save()

    console.log(`✅ User webmaster permission updated successfully!`)
    console.log('📧 Email:', user.email)
    console.log('👤 Name:', user.name)
    console.log('🔑 Role:', user.role)
    console.log('🔧 Webmaster:', user.webmaster ? '✅ YES' : '❌ NO')
    console.log('🆔 ID:', user._id)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error updating user:', error)
    process.exit(1)
  }
}

setWebmaster()
