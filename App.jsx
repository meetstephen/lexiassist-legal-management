// ============================================================

// LEXI-ASSIST - COMPLETE LEGAL PRACTICE MANAGEMENT SYSTEM

// Powered by Google Gemini Flash API

//

// SETUP INSTRUCTIONS FOR VERCEL:

// 1. Create a Next.js project: npx create-next-app@latest lexi-assist --typescript --tailwind

// 2. Replace the content of pages/index.tsx (or app/page.tsx) with this entire file

// 3. Install lucide-react: npm install lucide-react

// 4. Add GEMINI_API_KEY to your Vercel environment variables

// 5. Create pages/api/chat.ts with the API route (included at the bottom of this file as comments)

// 6. Deploy to Vercel

//

// ENVIRONMENT VARIABLE NEEDED:

// GEMINI_API_KEY=your_gemini_api_key_here

// ============================================================



import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, forwardRef } from 'react';

import {

Scale,

FileText,

Search,

BookOpen,

MessageSquare,

AlertCircle,

Loader2,

ChevronRight,

Download,

Database,

FolderOpen,

Calendar,

Plus,

Trash2,

Eye,

Filter,

Clock,

Users,

DollarSign,

Copy,

X,

Moon,

Sun,

CheckCircle2,

AlertTriangle,

Info,

Building2,

Mail,

Phone,

MapPin,

Receipt,

Sparkles,

Zap

} from 'lucide-react';



// ============================================================

// TYPES

// ============================================================



interface Case {

id: string;

title: string;

suitNo: string;

court: string;

nextHearing: string;

status: CaseStatus;

notes: string;

clientId: string;

createdAt: string;

updatedAt?: string;

}



type CaseStatus = 'active' | 'pending' | 'completed' | 'archived';



interface Client {

id: string;

name: string;

email: string;

phone: string;

address: string;

type: ClientType;

notes: string;

createdAt: string;

}



type ClientType = 'individual' | 'corporate' | 'government';



interface TimeEntry {

id: string;

caseId: string;

clientId: string;

description: string;

hours: number;

rate: number;

amount: number;

date: string;

createdAt: string;

}



interface Invoice {

id: string;

invoiceNo: string;

clientId: string;

clientName: string;

entries: TimeEntry[];

total: number;

date: string;

status: InvoiceStatus;

}



type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';



interface Template {

id: string;

name: string;

category: string;

content: string;

}



interface ToastItem {

id: string;

type: 'success' | 'error' | 'warning' | 'info';

message: string;

}



type TabId = 'assistant' | 'research' | 'cases' | 'calendar' | 'templates' | 'clients' | 'billing';



interface TaskType {

id: string;

label: string;

icon: React.ElementType;

description: string;

}



// ============================================================

// CONSTANTS

// ============================================================



const TASK_TYPES: TaskType[] = [

{

id: 'drafting',

label: 'Document Drafting',

icon: FileText,

description: 'Contracts, pleadings, applications, affidavits',

},

{

id: 'analysis',

label: 'Legal Analysis',

icon: Search,

description: 'Issue spotting, IRAC/FILAC reasoning',

},

{

id: 'research',

label: 'Legal Research',

icon: BookOpen,

description: 'Case law, statutes, authorities',

},

{

id: 'procedure',

label: 'Procedural Guidance',

icon: ChevronRight,

description: 'Court filing, evidence rules',

},

{

id: 'interpretation',

label: 'Statutory Interpretation',

icon: Scale,

description: 'Analyze and explain legislation',

},

{

id: 'general',

label: 'General Query',

icon: MessageSquare,

description: 'Ask anything legal-related',

},

];



const DEFAULT_TEMPLATES: Template[] = [

{

id: '1',

name: 'Employment Contract',

category: 'Corporate',

content: `EMPLOYMENT CONTRACT



This Employment Contract is made on [DATE] between:



1. [EMPLOYER NAME] (hereinafter called "the Employer")

2. [EMPLOYEE NAME] (hereinafter called "the Employee")



TERMS:

1. Position: [JOB TITLE]

2. Commencement Date: [START DATE]

3. Probation Period: [PERIOD]

4. Salary: [AMOUNT] per [PERIOD]

5. Working Hours: [HOURS]



[Additional clauses as applicable under Nigerian Labour Law]`,

},

{

id: '2',

name: 'Tenancy Agreement',

category: 'Property',

content: `TENANCY AGREEMENT



This Agreement is made on [DATE] between:



LANDLORD: [NAME]

TENANT: [NAME]



PREMISES: [ADDRESS]

RENT: N[AMOUNT] per [PERIOD]

TERM: [DURATION]



[Clauses in accordance with Lagos State Tenancy Law]`,

},

{

id: '3',

name: 'Power of Attorney',

category: 'Litigation',

content: `POWER OF ATTORNEY



I, [GRANTOR NAME], of [ADDRESS], hereby appoint [ATTORNEY NAME] of [ADDRESS] as my lawful attorney...



[Powers granted]

[Duration]

[Signature provisions]`,

},

{

id: '4',

name: 'Written Address',

category: 'Litigation',

content: `IN THE [COURT NAME]

IN THE [JUDICIAL DIVISION]

HOLDEN AT [LOCATION]



SUIT NO: [NUMBER]



BETWEEN:

[PLAINTIFF] ....... PLAINTIFF

AND

[DEFENDANT] ....... DEFENDANT



WRITTEN ADDRESS



[Counsel details]

[Date]



1. INTRODUCTION

2. FACTS

3. ISSUES FOR DETERMINATION

4. ARGUMENTS

5. CONCLUSION`,

},

{

id: '5',

name: 'Affidavit',

category: 'Litigation',

content: `AFFIDAVIT



I, [NAME], of [ADDRESS], [OCCUPATION], do hereby make oath and state as follows:



1. [First paragraph of facts]

2. [Second paragraph]

3. [Continue numbering]



DEPONENT



Sworn to at [LOCATION]

This [DATE]



Before me,

[COMMISSIONER FOR OATHS]`,

},

{

id: '6',

name: 'Legal Opinion',

category: 'Corporate',

content: `LEGAL OPINION



TO: [CLIENT NAME]

FROM: [LAW FIRM NAME]

DATE: [DATE]

RE: [SUBJECT MATTER]



1. INTRODUCTION

[Brief background of the matter]



2. ISSUES FOR CONSIDERATION

[List the legal issues to be addressed]



3. APPLICABLE LAW

[Relevant statutes, regulations, and case law]



4. ANALYSIS

[Detailed legal analysis of each issue]



5. CONCLUSION AND RECOMMENDATIONS

[Summary of findings and recommended course of action]



6. CAVEATS

[Limitations of the opinion]



[Signature]

[Name of Counsel]`,

},

];



const CASE_STATUSES: CaseStatus[] = ['active', 'pending', 'completed', 'archived'];

const CLIENT_TYPES: ClientType[] = ['individual', 'corporate', 'government'];



const STORAGE_KEYS = {

CASES: 'lexi-cases',

CLIENTS: 'lexi-clients',

TIME_ENTRIES: 'lexi-time-entries',

INVOICES: 'lexi-invoices',

THEME: 'lexi-theme',

} as const;



// Gemini API Configuration

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';



// ============================================================

// UTILITY FUNCTIONS

// ============================================================



const cn = (...classes: (string | boolean | undefined | null)[]): string => {

return classes.filter(Boolean).join(' ');

};



const formatCurrency = (amount: number): string => {

return `₦${amount.toLocaleString()}`;

};



const formatDate = (date: string): string => {

return new Date(date).toLocaleDateString('en-NG', {

year: 'numeric',

month: 'long',

day: 'numeric',

});

};



const formatRelativeDate = (date: string): string => {

const now = new Date();

const target = new Date(date);

const diffTime = target.getTime() - now.getTime();

const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));



