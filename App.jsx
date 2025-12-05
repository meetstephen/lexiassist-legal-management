import React, { useState, useEffect } from 'react';
import { Scale, FileText, Search, BookOpen, MessageSquare, AlertCircle, Loader2, ChevronRight, Download, Database, FolderOpen, Calendar, Plus, Trash2, Eye, Filter, Clock, Users, DollarSign, Copy, Edit2, Save, X } from 'lucide-react';

const LexiAssist = () => {
  const [activeTab, setActiveTab] = useState('assistant');
  const [taskType, setTaskType] = useState('');
  const [userInput, setUserInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Legal Research State
  const [researchQuery, setResearchQuery] = useState('');
  const [researchResults, setResearchResults] = useState([]);
  const [researchLoading, setResearchLoading] = useState(false);
  
  // Case Tracking State
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

  // Calendar & Reminders State
  const [upcomingHearings, setUpcomingHearings] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);

  // Document Templates State
  const [templates, setTemplates] = useState([
    { id: '1', name: 'Employment Contract', category: 'Corporate', content: 'EMPLOYMENT CONTRACT\n\nThis Employment Contract is made on [DATE] between:\n\n1. [EMPLOYER NAME] (hereinafter called "the Employer")\n2. [EMPLOYEE NAME] (hereinafter called "the Employee")\n\nTERMS:\n1. Position: [JOB TITLE]\n2. Commencement Date: [START DATE]\n3. Probation Period: [PERIOD]\n4. Salary: [AMOUNT] per [PERIOD]\n5. Working Hours: [HOURS]\n\n[Additional clauses as applicable under Nigerian Labour Law]' },
    { id: '2', name: 'Tenancy Agreement', category: 'Property', content: 'TENANCY AGREEMENT\n\nThis Agreement is made on [DATE] between:\n\nLANDLORD: [NAME]\nTENANT: [NAME]\n\nPREMISES: [ADDRESS]\nRENT: N[AMOUNT] per [PERIOD]\nTERM: [DURATION]\n\n[Clauses in accordance with Lagos State Tenancy Law]' },
    { id: '3', name: 'Power of Attorney', category: 'Litigation', content: 'POWER OF ATTORNEY\n\nI, [GRANTOR NAME], of [ADDRESS], hereby appoint [ATTORNEY NAME] of [ADDRESS] as my lawful attorney...\n\n[Powers granted]\n[Duration]\n[Signature provisions]' },
    { id: '4', name: 'Written Address', category: 'Litigation', content: 'IN THE [COURT NAME]\nIN THE [JUDICIAL DIVISION]\nHOLDEN AT [LOCATION]\n\nSUIT NO: [NUMBER]\n\nBETWEEN:\n[PLAINTIFF] ....... PLAINTIFF\nAND\n[DEFENDANT] ....... DEFENDANT\n\nWRITTEN ADDRESS\n\n[Counsel details]\n[Date]\n\n1. INTRODUCTION\n2. FACTS\n3. ISSUES FOR DETERMINATION\n4. ARGUMENTS\n5. CONCLUSION' },
    { id: '5', name: 'Affidavit', category: 'Litigation', content: 'AFFIDAVIT\n\nI, [NAME], of [ADDRESS], [OCCUPATION], do hereby make oath and state as follows:\n\n1. [First paragraph of facts]\n2. [Second paragraph]\n3. [Continue numbering]\n\nDEPONENT\n\nSworn to at [LOCATION]\nThis [DATE]\n\nBefore me,\n[COMMISSIONER FOR OATHS]' }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Client Management State
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
  const [selectedClient, setSelectedClient] = useState(null);

  // Billing & Time Tracking State
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

  // Load data from storage
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

Task Type: ${taskType || 'General Query'}`;

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      setError('Please enter your legal query or task');
      return;
    }

    setLoading(true);
    setError('');
    setOutput('');

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: `${systemPrompt}\n\nUser Request:\n${userInput}`
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.content && data.content[0]) {
        setOutput(data.content[0].text);
      } else {
        setError('No response received from LexiAssist');
      }
    } catch (err) {
      setError('Error processing request: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResearch = async () => {
    if (!researchQuery.trim()) return;

    setResearchLoading(true);
    setResearchResults([]);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 3000,
          messages: [
            {
              role: 'user',
              content: `You are LexiAssist conducting legal research for Nigerian lawyers. 

Research Query: ${researchQuery}

Please provide:
1. Relevant Nigerian statutes and provisions
2. Key case law (if any well-known cases apply)
3. Legal principles involved
4. Practical guidance for Nigerian legal practice

Format your response with clear headings for each section. If you're uncertain about specific case names or statute numbers, clearly state this and provide general guidance instead.`
            }
          ],
          tools: [
            {
              "type": "web_search_20250305",
              "name": "web_search"
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.content) {
        const fullResponse = data.content
          .map(item => (item.type === "text" ? item.text : ""))
          .filter(Boolean)
          .join("\n");
        
        setResearchResults([{
          query: researchQuery,
          result: fullResponse,
          timestamp: new Date().toLocaleString()
        }]);
      }
    } catch (err) {
      setError('Error conducting research: ' + err.message);
    } finally {
      setResearchLoading(false);
    }
  };

  const exportAsText = () => {
    try {
      if (!output || output.trim() === '') {
        alert('No document content to export. Please generate a document first.');
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
      
      // Show success message
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
        alert('No document content to export. Please generate a document first.');
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
      
      // Show success message
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
      setShowTemplates(false);
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
    return timeEntries.reduce((sum, e) => sum + e.amount, 0);
  };

  const getClientName = (clientId) => {
    try {
      if (!clientId) return 'No Client';
      const client = clients.find(c => c.id === clientId);
      return client ? client.name : 'Unknown Client';
    } catch (err) {
      console.error('Error getting client name:', err);
      return 'Unknown Client';
    }
  };

  const getCaseTitle = (caseId) => {
    try {
      if (!caseId) return 'No Case';
      const caseItem = cases.find(c => c.id === caseId);
      return caseItem ? caseItem.title : 'Unknown Case';
    } catch (err) {
      console.error('Error getting case title:', err);
      return 'Unknown Case';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="w-10 h-10 text-emerald-400" />
              <div>
                <h1 className="text-3xl font-bold">LexiAssist</h1>
                <p className="text-slate-300 text-sm">Complete Legal Practice Management System</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{cases.length}</div>
                <div className="text-slate-400">Active Cases</div>
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
          <div className="flex gap-2 mt-6 border-b border-slate-700 overflow-x-auto">
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
                  onClick={() => {
                    setShowTemplates(true);
                    setActiveTab('templates');
                  }}
                  className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
                >
                  <FileText className="w-4 h-4" />
                  Use Template
                </button>
              </div>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Example: Draft a lease agreement for commercial property in Lagos with 2-year term and rent review clause..."
                className="w-full h-40 p-4 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none resize-none text-slate-700"
              />

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
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
                <div>
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-red-700">{error}</p>
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
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      TXT
                    </button>
                    <button
                      onClick={exportAsHTML}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors text-sm"
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
                      <strong>Professional Disclaimer:</strong> This response is for informational purposes only and does not constitute legal advice. 
                      All legal work should be reviewed by a qualified Nigerian lawyer.
                    </p>
                  </div>
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

              <div className="flex gap-3">
                <input
                  type="text"
                  value={researchQuery}
                  onChange={(e) => setResearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleResearch()}
                  placeholder="E.g., 'breach of contract remedies Nigeria'"
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
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Research
                    </>
                  )}
                </button>
              </div>
            </div>

            {researchResults.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Research Results</h3>
                    <p className="text-sm text-slate-600">Query: "{researchResults[0].query}"</p>
                  </div>
                  <button
                    onClick={() => {
                      const blob = new Blob([researchResults[0].result], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Research_${Date.now()}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm"
                  >
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
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Filter:</span>
                <div className="flex gap-2">
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
                  <div key={caseItem.id} className="bg-white rounded-lg shadow-md p-6">
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
                            <strong>Next Hearing:</strong> {new Date(caseItem.nextHearing).toLocaleDateString()}
                          </p>
                        )}
                        {caseItem.notes && (
                          <p className="text-sm text-slate-600 mt-3 p-3 bg-slate-50 rounded">{caseItem.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteCase(caseItem.id)}
                        className="text-red-600 hover:text-red-700 p-2"
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
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No Cases Found</h3>
                <p className="text-slate-600">Start tracking cases by clicking "Add Case"</p>
              </div>
            )}
          </div>
        )}

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
              <Calendar className="w-7 h-7 text-emerald-600" />
              Court Calendar & Reminders
            </h2>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Hearings</h3>
              {upcomingHearings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingHearings.map((hearing, idx) => {
                    const hearingDate = new Date(hearing.date);
                    const today = new Date();
                    const daysUntil = Math.ceil((hearingDate - today) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={idx} className={`p-4 rounded-lg border-2 ${
                        daysUntil <= 3 ? 'border-red-300 bg-red-50' :
                        daysUntil <= 7 ? 'border-yellow-300 bg-yellow-50' :
                        'border-slate-200 bg-white'
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
                              {daysUntil === 0 ? 'Today' : 
                               daysUntil === 1 ? 'Tomorrow' :
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
                Calendar Integration Tips
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-emerald-600" />
                  <span>Set reminder alerts 7, 3, and 1 day before hearings</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-emerald-600" />
                  <span>Color-coded urgency: Red (3 days), Yellow (7 days), Grey (future)</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-emerald-600" />
                  <span>Export hearing dates to your phone or desktop calendar</span>
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
                <div key={template.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
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
                      placeholder="Full Name or Company"
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
                      placeholder="Additional information..."
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
                  const clientBilling = timeEntries.filter(e => e.clientId === client.id).reduce((sum, e) => sum + e.amount, 0);
                  
                  return (
                    <div key={client.id} className="bg-white rounded-lg shadow-md p-6">
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
                <p className="text-slate-600">Start managing your clients by clicking "Add Client"</p>
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
                <h3 className="text-lg font-semibold text-slate-800">Time Entries</h3>
              </div>
              {timeEntries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Case</th>
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
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {getClientName(entry.clientId)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {entry.caseId ? getCaseTitle(entry.caseId).substring(0, 30) : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {entry.description.substring(0, 50)}...
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 text-right">
                            {entry.hours}h
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 text-right">
                            ₦{parseFloat(entry.rate).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-800 text-right">
                            ₦{entry.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => deleteTimeEntry(entry.id)}
                              className="text-red-600 hover:text-red-700"
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
                  <p className="text-slate-600">Start logging your billable hours by clicking "Log Time"</p>
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
                    <div key={invoice.id} className="p-6 hover:bg-slate-50">
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
                          <p className="text-sm text-slate-600">Date: {new Date(invoice.date).toLocaleDateString()}</p>
                          <p className="text-sm text-slate-600">{invoice.entries.length} time entries</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-600">
                            ₦{invoice.total.toLocaleString()}
                          </div>
                          <button
                            onClick={() => {
                              try {
                                if (!invoice || !invoice.entries || invoice.entries.length === 0) {
                                  alert('⚠️ Invalid invoice data');
                                  return;
                                }
                                
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

${invoice.entries.map((e, i) => `
${i + 1}. Date: ${new Date(e.date).toLocaleDateString()}
   Description: ${e.description}
   Hours: ${e.hours} @ ₦${parseFloat(e.rate).toLocaleString()}/hr
   Amount: ₦${e.amount.toLocaleString()}
`).join('\n')}

───────────────────────────────────────────────────
TOTAL AMOUNT DUE: ₦${invoice.total.toLocaleString()}
───────────────────────────────────────────────────

Payment Terms: Due upon receipt
Payment Methods: Bank Transfer, Cash, Cheque

Thank you for your business.

═══════════════════════════════════════════════════
Generated by LexiAssist
Legal Practice Management System
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
                                console.error('Invoice download error:', err);
                                alert('❌ Failed to download invoice. Please try again.');
                              }
                            }}
                            className="mt-2 flex items-center gap-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-sm"
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
    </div>
  );
};

export default LexiAssist;