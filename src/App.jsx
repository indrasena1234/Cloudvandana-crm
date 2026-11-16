import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [selectedObject, setSelectedObject] = useState('Account')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [industry, setIndustry] = useState('')

  const [stageName, setStageName] = useState('Prospecting')
  const [closeDate, setCloseDate] = useState('')
  const [amount, setAmount] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [leadStatus, setLeadStatus] = useState('Open - Not Contacted')

  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')

  const [subject, setSubject] = useState('')
  const [caseStatus, setCaseStatus] = useState('New')
  const [origin, setOrigin] = useState('Web')
  const [priority, setPriority] = useState('Medium')
  const [description, setDescription] = useState('')

  const isAccount = selectedObject === 'Account'
  const isOpportunity = selectedObject === 'Opportunity'
  const isLead = selectedObject === 'Lead'
  const isContact = selectedObject === 'Contact'
  const isCase = selectedObject === 'Case'

  const api = isOpportunity
    ? 'opportunities'
    : selectedObject.toLowerCase() + 's'

  function fetchRecords() {
    setLoading(true)
    setMessage('')

    fetch(`http://localhost:5000/api/${api}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setRecords(data.records)
          if (data.records.length === 0) {
            setMessage(`No ${selectedObject} records available.`)
          }
        } else {
          setRecords([])
          setMessage(data.message || 'Unable to fetch records.')
        }
      })
      .catch(() => setMessage('Backend connection failed.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setShowForm(false)
    setEditingId(null)
    fetchRecords()
  }, [selectedObject])

  function handleConnectSalesforce() {
    window.location.href = 'http://localhost:5000/auth/salesforce'
  }

  function resetForm() {
    setName('')
    setPhone('')
    setIndustry('')
    setStageName('Prospecting')
    setCloseDate('')
    setAmount('')
    setFirstName('')
    setLastName('')
    setCompany('')
    setEmail('')
    setLeadStatus('Open - Not Contacted')
    setTitle('')
    setDepartment('')
    setSubject('')
    setCaseStatus('New')
    setOrigin('Web')
    setPriority('Medium')
    setDescription('')
    setEditingId(null)
  }

  function openAddForm() {
    resetForm()
    setMessage('')
    setShowForm(true)
  }

  function openEditForm(record) {
    setEditingId(record.Id)
    setName(record.Name || '')
    setPhone(record.Phone || '')
    setIndustry(record.Industry || '')
    setStageName(record.StageName || 'Prospecting')
    setCloseDate(record.CloseDate || '')
    setAmount(record.Amount ?? '')
    setFirstName(record.FirstName || '')
    setLastName(record.LastName || '')
    setCompany(record.Company || '')
    setEmail(record.Email || '')
    setLeadStatus(record.Status || 'Open - Not Contacted')
    setTitle(record.Title || '')
    setDepartment(record.Department || '')
    setSubject(record.Subject || '')
    setCaseStatus(record.Status || 'New')
    setOrigin(record.Origin || 'Web')
    setPriority(record.Priority || 'Medium')
    setDescription(record.Description || '')
    setMessage('')
    setShowForm(true)
  }

  function handleSave(e) {
    e.preventDefault()

    let body

    if (isAccount) {
      body = {
        Name: name,
        Phone: phone,
        Industry: industry
      }
    } else if (isOpportunity) {
      body = {
        Name: name,
        StageName: stageName,
        CloseDate: closeDate,
        Amount: amount === '' ? null : Number(amount)
      }
    } else if (isLead) {
      body = {
        FirstName: firstName,
        LastName: lastName,
        Company: company,
        Email: email,
        Phone: phone,
        Status: leadStatus
      }
    } else if (isContact) {
      body = {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Phone: phone,
        Title: title,
        Department: department
      }
    } else if (isCase) {
      body = {
        Subject: subject,
        Status: caseStatus,
        Origin: origin,
        Priority: priority,
        Description: description
      }
    }

    const isEditing = editingId !== null

    fetch(
      isEditing
        ? `http://localhost:5000/api/${api}/${editingId}`
        : `http://localhost:5000/api/${api}`,
      {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    )
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setShowForm(false)
          resetForm()
          setMessage(
            `${selectedObject} ${isEditing ? 'updated' : 'created'} successfully!`
          )
          fetchRecords()
        } else {
          setMessage(data.message || 'Operation failed.')
        }
      })
      .catch(() => setMessage('Backend connection failed.'))
  }

  function handleDelete(id) {
    if (!window.confirm(`Are you sure you want to delete this ${selectedObject}?`)) {
      return
    }

    fetch(`http://localhost:5000/api/${api}/${id}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setMessage(`${selectedObject} deleted successfully!`)
          fetchRecords()
        } else {
          setMessage(data.message || 'Deletion failed.')
        }
      })
      .catch(() => setMessage('Backend connection failed.'))
  }

  return (
    <div className="app">
      <header className="header">
        <h2>CloudVandana CRM</h2>
        <button onClick={handleConnectSalesforce}>
          Connect Salesforce
        </button>
      </header>

      <main className="main">
        <h1>Salesforce Dashboard</h1>
        <p>Manage your Salesforce records</p>

        <div className="toolbar">
          <label>Select Object:</label>

          <select
            value={selectedObject}
            onChange={e => setSelectedObject(e.target.value)}
          >
            {['Account', 'Opportunity', 'Lead', 'Contact', 'Case'].map(object => (
              <option key={object} value={object}>{object}</option>
            ))}
          </select>

          <button onClick={fetchRecords}>Refresh Records</button>
          <button onClick={openAddForm}>Add {selectedObject}</button>
        </div>

        {showForm && (
          <form className="record-form" onSubmit={handleSave}>
            <h2>{editingId ? `Edit ${selectedObject}` : `Add New ${selectedObject}`}</h2>

            {isAccount && (
              <>
                <input placeholder="Account Name" value={name}
                  onChange={e => setName(e.target.value)} required />
                <input placeholder="Phone" value={phone}
                  onChange={e => setPhone(e.target.value)} />
                <input placeholder="Industry" value={industry}
                  onChange={e => setIndustry(e.target.value)} />
              </>
            )}

            {isOpportunity && (
              <>
                <input placeholder="Opportunity Name" value={name}
                  onChange={e => setName(e.target.value)} required />

                <select value={stageName}
                  onChange={e => setStageName(e.target.value)} required>
                  {[
                    'Prospecting', 'Qualification', 'Needs Analysis',
                    'Value Proposition', 'Id. Decision Makers',
                    'Perception Analysis', 'Proposal/Price Quote',
                    'Negotiation/Review', 'Closed Won', 'Closed Lost'
                  ].map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>

                <label>Close Date:</label>
                <input type="date" value={closeDate}
                  onChange={e => setCloseDate(e.target.value)} required />

                <input type="number" placeholder="Amount" value={amount}
                  onChange={e => setAmount(e.target.value)} />
              </>
            )}

            {isLead && (
              <>
                <input placeholder="First Name" value={firstName}
                  onChange={e => setFirstName(e.target.value)} />
                <input placeholder="Last Name" value={lastName}
                  onChange={e => setLastName(e.target.value)} required />
                <input placeholder="Company" value={company}
                  onChange={e => setCompany(e.target.value)} required />
                <input type="email" placeholder="Email" value={email}
                  onChange={e => setEmail(e.target.value)} />
                <input placeholder="Phone" value={phone}
                  onChange={e => setPhone(e.target.value)} />
                <input placeholder="Lead Status" value={leadStatus}
                  onChange={e => setLeadStatus(e.target.value)} required />
              </>
            )}

            {isContact && (
              <>
                <input placeholder="First Name" value={firstName}
                  onChange={e => setFirstName(e.target.value)} />
                <input placeholder="Last Name" value={lastName}
                  onChange={e => setLastName(e.target.value)} required />
                <input type="email" placeholder="Email" value={email}
                  onChange={e => setEmail(e.target.value)} />
                <input placeholder="Phone" value={phone}
                  onChange={e => setPhone(e.target.value)} />
                <input placeholder="Title" value={title}
                  onChange={e => setTitle(e.target.value)} />
                <input placeholder="Department" value={department}
                  onChange={e => setDepartment(e.target.value)} />
              </>
            )}

            {isCase && (
              <>
                <input placeholder="Case Subject" value={subject}
                  onChange={e => setSubject(e.target.value)} required />
                <input placeholder="Status (e.g. New)" value={caseStatus}
                  onChange={e => setCaseStatus(e.target.value)} required />
                <input placeholder="Origin (e.g. Web)" value={origin}
                  onChange={e => setOrigin(e.target.value)} required />
                <input placeholder="Priority (e.g. Medium)" value={priority}
                  onChange={e => setPriority(e.target.value)} />
                <textarea placeholder="Description" value={description}
                  onChange={e => setDescription(e.target.value)} />
              </>
            )}

            <button type="submit">
              {editingId ? 'Update' : 'Save'} {selectedObject}
            </button>

            <button type="button" onClick={() => {
              setShowForm(false)
              resetForm()
            }}>
              Cancel
            </button>
          </form>
        )}

        <div className="table-box">
          <h2>{selectedObject} Records</h2>

          {loading && <p>Loading records...</p>}
          {message && <p>{message}</p>}

          <table>
            <thead>
              {isAccount && (
                <tr>
                  <th>Name</th><th>Industry</th><th>Phone</th><th>Actions</th>
                </tr>
              )}

              {isOpportunity && (
                <tr>
                  <th>Name</th><th>Stage</th><th>Close Date</th>
                  <th>Amount</th><th>Actions</th>
                </tr>
              )}

              {isLead && (
                <tr>
                  <th>First Name</th><th>Last Name</th><th>Company</th>
                  <th>Email</th><th>Phone</th><th>Status</th><th>Actions</th>
                </tr>
              )}

              {isContact && (
                <tr>
                  <th>First Name</th><th>Last Name</th><th>Email</th>
                  <th>Phone</th><th>Title</th><th>Department</th><th>Actions</th>
                </tr>
              )}

              {isCase && (
                <tr>
                  <th>Subject</th><th>Status</th><th>Origin</th>
                  <th>Priority</th><th>Description</th><th>Actions</th>
                </tr>
              )}
            </thead>

            <tbody>
              {records.map(record => (
                <tr key={record.Id}>
                  {isAccount && (
                    <>
                      <td>{record.Name}</td>
                      <td>{record.Industry || '-'}</td>
                      <td>{record.Phone || '-'}</td>
                    </>
                  )}

                  {isOpportunity && (
                    <>
                      <td>{record.Name}</td>
                      <td>{record.StageName || '-'}</td>
                      <td>{record.CloseDate || '-'}</td>
                      <td>{record.Amount ?? '-'}</td>
                    </>
                  )}

                  {isLead && (
                    <>
                      <td>{record.FirstName || '-'}</td>
                      <td>{record.LastName}</td>
                      <td>{record.Company}</td>
                      <td>{record.Email || '-'}</td>
                      <td>{record.Phone || '-'}</td>
                      <td>{record.Status || '-'}</td>
                    </>
                  )}

                  {isContact && (
                    <>
                      <td>{record.FirstName || '-'}</td>
                      <td>{record.LastName}</td>
                      <td>{record.Email || '-'}</td>
                      <td>{record.Phone || '-'}</td>
                      <td>{record.Title || '-'}</td>
                      <td>{record.Department || '-'}</td>
                    </>
                  )}

                  {isCase && (
                    <>
                      <td>{record.Subject}</td>
                      <td>{record.Status || '-'}</td>
                      <td>{record.Origin || '-'}</td>
                      <td>{record.Priority || '-'}</td>
                      <td>{record.Description || '-'}</td>
                    </>
                  )}

                  <td>
                    <button onClick={() => openEditForm(record)}>Edit</button>
                    <button onClick={() => handleDelete(record.Id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

export default App