if (diffDays === 0) return 'Today';

if (diffDays === 1) return 'Tomorrow';

if (diffDays === -1) return 'Yesterday';

if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;

if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

return formatDate(date);

};



const generateId = (): string => {

return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

};



// ============================================================

// LOCAL STORAGE HELPER

// ============================================================



const storage = {

get: <T>(key: string, defaultValue: T): T => {

if (typeof window === 'undefined') return defaultValue;

try {

const item = localStorage.getItem(key);

return item ? JSON.parse(item) : defaultValue;

} catch {

return defaultValue;

}

},

set: <T>(key: string, value: T): void => {

if (typeof window === 'undefined') return;

try {

localStorage.setItem(key, JSON.stringify(value));

} catch (error) {

console.error('Storage error:', error);

}

},

};



// ============================================================

// GEMINI API HELPER

// ============================================================



const callGeminiAPI = async (prompt: string, apiKey: string): Promise<string> => {

const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {

method: 'POST',

headers: {

'Content-Type': 'application/json',

},

body: JSON.stringify({

contents: [

{

parts: [

{

text: prompt,

},

],

},

],

generationConfig: {

temperature: 0.7,

topK: 40,

topP: 0.95,

maxOutputTokens: 8192,

},

safetySettings: [

{

category: 'HARM_CATEGORY_HARASSMENT',

threshold: 'BLOCK_MEDIUM_AND_ABOVE',

},

{

category: 'HARM_CATEGORY_HATE_SPEECH',

threshold: 'BLOCK_MEDIUM_AND_ABOVE',

},

{

category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',

threshold: 'BLOCK_MEDIUM_AND_ABOVE',

},

{

category: 'HARM_CATEGORY_DANGEROUS_CONTENT',

threshold: 'BLOCK_MEDIUM_AND_ABOVE',

},

],

}),

});



if (!response.ok) {

const errorData = await response.json().catch(() => ({}));

throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);

}



const data = await response.json();


if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {

return data.candidates[0].content.parts[0].text;

}


throw new Error('No response generated');

};



// ============================================================

// CONTEXT

// ============================================================



interface AppContextType {

// Theme

isDark: boolean;

toggleTheme: () => void;


// API Key

apiKey: string;

setApiKey: (key: string) => void;


// Navigation

activeTab: TabId;

setActiveTab: (tab: TabId) => void;


// Cases

cases: Case[];

addCase: (caseData: Omit<Case, 'id' | 'createdAt'>) => void;

updateCase: (id: string, updates: Partial<Case>) => void;

deleteCase: (id: string) => void;


// Clients

clients: Client[];

addClient: (clientData: Omit<Client, 'id' | 'createdAt'>) => void;

updateClient: (id: string, updates: Partial<Client>) => void;

deleteClient: (id: string) => void;

getClientName: (id: string) => string;


// Billing

timeEntries: TimeEntry[];

addTimeEntry: (entryData: Omit<TimeEntry, 'id' | 'createdAt' | 'amount'>) => void;

deleteTimeEntry: (id: string) => void;

invoices: Invoice[];

generateInvoice: (clientId: string) => void;


// Toast

toasts: ToastItem[];

showToast: (type: ToastItem['type'], message: string) => void;

removeToast: (id: string) => void;

}



const AppContext = createContext<AppContextType | null>(null);



const useApp = (): AppContextType => {

const context = useContext(AppContext);

if (!context) {

throw new Error('useApp must be used within AppProvider');

}

return context;

};



// ============================================================

// APP PROVIDER

// ============================================================



const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

// Theme

const [isDark, setIsDark] = useState(false);


// API Key

const [apiKey, setApiKeyState] = useState('');


// Navigation

const [activeTab, setActiveTab] = useState<TabId>('assistant');


// Data

const [cases, setCases] = useState<Case[]>([]);

const [clients, setClients] = useState<Client[]>([]);

const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

const [invoices, setInvoices] = useState<Invoice[]>([]);


// Toast

const [toasts, setToasts] = useState<ToastItem[]>([]);



// Load data on mount

useEffect(() => {

setCases(storage.get(STORAGE_KEYS.CASES, []));

setClients(storage.get(STORAGE_KEYS.CLIENTS, []));

setTimeEntries(storage.get(STORAGE_KEYS.TIME_ENTRIES, []));

setInvoices(storage.get(STORAGE_KEYS.INVOICES, []));

setIsDark(storage.get(STORAGE_KEYS.THEME, false));

setApiKeyState(storage.get('lexi-gemini-key', ''));

}, []);



// Theme effect

useEffect(() => {

document.documentElement.classList.toggle('dark', isDark);

storage.set(STORAGE_KEYS.THEME, isDark);

}, [isDark]);



const toggleTheme = useCallback(() => {

setIsDark(prev => !prev);

}, []);



const setApiKey = useCallback((key: string) => {

setApiKeyState(key);

storage.set('lexi-gemini-key', key);

}, []);



// Toast functions

const showToast = useCallback((type: ToastItem['type'], message: string) => {

const id = generateId();

setToasts(prev => [...prev, { id, type, message }]);

setTimeout(() => {

setToasts(prev => prev.filter(t => t.id !== id));

}, 5000);

}, []);



const removeToast = useCallback((id: string) => {

setToasts(prev => prev.filter(t => t.id !== id));

}, []);



// Case functions

const addCase = useCallback((caseData: Omit<Case, 'id' | 'createdAt'>) => {

const newCase: Case = {

...caseData,

id: generateId(),

createdAt: new Date().toISOString(),

};

setCases(prev => {

const updated = [...prev, newCase];

storage.set(STORAGE_KEYS.CASES, updated);

return updated;

});

}, []);



const updateCase = useCallback((id: string, updates: Partial<Case>) => {

setCases(prev => {

const updated = prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);

storage.set(STORAGE_KEYS.CASES, updated);

return updated;

});

}, []);



const deleteCase = useCallback((id: string) => {

setCases(prev => {

const updated = prev.filter(c => c.id !== id);

storage.set(STORAGE_KEYS.CASES, updated);

return updated;

});

}, []);



// Client functions

const addClient = useCallback((clientData: Omit<Client, 'id' | 'createdAt'>) => {

const newClient: Client = {

...clientData,

id: generateId(),

createdAt: new Date().toISOString(),

};

setClients(prev => {

const updated = [...prev, newClient];

storage.set(STORAGE_KEYS.CLIENTS, updated);

return updated;

});

}, []);



const updateClient = useCallback((id: string, updates: Partial<Client>) => {

setClients(prev => {

const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);

storage.set(STORAGE_KEYS.CLIENTS, updated);

return updated;

});

}, []);



const deleteClient = useCallback((id: string) => {

setClients(prev => {

const updated = prev.filter(c => c.id !== id);

storage.set(STORAGE_KEYS.CLIENTS, updated);

return updated;

});

}, []);



const getClientName = useCallback((id: string): string => {

const client = clients.find(c => c.id === id);

return client?.name || 'Unknown Client';

}, [clients]);



// Billing functions

const addTimeEntry = useCallback((entryData: Omit<TimeEntry, 'id' | 'createdAt' | 'amount'>) => {

const amount = entryData.hours * entryData.rate;

const newEntry: TimeEntry = {

...entryData,

id: generateId(),

amount,

createdAt: new Date().toISOString(),

};

setTimeEntries(prev => {

const updated = [...prev, newEntry];

storage.set(STORAGE_KEYS.TIME_ENTRIES, updated);

return updated;

});

}, []);



const deleteTimeEntry = useCallback((id: string) => {

setTimeEntries(prev => {

const updated = prev.filter(e => e.id !== id);

storage.set(STORAGE_KEYS.TIME_ENTRIES, updated);

return updated;

});

}, []);



