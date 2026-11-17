const express = require('express')
const cors = require('cors')
const jsforce = require('jsforce')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

// Salesforce OAuth Configuration
const oauth2 = new jsforce.OAuth2({
  loginUrl: process.env.SF_LOGIN_URL,
  clientId: process.env.SF_CLIENT_ID,
  clientSecret: process.env.SF_CLIENT_SECRET,
  redirectUri: process.env.SF_REDIRECT_URI,
  useVerifier: true
})

let salesforceConnection = null

// Pagination helper: 20 records per page
function getPagination(req, res) {
  const requestedPage = parseInt(req.query.page, 10)
  const page = Number.isInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1

  if (page > 100) {
    res.status(400).json({
      success: false,
      message: 'Maximum page limit reached'
    })
    return null
  }

  return {
    page,
    offset: (page - 1) * 20
  }
}

// Read records with pagination
async function readRecords(req, res, objectName, fields) {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const pagination = getPagination(req, res)
    if (!pagination) return

    const { page, offset } = pagination

    const query = `SELECT ${fields} FROM ${objectName} ORDER BY CreatedDate DESC LIMIT 21 OFFSET ${offset}`

    const result = await salesforceConnection.query(query)

    const hasMore = result.records.length > 20
    const records = result.records.slice(0, 20)

    res.json({
      success: true,
      records,
      page,
      hasMore
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Home
app.get('/', (req, res) => {
  res.send('CloudVandana Backend is Running!')
})

// Backend Status
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'Backend API connected successfully!'
  })
})

// Salesforce Login
app.get('/auth/salesforce', (req, res) => {
  const url = oauth2.getAuthorizationUrl({
    scope: 'api refresh_token'
  })
  res.redirect(url)
})

// Salesforce Callback
app.get('/oauth/callback', async (req, res) => {
  const code = req.query.code

  if (!code) {
    return res.status(400).send('Authorization code missing')
  }

  try {
    const conn = new jsforce.Connection({ oauth2 })
    const userInfo = await conn.authorize(code)

    salesforceConnection = conn

    console.log('Salesforce User:', userInfo.id)
    res.send('Salesforce Connected Successfully!')
  } catch (error) {
    console.error('Salesforce Login Error:', error.message)
    res.status(500).send('Salesforce login failed: ' + error.message)
  }
})

// ==============================
// ACCOUNT CRUD
// ==============================

// GET Accounts
app.get('/api/accounts', (req, res) => {
  return readRecords(
    req,
    res,
    'Account',
    'Id, Name, Type, Industry, Phone'
  )
})

// CREATE Account
app.post('/api/accounts', async (req, res) => {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const result = await salesforceConnection.sobject('Account').create({
      Name: req.body.Name,
      Phone: req.body.Phone,
      Industry: req.body.Industry
    })

    res.json({ success: result.success, result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// UPDATE Account
app.put('/api/accounts/:id', async (req, res) => {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const result = await salesforceConnection.sobject('Account').update({
      Id: req.params.id,
      Name: req.body.Name,
      Phone: req.body.Phone,
      Industry: req.body.Industry
    })

    res.json({ success: result.success, result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// DELETE Account
app.delete('/api/accounts/:id', async (req, res) => {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const result = await salesforceConnection
      .sobject('Account')
      .destroy(req.params.id)

    res.json({ success: result.success, result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ==============================
// OPPORTUNITY CRUD
// ==============================

// GET Opportunities
app.get('/api/opportunities', (req, res) => {
  return readRecords(
    req,
    res,
    'Opportunity',
    'Id, Name, StageName, CloseDate, Amount'
  )
})

// CREATE Opportunity
app.post('/api/opportunities', async (req, res) => {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const result = await salesforceConnection.sobject('Opportunity').create({
      Name: req.body.Name,
      StageName: req.body.StageName,
      CloseDate: req.body.CloseDate,
      Amount: req.body.Amount
    })

    res.json({ success: result.success, result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// UPDATE Opportunity
app.put('/api/opportunities/:id', async (req, res) => {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const result = await salesforceConnection.sobject('Opportunity').update({
      Id: req.params.id,
      Name: req.body.Name,
      StageName: req.body.StageName,
      CloseDate: req.body.CloseDate,
      Amount: req.body.Amount
    })

    res.json({ success: result.success, result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// DELETE Opportunity
app.delete('/api/opportunities/:id', async (req, res) => {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const result = await salesforceConnection
      .sobject('Opportunity')
      .destroy(req.params.id)

    res.json({ success: result.success, result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ==============================
// LEAD CRUD
// ==============================

// GET Leads
app.get('/api/leads', (req, res) => {
  return readRecords(
    req,
    res,
    'Lead',
    'Id, FirstName, LastName, Company, Email, Phone, Status'
  )
})

// CREATE Lead
app.post('/api/leads', async (req, res) => {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const result = await salesforceConnection.sobject('Lead').create({
      FirstName: req.body.FirstName,
      LastName: req.body.LastName,
      Company: req.body.Company,
      Email: req.body.Email,
      Phone: req.body.Phone,
      Status: req.body.Status
    })

    res.json({ success: result.success, result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// UPDATE Lead
app.put('/api/leads/:id', async (req, res) => {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const result = await salesforceConnection.sobject('Lead').update({
      Id: req.params.id,
      FirstName: req.body.FirstName,
      LastName: req.body.LastName,
      Company: req.body.Company,
      Email: req.body.Email,
      Phone: req.body.Phone,
      Status: req.body.Status
    })

    res.json({ success: result.success, result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// DELETE Lead
app.delete('/api/leads/:id', async (req, res) => {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const result = await salesforceConnection
      .sobject('Lead')
      .destroy(req.params.id)

    res.json({ success: result.success, result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ==============================
// CONTACT CRUD
// ==============================

// GET Contacts
app.get('/api/contacts', (req, res) => {
  return readRecords(
    req,
    res,
    'Contact',
    'Id, FirstName, LastName, Email, Phone, Title, Department'
  )
})

// CREATE Contact
app.post('/api/contacts', async (req, res) => {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const result = await salesforceConnection
      .sobject('Contact')
      .create(req.body)

    res.json({ success: result.success, result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// UPDATE Contact
app.put('/api/contacts/:id', async (req, res) => {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const result = await salesforceConnection.sobject('Contact').update({
      Id: req.params.id,
      ...req.body
    })

    res.json({ success: result.success, result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// DELETE Contact
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const result = await salesforceConnection
      .sobject('Contact')
      .destroy(req.params.id)

    res.json({ success: result.success, result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ==============================
// CASE CRUD
// ==============================

// GET Cases
app.get('/api/cases', (req, res) => {
  return readRecords(
    req,
    res,
    'Case',
    'Id, Subject, Status, Origin, Priority, Description'
  )
})

// CREATE Case
app.post('/api/cases', async (req, res) => {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const result = await salesforceConnection
      .sobject('Case')
      .create(req.body)

    res.json({ success: result.success, result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// UPDATE Case
app.put('/api/cases/:id', async (req, res) => {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const result = await salesforceConnection.sobject('Case').update({
      Id: req.params.id,
      ...req.body
    })

    res.json({ success: result.success, result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// DELETE Case
app.delete('/api/cases/:id', async (req, res) => {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const result = await salesforceConnection
      .sobject('Case')
      .destroy(req.params.id)

    res.json({ success: result.success, result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Start Server
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})