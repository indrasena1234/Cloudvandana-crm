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

// GET - Read Accounts
app.get('/api/accounts', async (req, res) => {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const result = await salesforceConnection.query(
      'SELECT Id, Name, Type, Industry, Phone FROM Account ORDER BY CreatedDate DESC LIMIT 20'
    )

    res.json({
      success: true,
      records: result.records
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

// POST - Create Account
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

    res.json({
      success: true,
      result: result
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

// PUT - Update Account
app.put('/api/accounts/:id', async (req, res) => {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const result = await salesforceConnection
      .sobject('Account')
      .update({
        Id: req.params.id,
        Name: req.body.Name,
        Phone: req.body.Phone,
        Industry: req.body.Industry
      })

    res.json({
      success: result.success,
      result: result
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

// DELETE - Delete Account
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

    res.json({
      success: result.success,
      result: result
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

// Start Server
const PORT = 5000
// GET - Read Opportunities
app.get('/api/opportunities', async (req, res) => {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const result = await salesforceConnection.query(
      'SELECT Id, Name, StageName, CloseDate, Amount FROM Opportunity ORDER BY CreatedDate DESC LIMIT 20'
    )

    res.json({
      success: true,
      records: result.records
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

// POST - Create Opportunity
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
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

// PUT - Update Opportunity
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
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

// DELETE - Delete Opportunity
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
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}) 
// GET - Read Leads
app.get('/api/leads', async (req, res) => {
  try {
    if (!salesforceConnection) {
      return res.status(401).json({
        success: false,
        message: 'Please connect Salesforce first'
      })
    }

    const result = await salesforceConnection.query(
      'SELECT Id, FirstName, LastName, Company, Email, Phone, Status FROM Lead ORDER BY CreatedDate DESC LIMIT 20'
    )

    res.json({ success: true, records: result.records })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST - Create Lead
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

// PUT - Update Lead
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

// DELETE - Delete Lead
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
// CONTACT CRUD

// Get Contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const result = await salesforceConnection.query(
      'SELECT Id, FirstName, LastName, Email, Phone, Title, Department FROM Contact ORDER BY CreatedDate DESC LIMIT 20'
    );
    res.json({ success: true, records: result.records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create Contact
app.post('/api/contacts', async (req, res) => {
  try {
    const result = await salesforceConnection.sobject('Contact').create(req.body);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Contact
app.put('/api/contacts/:id', async (req, res) => {
  try {
    const result = await salesforceConnection.sobject('Contact').update({
      Id: req.params.id,
      ...req.body
    });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete Contact
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const result = await salesforceConnection.sobject('Contact').destroy(req.params.id);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// CASE CRUD

// Get Cases
app.get('/api/cases', async (req, res) => {
  try {
    const result = await salesforceConnection.query(
      'SELECT Id, Subject, Status, Origin, Priority, Description FROM Case ORDER BY CreatedDate DESC LIMIT 20'
    );
    res.json({ success: true, records: result.records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create Case
app.post('/api/cases', async (req, res) => {
  try {
    const result = await salesforceConnection.sobject('Case').create(req.body);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Case
app.put('/api/cases/:id', async (req, res) => {
  try {
    const result = await salesforceConnection.sobject('Case').update({
      Id: req.params.id,
      ...req.body
    });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete Case
app.delete('/api/cases/:id', async (req, res) => {
  try {
    const result = await salesforceConnection.sobject('Case').destroy(req.params.id);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})