const generateInvoice = useCallback((clientId: string) => {

const clientEntries = timeEntries.filter(e => e.clientId === clientId);

const client = clients.find(c => c.id === clientId);


if (!client || clientEntries.length === 0) return;



const total = clientEntries.reduce((sum, e) => sum + e.amount, 0);


const invoice: Invoice = {

id: generateId(),

invoiceNo: `INV-${Date.now()}`,

clientId,

clientName: client.name,

entries: clientEntries,

total,

date: new Date().toISOString(),

status: 'draft',

};



setInvoices(prev => {

const updated = [...prev, invoice];

storage.set(STORAGE_KEYS.INVOICES, updated);

return updated;

});

}, [timeEntries, clients]);



const value: AppContextType = {

isDark,

toggleTheme,

apiKey,

setApiKey,

activeTab,

setActiveTab,

cases,

addCase,

updateCase,

deleteCase,

clients,

addClient,

updateClient,

deleteClient,

getClientName,

timeEntries,

addTimeEntry,

deleteTimeEntry,

invoices,

generateInvoice,

toasts,

showToast,

removeToast,

};



return <AppContext.Provider value={value}>{children}</AppContext.Provider>;

};



// ============================================================

// UI COMPONENTS

// ============================================================



// Button Component

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {

variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';

size?: 'sm' | 'md' | 'lg';

isLoading?: boolean;

leftIcon?: React.ReactNode;

rightIcon?: React.ReactNode;

}



