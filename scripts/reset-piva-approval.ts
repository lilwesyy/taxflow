import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mircoraffaele1:RzpajVO0YHTG2p7S@cluster0.jgzik.mongodb.net/taxflow?retryWrites=true&w=majority&appName=Cluster0'

// User Schema
const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  pivaApprovalStatus: String,
  pivaFormSubmitted: Boolean,
  selectedPlan: mongoose.Schema.Types.Mixed,
  subscriptionStatus: String,
  stripeCustomerId: String,
  stripeSubscriptionId: String
}, { strict: false })

const User = mongoose.model('User', UserSchema)

async function resetPivaApproval(email: string) {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      console.error(`❌ User not found: ${email}`)
      process.exit(1)
    }

    console.log(`\n📋 Current user status:`)
    console.log(`   - Name: ${user.name}`)
    console.log(`   - Email: ${user.email}`)
    console.log(`   - pivaApprovalStatus: ${user.pivaApprovalStatus}`)
    console.log(`   - selectedPlan: ${JSON.stringify(user.selectedPlan)}`)
    console.log(`   - subscriptionStatus: ${user.subscriptionStatus}`)

    // Reset to pending
    user.pivaApprovalStatus = 'pending'
    user.selectedPlan = undefined
    user.subscriptionStatus = undefined
    user.status = 'pending'
    user.stripeCustomerId = undefined
    user.stripeSubscriptionId = undefined

    await user.save()

    console.log(`\n✅ User reset successfully!`)
    console.log(`   - pivaApprovalStatus: pending`)
    console.log(`   - status: pending`)
    console.log(`   - selectedPlan: removed`)
    console.log(`   - subscriptionStatus: removed`)
    console.log(`   - stripe IDs: removed`)
    console.log(`\n👉 User will now appear in "Richieste P.IVA" list`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Get email from command line
const email = process.argv[2]

if (!email) {
  console.error('❌ Usage: npm run reset-piva-approval <email>')
  process.exit(1)
}

resetPivaApproval(email)
