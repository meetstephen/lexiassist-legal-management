import React, { useState, useEffect } from 'react';
import { Scale, FileText, Search, BookOpen, MessageSquare, AlertCircle, Loader2, ChevronRight, Download, Database, FolderOpen, Calendar, Plus, Trash2, Eye, Filter, Clock, Users, DollarSign, Copy, X, Bell } from 'lucide-react';

// ========================================
// IMPORTANT: ADD YOUR GEMINI API KEY HERE
// Get your free API key at: https://makersuite.google.com/app/apikey
// ========================================
const GEMINI_API_KEY = 'AIzaSyCPBgsGKTXWFfNnwyrF9BEY1E7k7ydUteo';
// ========================================

const LexiAssist = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('assistant');
  const [taskType, setTaskType] = useState('');
  const [userInput, setUserInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [researchQuery, setResearchQuery] = useState('');
  const [researchResults, setResearchResults] = useState([]);
  const [researchLoading, setResearchLoading] = useState(false);
  
  const [cases, setCases] = useState([]);
  const [showAddCase, setShowAddCase] = useState(false);
  const [newCase, setNewCase] = useState({
    title: '',
    suitNo: '',
    court: '',
    nextHearing: '',
    status: 'active',
    notes: '',
    clientId: ''
  });
  const [filterStatus, setFilterStatus] = useState('all');

  const [upcomingHearings, setUpcomingHearings] = useState([]);

  const [templates, setTemplates] = useState([
    { id: '1', name: 'Employment Contract', category: 'Corporate', content: 'EMPLOYMENT CONTRACT\n\nThis Employment Contract is made on [DATE] between:\n\n1. [EMPLOYER NAME] (hereinafter called "the Employer")\n2. [EMPLOYEE NAME] (hereinafter called "the Employee")\n\nTERMS:\n1. Position: [JOB TITLE]\n2. Commencement Date: [START DATE]\n3. Probation Period: [PERIOD]\n4. Salary: [AMOUNT] per [PERIOD]\n5. Working Hours: [HOURS]\n6. Leave Entitlement: [DAYS]\n7. Termination Notice: [PERIOD]\n\n[Additional clauses as applicable under Nigerian Labour Law]' },
    { id: '2', name: 'Tenancy Agreement', category: 'Property', content: 'TENANCY AGREEMENT\n\nThis Agreement is made on [DATE] between:\n\nLANDLORD: [NAME]\nAddress: [ADDRESS]\n\nTENANT: [NAME]\nAddress: [ADDRESS]\n\nPREMISES: [FULL ADDRESS]\nRENT: ₦[AMOUNT] per [PERIOD]\nTERM: [DURATION]\nSECURITY DEPOSIT: ₦[AMOUNT]\n\n[Clauses in accordance with Lagos State Tenancy Law]' },
    { id: '3', name: 'Power of Attorney', category: 'Litigation', content: 'POWER OF ATTORNEY\n\nI, [GRANTOR NAME], of [ADDRESS], hereby appoint [ATTORNEY NAME] of [ADDRESS] as my lawful attorney to act on my behalf in the following matters:\n\n1. [SPECIFIC POWERS]\n2. [ADDITIONAL POWERS]\n\nThis Power of Attorney shall remain in force for [DURATION] from the date hereof.\n\nDated this [DAY] day of [MONTH], [YEAR]\n\n_____________________\nGRANTOR\'S SIGNATURE' },
    { id: '4', name: 'Written Address', category: 'Litigation', content: 'IN THE [COURT NAME]\nIN THE [JUDICIAL DIVISION]\nHOLDEN AT [LOCATION]\n\nSUIT NO: [NUMBER]\n\nBETWEEN:\n\n[PLAINTIFF NAME] ........................ PLAINTIFF\n\nAND\n\n[DEFENDANT NAME] ........................ DEFENDANT\n\nWRITTEN ADDRESS ON BEHALF OF THE [PLAINTIFF/DEFENDANT]\n\n[Counsel Name]\n[Date]\n\n1.0 INTRODUCTION\n2.0 FACTS OF THE CASE\n3.0 ISSUES FOR DETERMINATION\n4.0 ARGUMENTS\n5.0 CONCLUSION AND PRAYERS' },
    { id: '5', name: 'Affidavit', category: 'Litigation', content: 'AFFIDAVIT\n\nI, [FULL NAME], of [ADDRESS], [OCCUPATION], do hereby make oath and state as follows:\n\n1. I am [RELATIONSHIP TO CASE] and I am competent to depose to this affidavit.\n\n2. [First paragraph of facts]\n\n3. [Second paragraph of facts]\n\n4. [Continue with numbered paragraphs]\n\n________________________\nDEPONENT\n\nSworn to at [LOCATION]\nThis [DAY] day of [MONTH], [YEAR]\n\nBefore me,\n\n________________________\nCOMMISSIONER FOR OATHS' },
    { id: '6', name: 'Sale of Land Agreement', category: 'Property', content: 'AGREEMENT FOR SALE OF LAND\n\nThis Agreement is made this [DATE] between:\n\nVENDOR: [NAME]\nAddress: [ADDRESS]\n\nPURCHASER: [NAME]\nAddress: [ADDRESS]\n\nPROPERTY DESCRIPTION: [FULL DESCRIPTION]\nLOCATION: [AREA]\nSIZE: [DIMENSIONS]\n\nPURCHASE PRICE: ₦[AMOUNT]\n\nTERMS OF PAYMENT:\n1. Initial Deposit: ₦[AMOUNT]\n2. Balance: ₦[AMOUNT]\n\n[Additional terms in accordance with Land Use Act]' }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [clients, setClients] = useState([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'individual',
    notes: ''
  });

  const [timeEntries, setTimeEntries] = useState([]);
  const [showAddTime, setShowAddTime] = useState(false);
  const [newTimeEntry, setNewTimeEntry] = useState({
    caseId: '',
    clientId: '',
    description: '',
    hours: '',
    rate: '50000',
    date: new Date().toISOString().split('T')[0]
  });
  const [invoices, setInvoices] = useState([]);

  // Load data from storage on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [casesData, clientsData, timeData, invoiceData] = await Promise.all([
        window.storage.get('lexi-cases').catch(() => null),
        window.storage.get('lexi-clients').catch(() => null),
        window.storage.get('lexi-time-entries').catch(() => null),
        window.storage.get('lexi-invoices').catch(() => null)
      ]);

      if (casesData?.value) setCases(JSON.parse(casesData.value));
      if (clientsData?.value) setClients(JSON.parse(clientsData.value));
      if (timeData?.value) setTimeEntries(JSON.parse(timeData.value));
      if (invoiceData?.value) setInvoices(JSON.parse(invoiceData.value));
    } catch (err) {
      console.log('Error loading data:', err);
    }
  };

  // Save functions
  const saveCases = async (updatedCases) => {
    try {
      await window.storage.set('lexi-cases', JSON.stringify(updatedCases));
      setCases(updatedCases);
      updateUpcomingHearings(updatedCases);
    } catch (err) {
      console.error('Error saving cases:', err);
    }
  };

  const saveClients = async (updatedClients) => {
    try {
      await window.storage.set('lexi-clients', JSON.stringify(updatedClients));
      setClients(updatedClients);
    } catch (err) {
      console.error('Error saving clients:', err);
    }
  };

  const saveTimeEntries = async (updatedEntries) => {
    try {
      await window.storage.set('lexi-time-entries', JSON.stringify(updatedEntries));
      setTimeEntries(updatedEntries);
    } catch (err) {
      console.error('Error saving time entries:', err);
    }
  };

  const saveInvoices = async (updatedInvoices) => {
    try {
      await window.storage.set('lexi-invoices', JSON.stringify(updatedInvoices));
      setInvoices(updatedInvoices);
    } catch (err) {
      console.error('Error saving invoices:', err);
    }
  };

  // Update upcoming hearings
  const updateUpcomingHearings = (casesData) => {
    const upcoming = casesData
      .filter(c => c.nextHearing && c.status === 'active')
      .map(c => ({
        caseTitle: c.title,
        date: c.nextHearing,
        court: c.court,
        suitNo: c.suitNo
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
    setUpcomingHearings(upcoming);
  };

  useEffect(() => {
    updateUpcomingHearings(cases);
  }, [cases]);

  const taskTypes = [
    { id: 'drafting', label: 'Document Drafting', icon: FileText, desc: 'Contracts, pleadings, applications, affidavits' },
    { id: 'analysis', label: 'Legal Analysis', icon: Search, desc: 'Issue spotting, IRAC/FILAC reasoning' },
    { id: 'research', label: 'Legal Research', icon: BookOpen, desc: 'Case law, statutes, authorities' },
    { id: 'procedure', label: 'Procedural Guidance', icon: ChevronRight, desc: 'Court filing, evidence rules' },
    { id: 'interpretation', label: 'Statutory Interpretation', icon: Scale, desc: 'Analyze and explain legislation' },
    { id: 'general', label: 'General Query', icon: MessageSquare, desc: 'Ask anything legal-related' }
  ];

  const systemPrompt = `You are LexiAssist, an advanced AI-powered legal assistant designed specifically for Nigerian lawyers. You perform high-level legal reasoning, draft documents, interpret statutes, assist with legal research, and support litigation and corporate practice workflows.

CORE PRINCIPLES:
1. Default jurisdiction: Nigeria (Constitution, Acts, subsidiary legislation, Rules of Court, case law)
2. Use step-by-step reasoning (IRAC/FILAC methods)
3. Provide legal information and analysis, NOT definitive legal conclusions
4. Never hallucinate cases, laws, or authorities - state uncertainty clearly if unsure
5. Professional tone suitable for legal practice
6. Always include relevant statutory/case references when available

OUTPUT FORMAT:
1. Restate the user request
2. List assumptions (if needed)
3. Break down reasoning step-by-step
4. Provide final output in appropriate format (draft document, analysis, research summary, etc.)

For document drafting:
- Use appropriate legal headings
- Use jurisdiction-accurate statutory names
- Clean formatting suitable for professional use
- Include all necessary clauses

For legal analysis:
- Identify legal issues
- Apply relevant law
- Provide structured reasoning
- Cite authorities where possible

CONSTRAINTS:
- Treat all information as confidential
- Provide disclaimers where required
- Ask clarifying questions if input is incomplete
- Always state when verification is needed

Task Type: ${taskType || 'General Query'}`;

  // ========================================
  // GEMINI API INTEGRATION - MAIN ASSISTANT
  // ========================================
  const handleSubmit = async () => {
    if (!userInput.trim()) {
      setError('⚠️ Please enter your legal query or task');
      return;
    }

    if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      setError('⚠️ Please add your Gemini API key at the top of App.jsx. Get it free at: https://makersuite.google.com/app/apikey');
      return;
    }

    setLoading(true);
    setError('');
    setOutput('');

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser Request:\n${userInput}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8000,
            topP: 0.8,
            topK: 40
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE"
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        setOutput(data.candidates[0].content.parts[0].text);
      } else if (data.error) {
        setError(`❌ API Error: ${data.error.message}. Please check your API key and try again.`);
      } else {
        setError('❌ No response received from LexiAssist. Please try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(`❌ Error: ${err.message}. Please check your internet connection and API key.`);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // GEMINI API INTEGRATION - LEGAL RESEARCH
  // ========================================
  const handleResearch = async () => {
    if (!researchQuery.trim()) {
      setError('⚠️ Please enter a research query');
      return;
    }

    if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      setError('⚠️ Please add your Gemini API key at the top of App.jsx');
      return;
    }

    setResearchLoading(true);
    setResearchResults([]);
    setError('');

    try {
      const researchPrompt = `You are LexiAssist conducting legal research for Nigerian lawyers. 

Research Query: ${researchQuery}

Please provide comprehensive research results including:
1. Relevant Nigerian statutes and provisions (with section numbers)
2. Key case law precedents (if applicable)
3. Legal principles and doctrines involved
4. Practical guidance for Nigerian legal practice
5. Any recent amendments or updates to the law

Format your response with clear headings and bullet points. Be thorough and cite specific legal authorities where possible. If uncertain about any specific case names or statute numbers, clearly state this.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: researchPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 6000,
            topP: 0.9,
            topK: 40
          }
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const fullResponse = data.candidates[0].content.parts[0].text;
        
        setResearchResults([{
          query: researchQuery,
          result: fullResponse,
          timestamp: new Date().toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' })
        }]);
      } else if (data.error) {
        setError(`❌ Research API Error: ${data.error.message}`);
      } else {
        setError('❌ No research results received. Please try again.');
      }
    } catch (err) {
      console.error('Research error:', err);
      setError(`❌ Research Error: ${err.message}`);
    } finally {
      setResearchLoading(false);
    }
  };

  // Export functions
  const exportAsText = () => {
    try {
      if (!output || output.trim() === '') {
        alert('⚠️ No document content to export. Please generate a document first.');
        return;
      }
      
      const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LexiAssist_Document_${new Date().toISOString().slice(0,10)}_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      setError('');
      alert('✅ Document downloaded successfully!');
    } catch (err) {
      console.error('Export error:', err);
      alert('❌ Failed to download document. Please try again.');
    }
  };

  const exportAsHTML = () => {
    try {
      if (!output || output.trim() === '') {
        alert('⚠️ No document content to export. Please generate a document first.');
        return;
      }
      
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LexiAssist Legal Document</title>
    <style>
        body { 
            font-family: 'Times New Roman', serif; 
            line-height: 1.8; 
            max-width: 800px; 
            margin: 40px auto; 
            padding: 20px;
            color: #333;
        }
        h1 { 
            color: #1e3a8a; 
            border-bottom: 3px solid #1e3a8a; 
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .content {
            margin: 30px 0;
            white-space: pre-wrap;
            font-size: 14px;
        }
        .disclaimer { 
            background: #fef3c7; 
            border-left: 4px solid #f59e0b; 
            padding: 15px; 
            margin-top: 40px; 
            font-size: 11px;
            line-height: 1.6;
        }
        .footer {
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 11px; 
            color: #666;
        }
        @media print {
            body { margin: 0; padding: 20px; }
            .disclaimer { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <h1>LexiAssist Legal Document</h1>
    <div class="content">${output.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
    <div class="disclaimer">
        <strong>⚖️ Professional Disclaimer:</strong> This document is generated by LexiAssist for informational purposes only and does not constitute legal advice. 
        All legal work should be reviewed by a qualified Nigerian lawyer. LexiAssist assists with legal research and drafting but does not replace professional legal judgment.
    </div>
    <div class="footer">
        <p>Generated on ${new Date().toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' })}</p>
        <p><strong>LexiAssist</strong> - AI-Powered Legal Practice Management System</p>
        <p>Powered by Google Gemini AI</p>
    </div>
</body>
</html>`;
      
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LexiAssist_Document_${new Date().toISOString().slice(0,10)}_${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      setError('');
      alert('✅ Document downloaded successfully! Open the HTML file in any browser.');
    } catch (err) {
      console.error('Export error:', err);
      alert('❌ Failed to download document. Please try again.');
    }
  };

  // Case Management Functions
  const addCase = () => {
    try {
      if (!newCase.title || !newCase.title.trim()) {
        alert('⚠️ Please enter a case title');
        return;
      }
      if (!newCase.suitNo || !newCase.suitNo.trim()) {
        alert('⚠️ Please enter a suit number');
        return;
      }

      const caseWithId = {
        ...newCase,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        title: newCase.title.trim(),
        suitNo: newCase.suitNo.trim()
      };

      const updatedCases = [...cases, caseWithId];
      saveCases(updatedCases);
      
      setNewCase({
        title: '',
        suitNo: '',
        court: '',
        nextHearing: '',
        status: 'active',
        notes: '',
        clientId: ''
      });
      setShowAddCase(false);
      alert('✅ Case added successfully!');
    } catch (err) {
      console.error('Error adding case:', err);
      alert('❌ Failed to add case. Please try again.');
    }
  };

  const deleteCase = (id) => {
    try {
      if (confirm('⚠️ Are you sure you want to delete this case? This action cannot be undone.')) {
        const updatedCases = cases.filter(c => c.id !== id);
        saveCases(updatedCases);
        alert('✅ Case deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting case:', err);
      alert('❌ Failed to delete case. Please try again.');
    }
  };

  const updateCaseStatus = (id, newStatus) => {
    try {
      const updatedCases = cases.map(c => 
        c.id === id ? { ...c, status: newStatus } : c
      );
      saveCases(updatedCases);
    } catch (err) {
      console.error('Error updating case status:', err);
      alert('❌ Failed to update case status');
    }
  };

  // Client Management Functions
  const addClient = () => {
    try {
      if (!newClient.name || !newClient.name.trim()) {
        alert('⚠️ Please enter client name');
        return;
      }

      const clientWithId = {
        ...newClient,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        name: newClient.name.trim(),
        email: newClient.email.trim(),
        phone: newClient.phone.trim()
      };

      const updatedClients = [...clients, clientWithId];
      saveClients(updatedClients);
      
      setNewClient({
        name: '',
        email: '',
        phone: '',
        address: '',
        type: 'individual',
        notes: ''
      });
      setShowAddClient(false);
      alert('✅ Client added successfully!');
    } catch (err) {
      console.error('Error adding client:', err);
      alert('❌ Failed to add client. Please try again.');
    }
  };

  const deleteClient = (id) => {
    try {
      const clientCases = cases.filter(c => c.clientId === id);
      if (clientCases.length > 0) {
        if (!confirm(`⚠️ This client has ${clientCases.length} case(s). Delete anyway?`)) {
          return;
        }
      }
      
      if (confirm('⚠️ Are you sure you want to delete this client?')) {
        const updatedClients = clients.filter(c => c.id !== id);
        saveClients(updatedClients);
        alert('✅ Client deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting client:', err);
      alert('❌ Failed to delete client. Please try again.');
    }
  };

  // Time Tracking Functions
  const addTimeEntry = () => {
    try {
      if (!newTimeEntry.clientId) {
        alert('⚠️ Please select a client');
        return;
      }
      if (!newTimeEntry.description || !newTimeEntry.description.trim()) {
        alert('⚠️ Please enter a description');
        return;
      }
      if (!newTimeEntry.hours || parseFloat(newTimeEntry.hours) <= 0) {
        alert('⚠️ Please enter valid hours (greater than 0)');
        return;
      }
      if (!newTimeEntry.rate || parseFloat(newTimeEntry.rate) <= 0) {
        alert('⚠️ Please enter a valid hourly rate');
        return;
      }

      const entryWithId = {
        ...newTimeEntry,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        description: newTimeEntry.description.trim(),
        amount: parseFloat(newTimeEntry.hours) * parseFloat(newTimeEntry.rate)
      };

      const updatedEntries = [...timeEntries, entryWithId];
      saveTimeEntries(updatedEntries);
      
      setNewTimeEntry({
        caseId: '',
        clientId: '',
        description: '',
        hours: '',
        rate: '50000',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddTime(false);
      alert('✅ Time entry logged successfully!');
    } catch (err) {
      console.error('Error adding time entry:', err);
      alert('❌ Failed to add time entry. Please try again.');
    }
  };

  const deleteTimeEntry = (id) => {
    try {
      if (confirm('⚠️ Delete this time entry?')) {
        const updatedEntries = timeEntries.filter(e => e.id !== id);
        saveTimeEntries(updatedEntries);
        alert('✅ Time entry deleted');
      }
    } catch (err) {
      console.error('Error deleting time entry:', err);
      alert('❌ Failed to delete time entry');
    }
  };

  const generateInvoice = (clientId) => {
    try {
      const clientEntries = timeEntries.filter(e => e.clientId === clientId);
      const client = clients.find(c => c.id === clientId);
      
      if (!client) {
        alert('❌ Client not found');
        return;
      }
      
      if (clientEntries.length === 0) {
        alert('⚠️ No time entries found for this client');
        return;
      }

      const total = clientEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
      
      const invoice = {
        id: Date.now().toString(),
        invoiceNo: `INV-${Date.now()}`,
        clientId,
        clientName: client.name,
        entries: clientEntries,
        total,
        date: new Date().toISOString(),
        status: 'unpaid'
      };

      const updatedInvoices = [...invoices, invoice];
      saveInvoices(updatedInvoices);
      alert('✅ Invoice generated successfully!');
    } catch (err) {
      console.error('Error generating invoice:', err);
      alert('❌ Failed to generate invoice. Please try again.');
    }
  };

  const useTemplate = (template) => {
    try {
      if (!template || !template.content) {
        alert('❌ Invalid template');
        return;
      }
      setUserInput(template.content);
      setTaskType('drafting');
      setActiveTab('assistant');
      setSelectedTemplate(null);
      alert('✅ Template loaded! You can now customize and generate the document.');
    } catch (err) {
      console.error('Error using template:', err);
      alert('❌ Failed to load template. Please try again.');
    }
  };

  const filteredCases = filterStatus === 'all' 
    ? cases 
    : cases.filter(c => c.status === filterStatus);

  const getTotalBillable = () => {
    return timeEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
  };

  const getClientName = (clientId) => {
    try {
      if (!clientId) return 'No Client';
      const client = clients.find(c => c.id === clientId);
      return client ? client.name : 'Unknown Client';
    } catch (err) {
      return 'Unknown Client';
    }
  };

  const getCaseTitle = (caseId) => {
    try {
      if (!caseId) return 'No Case';
      const caseItem = cases.find(c => c.id === caseId);
      return caseItem ? caseItem.title : 'Unknown Case';
    } catch (err) {
      return 'Unknown Case';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Scale className="w-10 h-10 text-emerald-400" />
              <div>
                <h1 className="text-3xl font-bold">LexiAssist</h1>
                <p className="text-slate-300 text-sm">Complete Legal Practice Management System</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{cases.length}</div>
                <div className="text-slate-400">Cases</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{clients.length}</div>
                <div className="text-slate-400">Clients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  ₦{getTotalBillable().toLocaleString()}
                </div>
                <div className="text-slate-400">Billable</div>
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-6 border-b border-slate-700 overflow-x-auto pb-0">
            {[
              { id: 'assistant', icon: MessageSquare, label: 'AI Assistant' },
              { id: 'research', icon: Database, label: 'Research' },
              { id: 'cases', icon: FolderOpen, label: 'Cases', badge: cases.length },
              { id: 'calendar', icon: Calendar, label: 'Calendar', badge: upcomingHearings.length },
              { id: 'templates', icon: FileText, label: 'Templates' },
              { id: 'clients', icon: Users, label: 'Clients', badge: clients.length },
              { id: 'billing', icon: DollarSign, label: 'Billing' }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 px-4 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-emerald-400 border-b-2 border-emerald-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* AI ASSISTANT TAB */}
        {activeTab === 'assistant' && (
          <>
            {/* API Key Warning */}
            {GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE' && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">⚠️ API Key Required</h3>
                    <p className="text-yellow-700 mb-3">
                      To use LexiAssist, you need a free Google Gemini API key. Follow these steps:
                    </p>
                    <ol className="list-decimal list-inside text-yellow-700 space-y-1 mb-3">
                      <li>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-semibold">https://makersuite.google.com/app/apikey</a></li>
                      <li>Sign in with your Google account</li>
                      <li>Click "Create API Key"</li>
                      <li>Copy the API key</li>
                      <li>Open App.jsx file and replace 'YOUR_GEMINI_API_KEY_HERE' with your actual API key</li>
                    </ol>
                    <p className="text-sm text-yellow-600">
                      The API key should be on line 13 of App.jsx, right after <code className="bg-yellow-100 px-1 rounded">const GEMINI_API_KEY =</code>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Select Task Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {taskTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setTaskType(type.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        taskType === type.id
                          ? 'border-emerald-500 bg-emerald-50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-6 h-6 mt-1 ${taskType === type.id ? 'text-emerald-600' : 'text-slate-600'}`} />
                        <div>
                          <h3 className="font-semibold text-slate-800">{type.label}</h3>
                          <p className="text-sm text-slate-600 mt-1">{type.desc}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-lg font-semibold text-slate-800">
                  Describe Your Legal Task or Query
                </label>
                <button
                  onClick={() => setActiveTab('templates')}
                  className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <FileText className="w-4 h-4" />
                  Use Template
                </button>
              </div>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Example: Draft a lease agreement for commercial property in Lagos with 2-year term, annual rent review clause, and tenant improvement provisions..."
                className="w-full h-40 p-4 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none resize-none text-slate-700"
              />
              
              <div className="mt-4">
                <p className="text-sm text-slate-600 mb-2">Quick examples:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Draft an employment contract for a software developer with 6-month probation',
                    'Explain the procedure for filing a fundamental rights action in Nigeria',
                    'Analyze breach of fiduciary duty by company directors under CAMA 2020',
                    'Draft a power of attorney for property sale'
                  ].map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => setUserInput(example)}
                      className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 rounded-full transition-colors"
                    >
                      {example.substring(0, 50)}...
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing with Gemini AI...
                  </>
                ) : (
                  <>
                    <Scale className="w-5 h-5" />
                    Generate Legal Response
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-red-700 whitespace-pre-wrap">{error}</p>
                </div>
              </div>
            )}

            {output && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-emerald-600" />
                    <h2 className="text-xl font-semibold text-slate-800">LexiAssist Response</h2>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={exportAsText}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      TXT
                    </button>
                    <button
                      onClick={exportAsHTML}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      HTML
                    </button>
                  </div>
                </div>
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {output}
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t-2 border-slate-200">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-xs text-amber-900">
                      <strong>⚖️ Professional Disclaimer:</strong> This response is for informational purposes only and does not constitute legal advice. 
                      All legal work should be reviewed by a qualified Nigerian lawyer. LexiAssist assists with legal research and drafting but does not replace professional legal judgment.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!output && !loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <BookOpen className="w-8 h-8 text-emerald-600 mb-3" />
                  <h3 className="font-semibold text-slate-800 mb-2">Nigerian Law Focus</h3>
                  <p className="text-sm text-slate-600">
                    Specialized in Nigerian Constitution, Acts, case law, and court procedures
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <Search className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-slate-800 mb-2">Structured Reasoning</h3>
                  <p className="text-sm text-slate-600">
                    Uses IRAC/FILAC methodology for comprehensive legal analysis
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <FileText className="w-8 h-8 text-purple-600 mb-3" />
                  <h3 className="font-semibold text-slate-800 mb-2">Professional Output</h3>
                  <p className="text-sm text-slate-600">
                    Court-ready documents with proper formatting and citations
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* RESEARCH TAB */}
        {activeTab === 'research' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-emerald-600" />
                Legal Research Database
              </h2>
              <p className="text-slate-600 mb-6">
                Search for Nigerian statutes, case law, legal principles, and procedural guidance powered by Gemini AI
              </p>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={researchQuery}
                  onChange={(e) => setResearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleResearch()}
                  placeholder="E.g., 'Land Use Act Section 1 provisions' or 'Companies Act 2020 directors duties'"
                  className="flex-1 p-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
                <button
                  onClick={handleResearch}
                  disabled={researchLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  {researchLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Researching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Research
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <p className="text-sm text-slate-600 w-full mb-1">Popular searches:</p>
                {[
                  'Land Use Act provisions',
                  'Fundamental rights enforcement procedure',
                  'CAMA 2020 key provisions',
                  'Criminal procedure in Nigeria',
                  'Evidence Act admissibility rules',
                  'Contract law remedies Nigeria'
                ].map((query) => (
                  <button
                    key={query}
                    onClick={() => setResearchQuery(query)}
                    className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 rounded-full transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>

            {researchResults.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800">Research Results</h3>
                    <p className="text-sm text-slate-600 mt-1">Query: "{researchResults[0].query}"</p>
                    <p className="text-xs text-slate-500 mt-1">{researchResults[0].timestamp}</p>
                  </div>
                  <button
                    onClick={() => {
                      try {
                        const result = researchResults[0];
                        const content = `LEGAL RESEARCH RESULTS
========================

Query: ${result.query}
Date: ${result.timestamp}

${result.result}

---
Generated by LexiAssist - Legal Practice Management System
Powered by Google Gemini AI`;
                        
                        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Research_${result.query.substring(0, 30).replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        setTimeout(() => URL.revokeObjectURL(url), 100);
                        alert('✅ Research results downloaded successfully!');
                      } catch (err) {
                        alert('❌ Failed to download. Please try again.');
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
<Download className="w-4 h-4" />
Export
              </button>
            </div>
            <div className="prose prose-slate max-w-none">
              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                {researchResults[0].result}
              </div>
            </div>
          </div>
        )}

        {!researchResults.length && !researchLoading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Start Your Legal Research</h3>
            <p className="text-slate-600">
              Enter a query above to search Nigerian legal databases, statutes, and case law using AI
            </p>
          </div>
        )}
      </div>
    )}

    {/* CASES TAB */}
    {activeTab === 'cases' && (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <FolderOpen className="w-7 h-7 text-emerald-600" />
            Case Management
          </h2>
          <button
            onClick={() => setShowAddCase(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Case
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Filter:</span>
            <div className="flex gap-2 flex-wrap">
              {['all', 'active', 'pending', 'completed', 'archived'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {showAddCase && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Add New Case</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Case Title *</label>
                <input
                  type="text"
                  value={newCase.title}
                  onChange={(e) => setNewCase({...newCase, title: e.target.value})}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                  placeholder="E.g., John Doe v. State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Suit Number *</label>
                <input
                  type="text"
                  value={newCase.suitNo}
                  onChange={(e) => setNewCase({...newCase, suitNo: e.target.value})}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                  placeholder="E.g., FHC/L/CS/123/2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Court</label>
                <input
                  type="text"
                  value={newCase.court}
                  onChange={(e) => setNewCase({...newCase, court: e.target.value})}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                  placeholder="E.g., Federal High Court, Lagos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Next Hearing Date</label>
                <input
                  type="date"
                  value={newCase.nextHearing}
                  onChange={(e) => setNewCase({...newCase, nextHearing: e.target.value})}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Client</label>
                <select
                  value={newCase.clientId}
                  onChange={(e) => setNewCase({...newCase, clientId: e.target.value})}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={newCase.status}
                  onChange={(e) => setNewCase({...newCase, status: e.target.value})}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  value={newCase.notes}
                  onChange={(e) => setNewCase({...newCase, notes: e.target.value})}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none resize-none"
                  rows="3"
                  placeholder="Add case notes, key dates, or important details..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={addCase}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Save Case
              </button>
              <button
                onClick={() => setShowAddCase(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {filteredCases.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredCases.map((caseItem) => (
              <div key={caseItem.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">{caseItem.title}</h3>
                      <select
                        value={caseItem.status}
                        onChange={(e) => updateCaseStatus(caseItem.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          caseItem.status === 'active' ? 'bg-green-100 text-green-700' :
                          caseItem.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          caseItem.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <p className="text-sm text-slate-600 mb-1"><strong>Suit No:</strong> {caseItem.suitNo}</p>
                    {caseItem.court && (
                      <p className="text-sm text-slate-600 mb-1"><strong>Court:</strong> {caseItem.court}</p>
                    )}
                    {caseItem.clientId && (
                      <p className="text-sm text-slate-600 mb-1"><strong>Client:</strong> {getClientName(caseItem.clientId)}</p>
                    )}
                    {caseItem.nextHearing && (
                      <p className="text-sm text-slate-600 mb-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <strong>Next Hearing:</strong> {new Date(caseItem.nextHearing).toLocaleDateString('en-NG', { dateStyle: 'full' })}
                      </p>
                    )}
                    {caseItem.notes && (
                      <p className="text-sm text-slate-600 mt-3 p-3 bg-slate-50 rounded">{caseItem.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteCase(caseItem.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                    title="Delete case"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {filterStatus === 'all' ? 'No Cases Yet' : `No ${filterStatus} Cases`}
            </h3>
            <p className="text-slate-600 mb-4">
              {filterStatus === 'all' 
                ? 'Start tracking your cases by clicking "Add Case" above'
                : `You have no cases with status: ${filterStatus}`
              }
            </p>
            {filterStatus !== 'all' && (
              <button
                onClick={() => setFilterStatus('all')}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                View All Cases
              </button>
            )}
          </div>
        )}
      </div>
    )}

    {/* CALENDAR TAB */}
    {activeTab === 'calendar' && (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
          <Calendar className="w-7 h-7 text-emerald-600" />
          Court Calendar & Hearing Reminders
        </h2>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            Upcoming Hearings
          </h3>
          {upcomingHearings.length > 0 ? (
            <div className="space-y-3">
              {upcomingHearings.map((hearing, idx) => {
                const hearingDate = new Date(hearing.date);
                const today = new Date();
                const daysUntil = Math.ceil((hearingDate - today) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={idx} className={`p-4 rounded-lg border-2 transition-all ${
                    daysUntil <= 3 ? 'border-red-300 bg-red-50' :
                    daysUntil <= 7 ? 'border-yellow-300 bg-yellow-50' :
                    'border-slate-200 bg-white hover:shadow-md'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800">{hearing.caseTitle}</h4>
                        <p className="text-sm text-slate-600 mt-1">Suit No: {hearing.suitNo}</p>
                        {hearing.court && (
                          <p className="text-sm text-slate-600">Court: {hearing.court}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-700">
                            {hearingDate.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          daysUntil <= 3 ? 'bg-red-200 text-red-800' :
                          daysUntil <= 7 ? 'bg-yellow-200 text-yellow-800' :
                          'bg-slate-200 text-slate-800'
                        }`}>
                          {daysUntil === 0 ? 'Today!' : 
                           daysUntil === 1 ? 'Tomorrow' :
                           daysUntil < 0 ? 'Overdue' :
                           `${daysUntil} days`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No upcoming hearings scheduled</p>
              <p className="text-sm text-slate-500 mt-2">Add hearing dates to your cases to see them here</p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg shadow-md p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Calendar Features
          </h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
              <span><strong>Color-coded urgency:</strong> Red (3 days or less), Yellow (within 7 days), Grey (future dates)</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
              <span><strong>Automatic reminders:</strong> Check this page regularly for upcoming hearings</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
              <span><strong>Integration:</strong> Hearings automatically sync from your case management</span>
            </li>
          </ul>
        </div>
      </div>
    )}

    {/* TEMPLATES TAB */}
    {activeTab === 'templates' && (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="w-7 h-7 text-emerald-600" />
            Document Templates Library
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">{template.name}</h3>
                  <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                    {template.category}
                  </span>
                </div>
                <FileText className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600 mb-4 line-clamp-3">{template.content.substring(0, 100)}...</p>
              <div className="flex gap-2">
                <button
                  onClick={() => useTemplate(template)}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <Copy className="w-4 h-4" />
                  Use Template
                </button>
                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-semibold text-slate-800">{selectedTemplate.name}</h3>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono bg-slate-50 p-4 rounded">
                  {selectedTemplate.content}
                </pre>
              </div>
              <div className="flex gap-3 p-6 border-t">
                <button
                  onClick={() => {
                    useTemplate(selectedTemplate);
                    setSelectedTemplate(null);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Use This Template
                </button>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )}

    {/* CLIENTS TAB */}
    {activeTab === 'clients' && (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-600" />
            Client Management
          </h2>
          <button
            onClick={() => setShowAddClient(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Client
          </button>
        </div>

        {showAddClient && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Add New Client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Client Name *</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                  placeholder="Full Name or Company Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                  placeholder="+234 xxx xxx xxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Client Type</label>
                <select
                  value={newClient.type}
                  onChange={(e) => setNewClient({...newClient, type: e.target.value})}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                >
                  <option value="individual">Individual</option>
                  <option value="corporate">Corporate</option>
                  <option value="government">Government</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                <input
                  type="text"
                  value={newClient.address}
                  onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                  placeholder="Physical Address"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  value={newClient.notes}
                  onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none resize-none"
                  rows="3"
                  placeholder="Additional information about the client..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={addClient}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Save Client
              </button>
              <button
                onClick={() => setShowAddClient(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {clients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clients.map((client) => {
              const clientCases = cases.filter(c => c.clientId === client.id);
              const clientBilling = timeEntries.filter(e => e.clientId === client.id).reduce((sum, e) => sum + (e.amount || 0), 0);
              
              return (
                <div key={client.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800">{client.name}</h3>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mt-1">
                        {client.type}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteClient(client.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                      title="Delete client"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {client.email && (
                    <p className="text-sm text-slate-600 mb-1">📧 {client.email}</p>
                  )}
                  {client.phone && (
                    <p className="text-sm text-slate-600 mb-1">📱 {client.phone}</p>
                  )}
                  {client.address && (
                    <p className="text-sm text-slate-600 mb-3">📍 {client.address}</p>
                  )}
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-emerald-600">{clientCases.length}</div>
                        <div className="text-xs text-slate-600">Cases</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">₦{clientBilling.toLocaleString()}</div>
                        <div className="text-xs text-slate-600">Billable</div>
                      </div>
                    </div>
                  </div>
                  
                  {clientBilling > 0 && (
                    <button
                      onClick={() => generateInvoice(client.id)}
                      className="w-full mt-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      Generate Invoice
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Clients Yet</h3>
            <p className="text-slate-600">Start managing your clients by clicking "Add Client" above</p>
          </div>
        )}
      </div>
    )}

    {/* BILLING TAB */}
    {activeTab === 'billing' && (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-emerald-600" />
            Billing & Time Tracking
          </h2>
          <button
            onClick={() => setShowAddTime(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Log Time
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Billable</h3>
              <DollarSign className="w-6 h-6 opacity-75" />
            </div>
            <div className="text-3xl font-bold">₦{getTotalBillable().toLocaleString()}</div>
            <p className="text-sm opacity-75 mt-1">{timeEntries.length} time entries</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Hours</h3>
              <Clock className="w-6 h-6 opacity-75" />
            </div>
            <div className="text-3xl font-bold">
              {timeEntries.reduce((sum, e) => sum + parseFloat(e.hours || 0), 0).toFixed(1)}
            </div>
            <p className="text-sm opacity-75 mt-1">Hours logged</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Invoices</h3>
              <FileText className="w-6 h-6 opacity-75" />
            </div>
            <div className="text-3xl font-bold">{invoices.length}</div>
            <p className="text-sm opacity-75 mt-1">Generated invoices</p>
          </div>
        </div>

        {/* Add Time Entry Form */}
        {showAddTime && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Log Time Entry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Client *</label>
                <select
                  value={newTimeEntry.clientId}
                  onChange={(e) => setNewTimeEntry({...newTimeEntry, clientId: e.target.value})}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Case (Optional)</label>
                <select
                  value={newTimeEntry.caseId}
                  onChange={(e) => setNewTimeEntry({...newTimeEntry, caseId: e.target.value})}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Select Case</option>
                  {cases.map(caseItem => (
                    <option key={caseItem.id} value={caseItem.id}>{caseItem.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date *</label>
                <input
                  type="date"
                  value={newTimeEntry.date}
                  onChange={(e) => setNewTimeEntry({...newTimeEntry, date: e.target.value})}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hours *</label>
                <input
                  type="number"
                  step="0.25"
                  value={newTimeEntry.hours}
                  onChange={(e) => setNewTimeEntry({...newTimeEntry, hours: e.target.value})}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g., 2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hourly Rate (₦) *</label>
                <input
                  type="number"
                  value={newTimeEntry.rate}
                  onChange={(e) => setNewTimeEntry({...newTimeEntry, rate: e.target.value})}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                  placeholder="50000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Total Amount</label>
                <div className="w-full p-2 border-2 border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-semibold">
                  ₦{((parseFloat(newTimeEntry.hours) || 0) * (parseFloat(newTimeEntry.rate) || 0)).toLocaleString()}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
                <textarea
                  value={newTimeEntry.description}
                  onChange={(e) => setNewTimeEntry({...newTimeEntry, description: e.target.value})}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none resize-none"
                  rows="3"
                  placeholder="Describe the work performed..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={addTimeEntry}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Save Entry
              </button>
              <button
                onClick={() => setShowAddTime(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Time Entries List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-slate-800">Recent Time Entries</h3>
          </div>
          {timeEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">Hours</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">Rate</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">Amount</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {timeEntries.slice().reverse().map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                        {new Date(entry.date).toLocaleDateString('en-NG')}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {getClientName(entry.clientId)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {entry.description.substring(0, 50)}{entry.description.length > 50 ? '...' : ''}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 text-right whitespace-nowrap">
                        {entry.hours}h
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 text-right whitespace-nowrap">
                        ₦{parseFloat(entry.rate).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800 text-right whitespace-nowrap">
                        ₦{(entry.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => deleteTimeEntry(entry.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Time Entries Yet</h3>
              <p className="text-slate-600">Start logging your billable hours by clicking "Log Time" above</p>
            </div>
          )}
        </div>

        {/* Invoices Section */}
        {invoices.length > 0 && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-slate-800">Generated Invoices</h3>
            </div>
            <div className="divide-y divide-slate-200">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-slate-800">{invoice.invoiceNo}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                          invoice.status === 'unpaid' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {invoice.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">Client: {invoice.clientName}</p>
                      <p className="text-sm text-slate-600">Date: {new Date(invoice.date).toLocaleDateString('en-NG', { dateStyle: 'long' })}</p>
                      <p className="text-sm text-slate-600">{invoice.entries.length} time entries</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">
                        ₦{(invoice.total || 0).toLocaleString()}
                      </div>
                      <button
                        onClick={() => {
                          try {
                            const content = `
═══════════════════════════════════════════════════
INVOICE
═══════════════════════════════════════════════════
Invoice Number: ${invoice.invoiceNo}
Date: ${new Date(invoice.date).toLocaleDateString('en-NG', { dateStyle: 'full' })}
Status: ${invoice.status.toUpperCase()}
BILL TO:
${invoice.clientName}
───────────────────────────────────────────────────
TIME ENTRIES
───────────────────────────────────────────────────
${invoice.entries.map((e, i) => ${i + 1}. Date: ${new Date(e.date).toLocaleDateString('en-NG')}    Description: ${e.description}    Hours: ${e.hours} @ ₦${parseFloat(e.rate).toLocaleString()}/hr    Amount: ₦${(e.amount || 0).toLocaleString()}).join('\n')}
───────────────────────────────────────────────────
TOTAL AMOUNT DUE: ₦${(invoice.total || 0).toLocaleString()}
───────────────────────────────────────────────────
Payment Terms: Due upon receipt
Payment Methods: Bank Transfer, Cash, Cheque
Thank you for your business.
═══════════════════════════════════════════════════
Generated by LexiAssist
Legal Practice Management System
Powered by Google Gemini AI
Generated on: ${new Date().toLocaleString('en-NG')}
═══════════════════════════════════════════════════
`.trim();
                            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${invoice.invoiceNo}_${invoice.clientName.replace(/[^a-z0-9]/gi, '_')}.txt`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            setTimeout(() => URL.revokeObjectURL(url), 100);
                            alert('✅ Invoice downloaded successfully!');
                          } catch (err) {
                            alert('❌ Failed to download invoice.');
                          }
                        }}
                        className="mt-2 flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </div>

  {/* Footer */}
  <div className="bg-slate-900 text-white mt-12">
    <div className="max-w-7xl mx-auto px-6 py-6 text-center">
      <p className="text-slate-400 text-sm">
        LexiAssist - AI-Powered Legal Practice Management System for Nigerian Lawyers
      </p>
      <p className="text-slate-500 text-xs mt-2">
        Powered by Google Gemini AI | © 2024 All Rights Reserved
      </p>
    </div>
  </div>
</div>
);
};
ReactDOM.render(<LexiAssist />, document.getElementById('root'));