const Button = forwardRef<HTMLButtonElement, ButtonProps>(

({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {

const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';



const variants: Record<string, string> = {

primary: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 focus:ring-emerald-500',

secondary: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-slate-500',

ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-slate-500',

danger: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg shadow-red-500/25 focus:ring-red-500',

outline: 'border-2 border-emerald-500 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 focus:ring-emerald-500',

};



const sizes: Record<string, string> = {

sm: 'px-3 py-1.5 text-sm',

md: 'px-4 py-2.5 text-sm',

lg: 'px-6 py-3 text-base',

};



return (

<button

ref={ref}

className={cn(baseStyles, variants[variant], sizes[size], className)}

disabled={disabled || isLoading}

{...props}

>

{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}

{children}

{!isLoading && rightIcon}

</button>

);

}

);

Button.displayName = 'Button';



// Card Component

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {

variant?: 'default' | 'glass';

hover?: boolean;

}



const Card = forwardRef<HTMLDivElement, CardProps>(

({ className, variant = 'default', hover = false, children, ...props }, ref) => {

const baseStyles = 'rounded-2xl transition-all duration-300 p-6';



const variants: Record<string, string> = {

default: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm',

glass: 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-xl',

};



const hoverStyles = hover ? 'hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 cursor-pointer' : '';



return (

<div ref={ref} className={cn(baseStyles, variants[variant], hoverStyles, className)} {...props}>

{children}

</div>

);

}

);

Card.displayName = 'Card';



// Input Component

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {

label?: string;

error?: string;

leftIcon?: React.ReactNode;

}



const Input = forwardRef<HTMLInputElement, InputProps>(

({ className, label, error, leftIcon, id, ...props }, ref) => {

const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');



return (

<div className="w-full">

{label && (

<label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">

{label}

</label>

)}

<div className="relative">

{leftIcon && (

<div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">

{leftIcon}

</div>

)}

<input

ref={ref}

id={inputId}

className={cn(

'w-full rounded-xl border-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 py-3',

leftIcon ? 'pl-10 pr-4' : 'px-4',

error ? 'border-red-300 dark:border-red-700 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500',

className

)}

{...props}

/>

</div>

{error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}

</div>

);

}

);

Input.displayName = 'Input';



// Textarea Component

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {

label?: string;

error?: string;

}



const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(

({ className, label, error, id, ...props }, ref) => {

const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');



return (

<div className="w-full">

{label && (

<label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">

{label}

</label>

)}

<textarea

ref={ref}

id={inputId}

className={cn(

'w-full rounded-xl border-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all duration-200 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 px-4 py-3',

error ? 'border-red-300 dark:border-red-700 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500',

className

)}

{...props}

/>

{error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}

</div>

);

}

);

Textarea.displayName = 'Textarea';



// Select Component

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {

label?: string;

error?: string;

options: { value: string; label: string }[];

}



const Select = forwardRef<HTMLSelectElement, SelectProps>(

({ className, label, error, options, id, ...props }, ref) => {

const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');



return (

<div className="w-full">

{label && (

<label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">

{label}

</label>

)}

<select

ref={ref}

id={inputId}

className={cn(

'w-full rounded-xl border-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 px-4 py-3',

error ? 'border-red-300 dark:border-red-700 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500',

className

)}

{...props}

>

{options.map((opt) => (

<option key={opt.value} value={opt.value}>

{opt.label}

</option>

))}

</select>

{error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}

</div>

);

}

);

Select.displayName = 'Select';



// Badge Component

interface BadgeProps {

children: React.ReactNode;

variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';

className?: string;

}



const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {

const variants: Record<string, string> = {

default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',

success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',

warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',

danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',

info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',

};



return (

<span className={cn('inline-flex items-center font-medium rounded-full px-2.5 py-0.5 text-xs', variants[variant], className)}>

{children}

</span>

);

};



// Modal Component

interface ModalProps {

isOpen: boolean;

onClose: () => void;

title?: string;

children: React.ReactNode;

size?: 'sm' | 'md' | 'lg' | 'xl';

}



const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {

useEffect(() => {

if (isOpen) {

document.body.style.overflow = 'hidden';

}

return () => {

document.body.style.overflow = '';

};

}, [isOpen]);



useEffect(() => {

const handleEscape = (e: KeyboardEvent) => {

if (e.key === 'Escape') onClose();

};

if (isOpen) {

document.addEventListener('keydown', handleEscape);

}

return () => document.removeEventListener('keydown', handleEscape);

}, [isOpen, onClose]);



if (!isOpen) return null;



const sizes: Record<string, string> = {

sm: 'max-w-md',

md: 'max-w-lg',

lg: 'max-w-2xl',

xl: 'max-w-4xl',

};



return (

<div className="fixed inset-0 z-50 flex items-center justify-center p-4">

<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

<div className={cn('relative w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden', sizes[size])} style={{ animation: 'modalFadeIn 0.2s ease-out' }}>

{title && (

<div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">

<h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>

<Button variant="ghost" size="sm" onClick={onClose} className="p-2 -mr-2">

<X className="w-5 h-5" />

</Button>

</div>

)}

<div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>

</div>

<style>{`

@keyframes modalFadeIn {

from { opacity: 0; transform: scale(0.95); }

to { opacity: 1; transform: scale(1); }

}

`}</style>

</div>

);

};



// Empty State Component

interface EmptyStateProps {

icon: React.ElementType;

title: string;

description: string;

action?: {

label: string;

onClick: () => void;

};

}



const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {

return (

<div className="flex flex-col items-center justify-center py-16 px-4 text-center">

<div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">

<Icon className="w-10 h-10 text-slate-400 dark:text-slate-500" />

</div>

<h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>

<p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">{description}</p>

{action && (

<Button onClick={action.onClick} variant="primary">

{action.label}

</Button>

)}

</div>

);

};



// Toast Container

const ToastContainer: React.FC = () => {

const { toasts, removeToast } = useApp();



const icons: Record<string, React.ReactNode> = {

success: <CheckCircle2 className="w-5 h-5" />,

error: <AlertCircle className="w-5 h-5" />,

warning: <AlertTriangle className="w-5 h-5" />,

info: <Info className="w-5 h-5" />,

};



const variants: Record<string, string> = {

success: 'bg-emerald-500 text-white',

error: 'bg-red-500 text-white',

warning: 'bg-amber-500 text-white',

info: 'bg-blue-500 text-white',

};



return (

<div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">

{toasts.map((toast) => (

<div

key={toast.id}

className={cn('flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[300px] max-w-[400px]', variants[toast.type])}

style={{ animation: 'slideInRight 0.3s ease-out' }}

>

{icons[toast.type]}

<span className="flex-1 text-sm font-medium">{toast.message}</span>

<button onClick={() => removeToast(toast.id)} className="p-1 rounded-lg hover:bg-white/20 transition-colors">

<X className="w-4 h-4" />

</button>

</div>

))}

<style>{`

@keyframes slideInRight {

from { opacity: 0; transform: translateX(100%); }

to { opacity: 1; transform: translateX(0); }

}

`}</style>

</div>

);

};



// ============================================================

// LAYOUT COMPONENTS

// ============================================================



const Header: React.FC = () => {

const { isDark, toggleTheme, cases, clients, timeEntries } = useApp();


const totalBillable = useMemo(() => {

return timeEntries.reduce((sum, e) => sum + e.amount, 0);

}, [timeEntries]);



const stats = [

{ label: 'Active Cases', value: cases.length, color: 'text-emerald-500' },

{ label: 'Clients', value: clients.length, color: 'text-blue-500' },

{ label: 'Billable', value: formatCurrency(totalBillable), color: 'text-purple-500' },

];



return (

<header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800">

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

<div className="flex items-center justify-between h-16 md:h-20">

<div className="flex items-center gap-3">

<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">

<Scale className="w-6 h-6 text-white" />

</div>

<div className="hidden sm:block">

<h1 className="text-xl font-bold text-white flex items-center gap-2">

LexiAssist

<Badge variant="info" className="text-[10px]">

<Sparkles className="w-3 h-3 mr-1" />

Gemini

</Badge>

</h1>

<p className="text-xs text-slate-400">Legal Practice Management</p>

</div>

</div>



<div className="hidden lg:flex items-center gap-8">

{stats.map((stat) => (

<div key={stat.label} className="text-center">

<div className={cn('text-2xl font-bold', stat.color)}>{stat.value}</div>

<div className="text-xs text-slate-500">{stat.label}</div>

</div>

))}

</div>



<Button variant="ghost" size="sm" onClick={toggleTheme} className="text-slate-400 hover:text-white">

{isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}

</Button>

</div>

</div>

</header>

);

};



interface TabConfig {

id: TabId;

label: string;

icon: React.ElementType;

getBadge?: () => number;

}



const NavigationTabs: React.FC = () => {

const { activeTab, setActiveTab, cases, clients } = useApp();



const upcomingHearings = useMemo(() => {

return cases.filter(c => c.nextHearing && c.status === 'active').length;

}, [cases]);



const tabs: TabConfig[] = [

{ id: 'assistant', label: 'AI Assistant', icon: MessageSquare },

{ id: 'research', label: 'Research', icon: Database },

{ id: 'cases', label: 'Cases', icon: FolderOpen, getBadge: () => cases.length },

{ id: 'calendar', label: 'Calendar', icon: Calendar, getBadge: () => upcomingHearings },

{ id: 'templates', label: 'Templates', icon: FileText },

{ id: 'clients', label: 'Clients', icon: Users, getBadge: () => clients.length },

{ id: 'billing', label: 'Billing', icon: DollarSign },

];



return (

<nav className="bg-slate-900 border-b border-slate-800">

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

<div className="flex gap-1 overflow-x-auto py-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

{tabs.map((tab) => {

const Icon = tab.icon;

const badge = tab.getBadge?.();

const isActive = activeTab === tab.id;



return (

<button

key={tab.id}

onClick={() => setActiveTab(tab.id)}

className={cn(

'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 whitespace-nowrap',

isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'

)}

>

<Icon className="w-4 h-4" />

<span className="hidden sm:inline">{tab.label}</span>

{badge !== undefined && badge > 0 && <Badge variant="success">{badge}</Badge>}

</button>

);

})}

</div>

</div>

</nav>

);

};



// ============================================================

// API KEY SETUP COMPONENT

// ============================================================



const APIKeySetup: React.FC = () => {

const { apiKey, setApiKey, showToast } = useApp();

const [inputKey, setInputKey] = useState(apiKey);

const [showKey, setShowKey] = useState(false);



const handleSave = () => {

if (!inputKey.trim()) {

showToast('warning', 'Please enter your Gemini API key');

return;

}

setApiKey(inputKey.trim());

showToast('success', 'API key saved successfully');

};



return (

<Card variant="glass" className="mb-6">

<div className="flex items-start gap-4">

<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">

<Zap className="w-6 h-6 text-white" />

</div>

<div className="flex-1">

<h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Gemini API Configuration</h3>

<p className="text-sm text-slate-500 dark:text-slate-400 mb-4">

Enter your Google Gemini API key to power the AI assistant. Get your key from{' '}

<a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">

Google AI Studio

</a>

</p>

<div className="flex gap-3">

<div className="flex-1 relative">

<Input

type={showKey ? 'text' : 'password'}

value={inputKey}

onChange={(e) => setInputKey(e.target.value)}

placeholder="Enter your Gemini API key..."

className="pr-20"

/>

<button

onClick={() => setShowKey(!showKey)}

className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"

>

{showKey ? 'Hide' : 'Show'}

</button>

</div>

<Button onClick={handleSave} leftIcon={<CheckCircle2 className="w-4 h-4" />}>

Save Key

</Button>

</div>

{apiKey && (

<p className="text-sm text-emerald-500 mt-2 flex items-center gap-2">

<CheckCircle2 className="w-4 h-4" />

API key is configured

</p>

)}

</div>

</div>

</Card>

);

};



// ============================================================

// FEATURE COMPONENTS

// ============================================================



// AI Assistant

const AIAssistant: React.FC = () => {

const { showToast, setActiveTab, apiKey } = useApp();

const [taskType, setTaskType] = useState('');

const [userInput, setUserInput] = useState('');

const [output, setOutput] = useState('');

const [isLoading, setIsLoading] = useState(false);

const [error, setError] = useState('');



const handleSubmit = async () => {

if (!apiKey) {

showToast('warning', 'Please configure your Gemini API key first');

return;

}



if (!userInput.trim()) {

showToast('warning', 'Please enter your legal query or task');

return;

}



setIsLoading(true);

setError('');

setOutput('');



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



Task Type: ${taskType || 'General Query'}



User Request:

${userInput}`;



try {

const response = await callGeminiAPI(systemPrompt, apiKey);

setOutput(response);

showToast('success', 'Response generated successfully');

} catch (err) {

const message = err instanceof Error ? err.message : 'Unknown error occurred';

setError(message);

showToast('error', message);

} finally {

setIsLoading(false);

}

};



const exportAsText = () => {

if (!output) {

showToast('warning', 'No content to export');

return;

}

const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });

const url = URL.createObjectURL(blob);

const a = document.createElement('a');

a.href = url;

a.download = `LexiAssist_Document_${new Date().toISOString().slice(0, 10)}.txt`;

a.click();

URL.revokeObjectURL(url);

showToast('success', 'Document exported successfully');

};



const exportAsHTML = () => {

if (!output) {

showToast('warning', 'No content to export');

return;

}

const htmlContent = `<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>LexiAssist Legal Document</title>

<style>

body { font-family: Georgia, serif; line-height: 1.8; max-width: 800px; margin: 40px auto; padding: 20px; color: #1e293b; }

h1 { color: #0f172a; border-bottom: 3px solid #10b981; padding-bottom: 12px; }

.content { white-space: pre-wrap; margin: 24px 0; }

.disclaimer { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-top: 32px; font-size: 14px; }

.footer { text-align: center; margin-top: 32px; color: #64748b; font-size: 12px; }

</style>

</head>

<body>

<h1>LexiAssist Legal Document</h1>

<div class="content">${output.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>

<div class="disclaimer">

<strong>⚖️ Professional Disclaimer:</strong> This document is generated for informational purposes only and does not constitute legal advice.

</div>

<div class="footer">

<p>Generated on ${new Date().toLocaleString()}</p>

<p>LexiAssist - AI-Powered Legal Practice Management (Powered by Google Gemini)</p>

</div>

</body>

</html>`;

const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });

const url = URL.createObjectURL(blob);

const a = document.createElement('a');

a.href = url;

a.download = `LexiAssist_Document_${new Date().toISOString().slice(0, 10)}.html`;

a.click();

URL.revokeObjectURL(url);

showToast('success', 'HTML document exported successfully');

};



return (

<div className="space-y-8">

{/* API Key Setup */}

<APIKeySetup />



{/* Task Type Selection */}

<div className="space-y-4">

<h2 className="text-lg font-semibold text-slate-900 dark:text-white">Select Task Type</h2>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

{TASK_TYPES.map((type) => {

const Icon = type.icon;

const isSelected = taskType === type.id;

return (

<button key={type.id} onClick={() => setTaskType(type.id)} className="text-left w-full">

<Card

variant={isSelected ? 'glass' : 'default'}

className={cn(

'transition-all duration-200',

isSelected ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900' : 'hover:border-emerald-300 dark:hover:border-emerald-700'

)}

>

<div className="flex items-start gap-4">

<div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400')}>

<Icon className="w-6 h-6" />

</div>

<div>

<h3 className="font-semibold text-slate-900 dark:text-white">{type.label}</h3>

<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{type.description}</p>

</div>

</div>

</Card>

</button>

);

})}

</div>

</div>



{/* Input Section */}

<Card variant="glass">

<div className="flex items-center justify-between mb-4">

<h3 className="text-lg font-semibold text-slate-900 dark:text-white">Describe Your Legal Task or Query</h3>

<Button variant="ghost" size="sm" onClick={() => setActiveTab('templates')} leftIcon={<FileText className="w-4 h-4" />}>

Use Template

</Button>

</div>

<Textarea

value={userInput}

onChange={(e) => setUserInput(e.target.value)}

placeholder="Example: Draft a lease agreement for commercial property in Lagos with 2-year term and rent review clause..."

rows={6}

className="mb-4"

/>

<Button

onClick={handleSubmit}

isLoading={isLoading}

leftIcon={<Sparkles className="w-5 h-5" />}

className="w-full"

size="lg"

disabled={!apiKey}

>

{apiKey ? 'Generate Legal Response' : 'Configure API Key First'}

</Button>

</Card>



{/* Error Display */}

{error && (

<Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">

<div className="flex items-start gap-3">

<AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />

<p className="text-red-600 dark:text-red-400">{error}</p>

</div>

</Card>

)}



{/* Output Display */}

{output && (

<Card variant="glass">

<div className="flex items-center justify-between mb-4">

<div className="flex items-center gap-3">

<div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">

<FileText className="w-5 h-5 text-emerald-500" />

</div>

<h3 className="text-lg font-semibold text-slate-900 dark:text-white">LexiAssist Response</h3>

</div>

<div className="flex gap-2">

<Button variant="secondary" size="sm" onClick={exportAsText} leftIcon={<Download className="w-4 h-4" />}>

TXT

</Button>

<Button variant="outline" size="sm" onClick={exportAsHTML} leftIcon={<Download className="w-4 h-4" />}>

HTML

</Button>

</div>

</div>

<div className="prose prose-slate dark:prose-invert max-w-none">

<div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">{output}</div>

</div>

<div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">

<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">

<p className="text-sm text-amber-800 dark:text-amber-200">

<strong>⚖️ Professional Disclaimer:</strong> This response is for informational purposes only and does not constitute legal advice.

</p>

</div>

</div>

</Card>

)}

</div>

);

};



// Legal Research

const LegalResearch: React.FC = () => {

const { showToast, apiKey } = useApp();

const [query, setQuery] = useState('');

const [results, setResults] = useState('');

const [isLoading, setIsLoading] = useState(false);



const handleSearch = async () => {

if (!apiKey) {

showToast('warning', 'Please configure your Gemini API key in the AI Assistant tab');

return;

}



if (!query.trim()) {

showToast('warning', 'Please enter a research query');

return;

}



setIsLoading(true);

setResults('');



const researchPrompt = `You are LexiAssist conducting legal research for Nigerian lawyers.



Research Query: ${query}



Please provide comprehensive legal research including:



1. RELEVANT NIGERIAN STATUTES AND PROVISIONS

- List applicable laws, acts, and their specific sections

- Include any relevant regulations or subsidiary legislation



2. KEY CASE LAW

- Cite relevant Nigerian court decisions

- Include case names, citations, and key holdings

- Note if cases are from Supreme Court, Court of Appeal, or High Court



3. LEGAL PRINCIPLES INVOLVED

- Explain the fundamental legal principles at play

- Discuss how these principles apply to the query



4. PRACTICAL GUIDANCE FOR NIGERIAN LEGAL PRACTICE

- Procedural considerations

- Court requirements

- Time limitations

- Practical tips for handling such matters



5. ADDITIONAL CONSIDERATIONS

- Any recent developments in this area of law

- Potential challenges or pitfalls

- Alternative approaches if applicable



Format your response with clear headings and subheadings. If you are uncertain about specific case names or statute numbers, clearly state this and provide general guidance instead.`;



try {

const response = await callGeminiAPI(researchPrompt, apiKey);

setResults(response);

showToast('success', 'Research completed');

} catch (err) {

const message = err instanceof Error ? err.message : 'Research failed';

showToast('error', message);

} finally {

setIsLoading(false);

}

};



return (

<div className="space-y-6">

<div className="flex items-center gap-3">

<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">

<Database className="w-6 h-6 text-white" />

</div>

<div>

<h1 className="text-2xl font-bold text-slate-900 dark:text-white">Legal Research</h1>

<p className="text-slate-500 dark:text-slate-400">AI-powered Nigerian legal research</p>

</div>

</div>



<Card variant="glass">

<div className="flex gap-3">

<Input

value={query}

onChange={(e) => setQuery(e.target.value)}

onKeyDown={(e) => e.key === 'Enter' && handleSearch()}

placeholder="E.g., 'breach of contract remedies Nigeria' or 'landlord tenant rights Lagos'"

className="flex-1"

leftIcon={<Search className="w-5 h-5" />}

/>

<Button onClick={handleSearch} isLoading={isLoading} leftIcon={<Search className="w-5 h-5" />} disabled={!apiKey}>

Research

</Button>

</div>

{!apiKey && (

<p className="text-sm text-amber-600 dark:text-amber-400 mt-3">

⚠️ Please configure your Gemini API key in the AI Assistant tab first.

</p>

)}

</Card>



{results && (

<Card variant="glass">

<div className="flex items-center justify-between mb-4">

<h3 className="text-lg font-semibold text-slate-900 dark:text-white">Research Results</h3>

<Button

variant="secondary"

size="sm"

onClick={() => {

const blob = new Blob([results], { type: 'text/plain' });

const url = URL.createObjectURL(blob);

const a = document.createElement('a');

a.href = url;

a.download = `Research_${Date.now()}.txt`;

a.click();

URL.revokeObjectURL(url);

showToast('success', 'Research exported');

}}

leftIcon={<Download className="w-4 h-4" />}

>

Export

</Button>

</div>

<div className="prose prose-slate dark:prose-invert max-w-none">

<div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">{results}</div>

</div>

</Card>

)}

</div>

);

};



// Case Management

const CaseManagement: React.FC = () => {

const { cases, addCase, updateCase, deleteCase, clients, getClientName, showToast } = useApp();

const [showModal, setShowModal] = useState(false);

const [filterStatus, setFilterStatus] = useState<CaseStatus | 'all'>('all');

const [formData, setFormData] = useState({

title: '',

suitNo: '',

court: '',

nextHearing: '',

status: 'active' as CaseStatus,

notes: '',

clientId: '',

});

const [errors, setErrors] = useState<Record<string, string>>({});



const filteredCases = useMemo(() => {

if (filterStatus === 'all') return cases;

return cases.filter(c => c.status === filterStatus);

}, [cases, filterStatus]);



const handleSubmit = () => {

const newErrors: Record<string, string> = {};

if (!formData.title.trim()) newErrors.title = 'Case title is required';

if (!formData.suitNo.trim()) newErrors.suitNo = 'Suit number is required';



if (Object.keys(newErrors).length > 0) {

setErrors(newErrors);

return;

}



addCase(formData);

showToast('success', 'Case added successfully');

setShowModal(false);

setFormData({ title: '', suitNo: '', court: '', nextHearing: '', status: 'active', notes: '', clientId: '' });

setErrors({});

};



const handleDelete = (id: string) => {

if (window.confirm('Are you sure you want to delete this case?')) {

deleteCase(id);

showToast('success', 'Case deleted');

}

};



const statusOptions = [

{ value: 'active', label: 'Active' },

{ value: 'pending', label: 'Pending' },

{ value: 'completed', label: 'Completed' },

{ value: 'archived', label: 'Archived' },

];



const clientOptions = [

{ value: '', label: 'Select Client (Optional)' },

...clients.map(c => ({ value: c.id, label: c.name })),

];



return (

<div className="space-y-6">

<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

<div className="flex items-center gap-3">

<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">

<FolderOpen className="w-6 h-6 text-white" />

</div>

<div>

<h1 className="text-2xl font-bold text-slate-900 dark:text-white">Case Management</h1>

<p className="text-slate-500 dark:text-slate-400">{cases.length} total cases</p>

</div>

</div>

<Button onClick={() => setShowModal(true)} leftIcon={<Plus className="w-5 h-5" />}>

Add Case

</Button>

</div>



{/* Filters */}

<Card variant="glass" className="p-4">

<div className="flex items-center gap-3 flex-wrap">

<Filter className="w-5 h-5 text-slate-500" />

<span className="text-sm font-medium text-slate-600 dark:text-slate-400">Filter:</span>

<div className="flex gap-2 flex-wrap">

{['all', ...CASE_STATUSES].map((status) => (

<button

key={status}

onClick={() => setFilterStatus(status as CaseStatus | 'all')}

className={cn(

'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',

filterStatus === status

? 'bg-emerald-500 text-white'

: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'

)}

>

{status}

</button>

))}

</div>

</div>

</Card>



{/* Case List */}

{filteredCases.length > 0 ? (

<div className="grid gap-4">

{filteredCases.map((caseItem) => (

<Card key={caseItem.id} variant="glass" hover>

<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

<div className="flex-1 space-y-3">

<div className="flex flex-wrap items-center gap-3">

<h3 className="text-lg font-semibold text-slate-900 dark:text-white">{caseItem.title}</h3>

<select

value={caseItem.status}

onChange={(e) => updateCase(caseItem.id, { status: e.target.value as CaseStatus })}

className={cn(

'px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer',

caseItem.status === 'active' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',

caseItem.status === 'pending' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',

caseItem.status === 'completed' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',

caseItem.status === 'archived' && 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'

)}

>

{statusOptions.map((opt) => (

<option key={opt.value} value={opt.value}>{opt.label}</option>

))}

</select>

</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">

<div><span className="font-medium">Suit No:</span> {caseItem.suitNo}</div>

{caseItem.court && (

<div className="flex items-center gap-2">

<Building2 className="w-4 h-4" />

{caseItem.court}

</div>

)}

{caseItem.clientId && (

<div><span className="font-medium">Client:</span> {getClientName(caseItem.clientId)}</div>

)}

{caseItem.nextHearing && (

<div className="flex items-center gap-2">

<Calendar className="w-4 h-4" />

<span>{formatDate(caseItem.nextHearing)} ({formatRelativeDate(caseItem.nextHearing)})</span>

</div>

)}

</div>

{caseItem.notes && (

<p className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">

{caseItem.notes}

</p>

)}

</div>

<Button

variant="ghost"

size="sm"

onClick={() => handleDelete(caseItem.id)}

className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"

>

<Trash2 className="w-5 h-5" />

</Button>

</div>

</Card>

))}

</div>

) : (

<EmptyState

icon={FolderOpen}

title="No Cases Found"

description="Start tracking your cases by adding your first case."

action={{ label: 'Add Case', onClick: () => setShowModal(true) }}

/>

)}



{/* Add Case Modal */}

<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Case" size="lg">

<div className="space-y-6">

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

<Input

label="Case Title *"

value={formData.title}

onChange={(e) => setFormData({ ...formData, title: e.target.value })}

placeholder="E.g., John Doe v. State"

error={errors.title}

/>

<Input

label="Suit Number *"

value={formData.suitNo}

onChange={(e) => setFormData({ ...formData, suitNo: e.target.value })}

placeholder="E.g., FHC/L/CS/123/2024"

error={errors.suitNo}

/>

<Input

label="Court"

value={formData.court}

onChange={(e) => setFormData({ ...formData, court: e.target.value })}

placeholder="E.g., Federal High Court, Lagos"

/>

<Input

label="Next Hearing Date"

type="date"

value={formData.nextHearing}

onChange={(e) => setFormData({ ...formData, nextHearing: e.target.value })}

/>

<Select

label="Client"

value={formData.clientId}

onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}

options={clientOptions}

/>

<Select

label="Status"

value={formData.status}

onChange={(e) => setFormData({ ...formData, status: e.target.value as CaseStatus })}

options={statusOptions}

/>

</div>

<Textarea

label="Notes"

value={formData.notes}

onChange={(e) => setFormData({ ...formData, notes: e.target.value })}

placeholder="Additional case notes..."

rows={4}

/>

<div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">

<Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>

<Button onClick={handleSubmit}>Save Case</Button>

</div>

</div>

</Modal>

</div>

);

};



// Calendar View

const CalendarView: React.FC = () => {

const { cases } = useApp();



const upcomingHearings = useMemo(() => {

return cases

.filter(c => c.nextHearing && c.status === 'active')

.map(c => ({

caseId: c.id,

caseTitle: c.title,

date: c.nextHearing,

court: c.court,

suitNo: c.suitNo,

}))

.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

.slice(0, 10);

}, [cases]);



return (

<div className="space-y-6">

<div className="flex items-center gap-3">

<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">

<Calendar className="w-6 h-6 text-white" />

</div>

<div>

<h1 className="text-2xl font-bold text-slate-900 dark:text-white">Court Calendar</h1>

<p className="text-slate-500 dark:text-slate-400">Upcoming hearings & reminders</p>

</div>

</div>



<Card variant="glass">

<h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Upcoming Hearings</h3>

{upcomingHearings.length > 0 ? (

<div className="space-y-3">

{upcomingHearings.map((hearing, idx) => {

const hearingDate = new Date(hearing.date);

const today = new Date();

const daysUntil = Math.ceil((hearingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));



return (

<div

key={idx}

className={cn(

'p-4 rounded-xl border-2',

daysUntil <= 3 && 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20',

daysUntil > 3 && daysUntil <= 7 && 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20',

daysUntil > 7 && 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'

)}

>

<div className="flex items-start justify-between">

<div className="flex-1">

<h4 className="font-semibold text-slate-900 dark:text-white">{hearing.caseTitle}</h4>

<p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Suit No: {hearing.suitNo}</p>

{hearing.court && <p className="text-sm text-slate-600 dark:text-slate-400">Court: {hearing.court}</p>}

<div className="flex items-center gap-2 mt-2">

<Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />

<span className="text-sm font-medium text-slate-700 dark:text-slate-300">

{formatDate(hearing.date)}

</span>

</div>

</div>

<Badge

variant={daysUntil <= 3 ? 'danger' : daysUntil <= 7 ? 'warning' : 'default'}

className="text-xs font-bold"

>

{formatRelativeDate(hearing.date)}

</Badge>

</div>

</div>

);

})}

</div>

) : (

<EmptyState

icon={Calendar}

title="No Upcoming Hearings"

description="Add hearing dates to your cases to see them here."

/>

)}

</Card>

</div>

);

};



// Template Library

const TemplateLibrary: React.FC = () => {

const { setActiveTab, showToast } = useApp();

const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);



const useTemplate = (template: Template) => {

showToast('success', 'Template loaded! Go to AI Assistant to customize it.');

setActiveTab('assistant');

};



return (

<div className="space-y-6">

<div className="flex items-center gap-3">

<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">

<FileText className="w-6 h-6 text-white" />

</div>

<div>

<h1 className="text-2xl font-bold text-slate-900 dark:text-white">Document Templates</h1>

<p className="text-slate-500 dark:text-slate-400">Legal document templates library</p>

</div>

</div>



<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

{DEFAULT_TEMPLATES.map((template) => (

<Card key={template.id} variant="glass" hover>

<div className="flex items-start justify-between mb-3">

<div>

<h3 className="font-semibold text-slate-900 dark:text-white mb-1">{template.name}</h3>

<Badge variant="success">{template.category}</Badge>

</div>

<FileText className="w-6 h-6 text-slate-400" />

</div>

<p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">

{template.content.substring(0, 100)}...

</p>

<div className="flex gap-2">

<Button

variant="primary"

size="sm"

className="flex-1"

onClick={() => useTemplate(template)}

leftIcon={<Copy className="w-4 h-4" />}

>

Use

</Button>

<Button

variant="secondary"

size="sm"

onClick={() => setPreviewTemplate(template)}

leftIcon={<Eye className="w-4 h-4" />}

>

Preview

</Button>

</div>

</Card>

))}

</div>



{/* Preview Modal */}

<Modal

isOpen={!!previewTemplate}

onClose={() => setPreviewTemplate(null)}

title={previewTemplate?.name}

size="lg"

>

{previewTemplate && (

<div className="space-y-4">

<Badge variant="success">{previewTemplate.category}</Badge>

<pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-mono">

{previewTemplate.content}

</pre>

<div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">

<Button variant="secondary" onClick={() => setPreviewTemplate(null)}>Close</Button>

<Button onClick={() => { useTemplate(previewTemplate); setPreviewTemplate(null); }}>

Use Template

</Button>

</div>

</div>

)}

</Modal>

</div>

);

};



// Client Management

const ClientManagement: React.FC = () => {

const { clients, addClient, deleteClient, cases, timeEntries, generateInvoice, showToast } = useApp();

const [showModal, setShowModal] = useState(false);

const [formData, setFormData] = useState({

name: '',

email: '',

phone: '',

address: '',

type: 'individual' as ClientType,

notes: '',

});

const [errors, setErrors] = useState<Record<string, string>>({});



const handleSubmit = () => {

const newErrors: Record<string, string> = {};

if (!formData.name.trim()) newErrors.name = 'Client name is required';



if (Object.keys(newErrors).length > 0) {

setErrors(newErrors);

return;

}



addClient(formData);

showToast('success', 'Client added successfully');

setShowModal(false);

setFormData({ name: '', email: '', phone: '', address: '', type: 'individual', notes: '' });

setErrors({});

};



const handleDelete = (id: string) => {

const clientCases = cases.filter(c => c.clientId === id);

if (clientCases.length > 0) {

if (!window.confirm(`This client has ${clientCases.length} case(s). Delete anyway?`)) return;

}

if (window.confirm('Are you sure you want to delete this client?')) {

deleteClient(id);

showToast('success', 'Client deleted');

}

};



const getClientBillable = (clientId: string) => {

return timeEntries.filter(e => e.clientId === clientId).reduce((sum, e) => sum + e.amount, 0);

};



const getClientCaseCount = (clientId: string) => {

return cases.filter(c => c.clientId === clientId).length;

};



const typeOptions = [

{ value: 'individual', label: 'Individual' },

{ value: 'corporate', label: 'Corporate' },

{ value: 'government', label: 'Government' },

];



return (

<div className="space-y-6">

<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

<div className="flex items-center gap-3">

<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">

<Users className="w-6 h-6 text-white" />

</div>

<div>

<h1 className="text-2xl font-bold text-slate-900 dark:text-white">Client Management</h1>

<p className="text-slate-500 dark:text-slate-400">{clients.length} total clients</p>

</div>

</div>

<Button onClick={() => setShowModal(true)} leftIcon={<Plus className="w-5 h-5" />}>

Add Client

</Button>

</div>



{clients.length > 0 ? (

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

{clients.map((client) => {

const caseCount = getClientCaseCount(client.id);

const billable = getClientBillable(client.id);



return (

<Card key={client.id} variant="glass" hover>

<div className="flex items-start justify-between mb-3">

<div className="flex-1">

<h3 className="text-lg font-semibold text-slate-900 dark:text-white">{client.name}</h3>

<Badge variant="info" className="mt-1">{client.type}</Badge>

</div>

<Button

variant="ghost"

size="sm"

onClick={() => handleDelete(client.id)}

className="text-red-500 hover:text-red-600"

>

<Trash2 className="w-5 h-5" />

</Button>

</div>



<div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">

{client.email && (

<div className="flex items-center gap-2">

<Mail className="w-4 h-4" />

{client.email}

</div>

)}

{client.phone && (

<div className="flex items-center gap-2">

<Phone className="w-4 h-4" />

{client.phone}

</div>

)}

{client.address && (

<div className="flex items-center gap-2">

<MapPin className="w-4 h-4" />

{client.address}

</div>

)}

</div>



<div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">

<div className="grid grid-cols-2 gap-4 text-center">

<div>

<div className="text-2xl font-bold text-emerald-600">{caseCount}</div>

<div className="text-xs text-slate-600 dark:text-slate-400">Cases</div>

</div>

<div>

<div className="text-2xl font-bold text-purple-600">{formatCurrency(billable)}</div>

<div className="text-xs text-slate-600 dark:text-slate-400">Billable</div>

</div>

</div>

</div>



{billable > 0 && (

<Button

variant="outline"

size="sm"

className="w-full mt-3"

onClick={() => {

generateInvoice(client.id);

showToast('success', 'Invoice generated');

}}

leftIcon={<Receipt className="w-4 h-4" />}

>

Generate Invoice

</Button>

)}

</Card>

);

})}

</div>

) : (

<EmptyState

icon={Users}

title="No Clients Yet"

description="Start managing your clients by adding your first client."

action={{ label: 'Add Client', onClick: () => setShowModal(true) }}

/>

)}



{/* Add Client Modal */}

<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Client" size="lg">

<div className="space-y-6">

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

<Input

label="Client Name *"

value={formData.name}

onChange={(e) => setFormData({ ...formData, name: e.target.value })}

placeholder="Full Name or Company"

error={errors.name}

/>

<Input

label="Email"

type="email"

value={formData.email}

onChange={(e) => setFormData({ ...formData, email: e.target.value })}

placeholder="email@example.com"

/>

<Input

label="Phone"

value={formData.phone}

onChange={(e) => setFormData({ ...formData, phone: e.target.value })}

placeholder="+234 xxx xxx xxxx"

/>

<Select

label="Client Type"

value={formData.type}

onChange={(e) => setFormData({ ...formData, type: e.target.value as ClientType })}

options={typeOptions}

/>

</div>

<Input

label="Address"

value={formData.address}

onChange={(e) => setFormData({ ...formData, address: e.target.value })}

placeholder="Physical Address"

/>

<Textarea

label="Notes"

value={formData.notes}

onChange={(e) => setFormData({ ...formData, notes: e.target.value })}

placeholder="Additional information..."

rows={3}

/>

<div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">

<Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>

<Button onClick={handleSubmit}>Save Client</Button>

</div>

</div>

</Modal>

</div>

);

};



// Billing Dashboard

const BillingDashboard: React.FC = () => {

const { clients, cases, timeEntries, addTimeEntry, deleteTimeEntry, invoices, getClientName, showToast } = useApp();

const [showModal, setShowModal] = useState(false);

const [formData, setFormData] = useState({

clientId: '',

caseId: '',

description: '',

hours: '',

rate: '50000',

date: new Date().toISOString().split('T')[0],

});

const [errors, setErrors] = useState<Record<string, string>>({});



const totalBillable = useMemo(() => timeEntries.reduce((sum, e) => sum + e.amount, 0), [timeEntries]);

const totalHours = useMemo(() => timeEntries.reduce((sum, e) => sum + e.hours, 0), [timeEntries]);



const handleSubmit = () => {

const newErrors: Record<string, string> = {};

if (!formData.clientId) newErrors.clientId = 'Please select a client';

if (!formData.description.trim()) newErrors.description = 'Description is required';

if (!formData.hours || parseFloat(formData.hours) <= 0) newErrors.hours = 'Valid hours required';

if (!formData.rate || parseFloat(formData.rate) <= 0) newErrors.rate = 'Valid rate required';



if (Object.keys(newErrors).length > 0) {

setErrors(newErrors);

return;

}



addTimeEntry({

clientId: formData.clientId,

caseId: formData.caseId,

description: formData.description,

hours: parseFloat(formData.hours),

rate: parseFloat(formData.rate),

date: formData.date,

});



showToast('success', 'Time entry logged');

setShowModal(false);

setFormData({ clientId: '', caseId: '', description: '', hours: '', rate: '50000', date: new Date().toISOString().split('T')[0] });

setErrors({});

};



const clientOptions = [

{ value: '', label: 'Select Client' },

...clients.map(c => ({ value: c.id, label: c.name })),

];



const caseOptions = [

{ value: '', label: 'Select Case (Optional)' },

...cases.map(c => ({ value: c.id, label: c.title })),

];



return (

<div className="space-y-6">

<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

<div className="flex items-center gap-3">

<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">

<DollarSign className="w-6 h-6 text-white" />

</div>

<div>

<h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing & Time Tracking</h1>

<p className="text-slate-500 dark:text-slate-400">Manage your billable hours</p>

</div>

</div>

<Button onClick={() => setShowModal(true)} leftIcon={<Plus className="w-5 h-5" />}>

Log Time

</Button>

</div>



{/* Summary Cards */}

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

<Card className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-0">

<div className="flex items-center justify-between mb-2">

<h3 className="text-sm font-medium opacity-90">Total Billable</h3>

<DollarSign className="w-6 h-6 opacity-75" />

</div>

<div className="text-3xl font-bold">{formatCurrency(totalBillable)}</div>

<p className="text-sm opacity-75 mt-1">{timeEntries.length} time entries</p>

</Card>



<Card className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white border-0">

<div className="flex items-center justify-between mb-2">

<h3 className="text-sm font-medium opacity-90">Total Hours</h3>

<Clock className="w-6 h-6 opacity-75" />

</div>

<div className="text-3xl font-bold">{totalHours.toFixed(1)}</div>

<p className="text-sm opacity-75 mt-1">Hours logged</p>

</Card>



<Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">

<div className="flex items-center justify-between mb-2">

<h3 className="text-sm font-medium opacity-90">Invoices</h3>

<Receipt className="w-6 h-6 opacity-75" />

</div>

<div className="text-3xl font-bold">{invoices.length}</div>

<p className="text-sm opacity-75 mt-1">Generated invoices</p>

</Card>

</div>



{/* Time Entries Table */}

<Card variant="glass">

<h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Time Entries</h3>

{timeEntries.length > 0 ? (

<div className="overflow-x-auto">

<table className="w-full">

<thead className="bg-slate-50 dark:bg-slate-800">

<tr>

<th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Date</th>

<th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Client</th>

<th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Description</th>

<th className="px-4 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Hours</th>

<th className="px-4 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Amount</th>

<th className="px-4 py-3 text-center text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Action</th>

</tr>

</thead>

<tbody className="divide-y divide-slate-200 dark:divide-slate-700">

{timeEntries.slice().reverse().map((entry) => (

<tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">

<td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">

{formatDate(entry.date)}

</td>

<td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">

{getClientName(entry.clientId)}

</td>

<td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">

{entry.description.length > 50 ? entry.description.substring(0, 50) + '...' : entry.description}

</td>

<td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 text-right">

{entry.hours}h

</td>

<td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white text-right">

{formatCurrency(entry.amount)}

</td>

<td className="px-4 py-3 text-center">

<Button

variant="ghost"

size="sm"

onClick={() => {

if (window.confirm('Delete this time entry?')) {

deleteTimeEntry(entry.id);

showToast('success', 'Time entry deleted');

}

}}

className="text-red-500 hover:text-red-600"

>

<Trash2 className="w-4 h-4" />

</Button>

</td>

</tr>

))}

</tbody>

</table>

</div>

) : (

<EmptyState

icon={Clock}

title="No Time Entries Yet"

description="Start logging your billable hours."

action={{ label: 'Log Time', onClick: () => setShowModal(true) }}

/>

)}

</Card>



{/* Add Time Entry Modal */}

<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Log Time Entry" size="lg">

<div className="space-y-6">

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

<Select

label="Client *"

value={formData.clientId}

onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}

options={clientOptions}

error={errors.clientId}

/>

<Select

label="Case (Optional)"

value={formData.caseId}

onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}

options={caseOptions}

/>

<Input

label="Date *"

type="date"

value={formData.date}

onChange={(e) => setFormData({ ...formData, date: e.target.value })}

/>

<Input

label="Hours *"

type="number"

step="0.25"

value={formData.hours}

onChange={(e) => setFormData({ ...formData, hours: e.target.value })}

placeholder="e.g., 2.5"

error={errors.hours}

/>

<Input

label="Hourly Rate (₦) *"

type="number"

value={formData.rate}

onChange={(e) => setFormData({ ...formData, rate: e.target.value })}

placeholder="50000"

error={errors.rate}

/>

<div>

<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Total Amount</label>

<div className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold">

{formatCurrency((parseFloat(formData.hours) || 0) * (parseFloat(formData.rate) || 0))}

</div>

</div>

</div>

<Textarea

label="Description *"

value={formData.description}

onChange={(e) => setFormData({ ...formData, description: e.target.value })}

placeholder="Describe the work performed..."

rows={3}

error={errors.description}

/>

<div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">

<Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>

<Button onClick={handleSubmit}>Save Entry</Button>

</div>

</div>

</Modal>

</div>

);

};



// ============================================================

// MAIN APP COMPONENT

// ============================================================



const AppContent: React.FC = () => {

const { activeTab } = useApp();



const renderContent = () => {

switch (activeTab) {

case 'assistant':

return <AIAssistant />;

case 'research':

return <LegalResearch />;

case 'cases':

return <CaseManagement />;

case 'calendar':

return <CalendarView />;

case 'templates':

return <TemplateLibrary />;

case 'clients':

return <ClientManagement />;

case 'billing':

return <BillingDashboard />;

default:

return <AIAssistant />;

}

};



return (

<div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

<Header />

<NavigationTabs />

<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

{renderContent()}

</main>

<ToastContainer />

</div>

);

};



const LexiAssist: React.FC = () => {

return (

<AppProvider>

<AppContent />

</AppProvider>

);

};



export default LexiAssist;



