/**
 * Test script per verificare l'autenticazione con Fattura Elettronica API
 *
 * Uso:
 * 1. Inserisci username e password nelle variabili USERNAME e PASSWORD
 *    (credenziali che ricevi dopo la registrazione su fattura-elettronica-api.it)
 * 2. Esegui: node test-fattura-api.js
 */

const axios = require('axios')

// ⚠️ INSERISCI LE TUE CREDENZIALI QUI
const USERNAME = 'your_username_here'
const PASSWORD = 'your_password_here'
const API_MODE = 'test' // o 'prod'
const API_URL = API_MODE === 'prod'
  ? 'https://fattura-elettronica-api.it/ws2.0/prod'
  : 'https://fattura-elettronica-api.it/ws2.0/test'

async function testAuthentication() {
  try {
    console.log('🔐 Testing Fattura Elettronica API authentication...')
    console.log(`📍 Endpoint: ${API_URL}`)
    console.log(`👤 Username: ${USERNAME}`)
    console.log(`🔑 Password: ${'*'.repeat(PASSWORD.length)}`)
    console.log('')

    // 1. Test con Basic Auth
    console.log('1️⃣ Test Basic Authentication...')
    const auth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }

    const response = await axios.get(`${API_URL}/aziende`, {
      params: { per_page: 1 },
      headers
    })

    console.log('✅ Basic Auth successful!')
    console.log('📊 Response status:', response.status)
    console.log('')

    // 2. Controlla Bearer Token nei headers
    console.log('2️⃣ Checking Bearer Token in response headers...')
    const bearerToken = response.headers['x-auth-token']
    const tokenExpires = response.headers['x-auth-expires']

    if (bearerToken && tokenExpires) {
      console.log('✅ Bearer Token received!')
      console.log('🔑 Token:', bearerToken.substring(0, 20) + '...')
      console.log('⏰ Expires:', tokenExpires)
      console.log('')

      // 3. Test con Bearer Token
      console.log('3️⃣ Test Bearer Token authentication...')
      const bearerHeaders = {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }

      const response2 = await axios.get(`${API_URL}/aziende`, {
        params: { per_page: 1 },
        headers: bearerHeaders
      })

      console.log('✅ Bearer Token Auth successful!')
      console.log('📊 Response status:', response2.status)
      console.log('')

      // 4. Mostra aziende (se presenti)
      if (response.data && response.data.length > 0) {
        console.log('🏢 Companies found:')
        response.data.forEach((company, index) => {
          console.log(`   ${index + 1}. ${company.ragione_sociale} (P.IVA: ${company.piva})`)
        })
      } else {
        console.log('ℹ️  No companies found (you need to create one first)')
      }
    } else {
      console.log('⚠️  Bearer Token not found in response headers')
    }

    console.log('')
    console.log('✅ All tests passed! API authentication is working correctly.')

  } catch (error) {
    console.error('')
    console.error('❌ Error testing API:')
    if (error.response) {
      console.error('   Status:', error.response.status)
      console.error('   Message:', error.response.data)
    } else {
      console.error('   ', error.message)
    }
    console.error('')
    console.error('💡 Troubleshooting:')
    console.error('   1. Check your username and password are correct')
    console.error('   2. Verify you have an active subscription at https://www.fattura-elettronica-api.it')
    console.error('   3. Make sure API_MODE is set correctly (test/prod)')
    console.error('   4. Credentials format: username (email or ID), password (from registration)')
  }
}

testAuthentication()
