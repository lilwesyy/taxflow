import mongoose from 'mongoose'
import User from '../src/models/User'
import * as dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mircocapobianco01:DmLXbCXfQ0QTCtCr@cluster0.rm6eo.mongodb.net/taxflow?retryWrites=true&w=majority&appName=Cluster0'

async function getUserData(email: string) {
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

    console.log('\n📋 User Data:\n')
    console.log('='.repeat(80))
    console.log('ID:', user._id)
    console.log('Email:', user.email)
    console.log('Name:', user.name)
    console.log('Role:', user.role)
    console.log('Phone:', user.phone || 'N/A')
    console.log('Company:', user.company || 'N/A')
    console.log('Status:', user.status || 'N/A')
    console.log('='.repeat(80))

    console.log('\n📊 Approval Status:')
    console.log('Registration Approval:', user.registrationApprovalStatus || 'N/A')
    console.log('P.IVA Form Submitted:', user.pivaFormSubmitted || false)
    console.log('P.IVA Approval:', user.pivaApprovalStatus || 'N/A')
    console.log('='.repeat(80))

    console.log('\n🏢 Business Data:')
    console.log('P.IVA:', user.piva || 'N/A')
    console.log('Fiscal Code:', user.fiscalCode || 'N/A')
    console.log('Address:', user.address || 'N/A')
    console.log('Codice ATECO:', user.codiceAteco || 'N/A')
    console.log('Regime Contabile:', user.regimeContabile || 'N/A')
    console.log('Aliquota IVA:', user.aliquotaIva || 'N/A')
    console.log('Fatturato:', user.fatturato || 0)
    console.log('='.repeat(80))

    if (user.pivaRequestData) {
      console.log('\n📝 P.IVA Request Data:')
      const pivaData = user.pivaRequestData as any
      console.log('Has Existing P.IVA:', pivaData.hasExistingPiva || false)
      console.log('Existing P.IVA Number:', pivaData.existingPivaNumber || 'N/A')
      console.log('First Name:', pivaData.firstName || 'N/A')
      console.log('Last Name:', pivaData.lastName || 'N/A')
      console.log('Date of Birth:', pivaData.dateOfBirth || 'N/A')
      console.log('Place of Birth:', pivaData.placeOfBirth || 'N/A')
      console.log('Fiscal Code:', pivaData.fiscalCode || 'N/A')
      console.log('Residence Address:', pivaData.residenceAddress || 'N/A')
      console.log('Residence City:', pivaData.residenceCity || 'N/A')
      console.log('Residence CAP:', pivaData.residenceCAP || 'N/A')
      console.log('Residence Province:', pivaData.residenceProvince || 'N/A')
      console.log('Business Activity:', pivaData.businessActivity || 'N/A')
      console.log('Codice ATECO:', pivaData.codiceAteco || 'N/A')
      console.log('Business Name:', pivaData.businessName || 'N/A')
      console.log('Expected Revenue:', pivaData.expectedRevenue || 'N/A')
      console.log('Has Other Income:', pivaData.hasOtherIncome || false)
      console.log('Other Income Details:', pivaData.otherIncomeDetails || 'N/A')
      console.log('Submitted At:', pivaData.submittedAt || 'N/A')
      console.log('='.repeat(80))
    }

    console.log('\n📅 Timestamps:')
    console.log('Created At:', user.createdAt)
    console.log('Updated At:', user.updatedAt)
    console.log('='.repeat(80))

    console.log('\n📝 Notes:')
    console.log(user.note || 'No notes')
    console.log('='.repeat(80))

    console.log('\n✅ Full JSON Data:\n')
    console.log(JSON.stringify(user.toObject(), null, 2))

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
  console.log('Usage: npm run get-user-data <email>')
  process.exit(1)
}

getUserData(email)
