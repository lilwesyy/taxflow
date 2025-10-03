import mongoose from 'mongoose'
import User from '../src/models/User'
import * as dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mircocapobianco01:DmLXbCXfQ0QTCtCr@cluster0.rm6eo.mongodb.net/taxflow?retryWrites=true&w=majority&appName=Cluster0'

async function rejectPivaRequest(email: string) {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      console.log(`❌ User not found: ${email}`)
      process.exit(1)
    }

    console.log(`\n📋 Current user status:`)
    console.log('Name:', user.name)
    console.log('Email:', user.email)
    console.log('P.IVA Approval Status:', user.pivaApprovalStatus || 'N/A')
    console.log('Status:', user.status || 'N/A')

    // Reset P.IVA approval to pending
    user.pivaApprovalStatus = 'pending'
    user.status = 'new'

    // Clear any copied data
    user.fiscalCode = undefined
    user.address = undefined
    user.codiceAteco = undefined
    user.company = undefined
    user.piva = undefined

    await user.save()

    console.log(`\n✅ User P.IVA request reset to pending!`)
    console.log('New P.IVA Approval Status:', user.pivaApprovalStatus)
    console.log('New Status:', user.status)
    console.log('\nL\'utente è ora visibile di nuovo in "Richieste P.IVA" e può essere riapprovato.')

    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
    process.exit(0)

  } catch (error) {
    console.error('❌ Error:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.log('❌ Please provide an email address')
  console.log('Usage: npm run reject-piva <email>')
  process.exit(1)
}

rejectPivaRequest(email)
