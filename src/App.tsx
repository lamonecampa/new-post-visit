/**
 * Service Report Pro - Advanced Field Visit & Post-Visit Template Generator.
 * Highly polished client-side web application designed to fill, visualize, 
 * and export technical reports matching official document standards.
 * @license Apache-2.0
 */

import React, { useState, useRef, useEffect, FormEvent, ChangeEvent, DragEvent } from 'react';
import { 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  FileCheck, 
  UploadCloud, 
  X, 
  RotateCcw, 
  Sparkles, 
  Download, 
  Plus, 
  Trash2, 
  Star, 
  Info,
  Check,
  ChevronDown,
  ChevronUp,
  FileCode,
  Video,
  Eye,
  CheckCircle2,
  FileSignature
} from 'lucide-react';
import { VisitDetails, ChecklistItem, AppendixItem, ChecklistValue } from './types';
import { exportToDocx } from './utils/docxExport';
import { exportToPdf } from './utils/pdfExport';

// Newly generated mock screenshots for the Corteva Malang template
const configImage = '/src/assets/images/system_config_migration_1781169014155.png';
const onedriveImage = '/src/assets/images/onedrive_login_screen_1781169032874.png';

// Preset tasks for Corteva Malang (Post-Visit Template) matches screenshots 100%
const defaultCortevaTasks: ChecklistItem[] = [
  { id: 'c1', task: 'Is the issue resolved ?', value: 'Yes', specifyDetails: '' },
  { id: 'c2', task: 'Is revisit required ?', value: 'No', specifyDetails: '' },
  { id: 'c3', task: 'Did customer test after providing resolution?', value: 'Yes', specifyDetails: '' },
  { id: 'c4', task: 'Did engineer replace any part ?', value: 'No', specifyDetails: '' },
  { id: 'c5', task: 'Is Customer satisfied with the service provided ?', value: 'Yes', specifyDetails: '' },
];

// Alternate template preset for PT Bank Central Asia Tbk
const defaultBcaTasks: ChecklistItem[] = [
  { id: 'b1', task: 'Validasi konektivitas jaringan terminal & kekuatan sinyal utama', value: 'Yes', specifyDetails: '' },
  { id: 'b2', task: 'Penggantian kabel patch fiber sfp / kabel UTP yang rusak', value: 'No', specifyDetails: 'Kabel patch fiber normal' },
  { id: 'b3', task: 'Pemeriksaan stabilitas voltase power supply & backup UPS', value: 'Yes', specifyDetails: '' },
  { id: 'b4', task: 'Upgrade firmware sistem router & upload backup konfigurasi', value: 'No', specifyDetails: 'Firmware sudah versi terbaru' },
  { id: 'b5', task: 'Serah terima pekerjaan / briefing akhir & konfirmasi user', value: 'Yes', specifyDetails: '' },
];

export default function App() {
  // Configured active template selector state ('corteva' | 'bca' | 'custom')
  const [activePreset, setActivePreset] = useState<'corteva' | 'bca'>('corteva');

  // Accordion expansion states for sidebar controls
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    questionnaire: true,
    writeups: true,
    signoff: true,
    appendix: true,
  });

  // State for Visit Details (Customer Name, Ticket Numbers, Date of Visit, Times)
  const [details, setDetails] = useState<VisitDetails>({
    customerName: 'Corteva Malang, Indonesia',
    partnerTicketNumber: '619029',
    customerTicketNumber: 'SCTASK1946080',
    dateOfVisit: '2026-06-08',
    startTime: '08:30',
    endTime: '17:00',
  });

  // State for Checklist (Questionnaire)
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultCortevaTasks);
  const [newTaskText, setNewTaskText] = useState('');

  // Descriptive text areas matching screenshots sequence
  const [issueDetails, setIssueDetails] = useState<string>(
    "The Field Service Engineer’s, requested to help users migrate their account credential at Corteva Malang on Monday, 8th June 2026 at 8.30 AM – 5.00 PM"
  );
  
  const [resolution, setResolution] = useState<string>(
    "FSE activities, available on Corteva Malang for supporting the ticket on Monday, 8th June 2026 at 8.30 AM – 5.00 PM\n\nFSE help customer to migrate their account credential, and the migration is still ongoing."
  );

  // Status updates section (Page 3 on screenshots)
  const [requestDescription, setRequestDescription] = useState<string>(
    "Need support to help users migrate their account credential at Corteva Malang"
  );

  const [statusUpdate, setStatusUpdate] = useState<string>(
    "The Field Service Engineer activities, migrate users account credential as instructed by Corteva’s IT on Corteva Malang at Jl. Raya Krebet DS Krebet Kec. Bululawang Malang East Java Indonesia 65171 this afternoon on 8th June 2026"
  );

  const [statusUpdateBullet, setStatusUpdateBullet] = useState<string>(
    "FSE has done the instruction by Corteva’s IT to help users migrate their account"
  );

  const [finalUpdate, setFinalUpdate] = useState<string>(
    "The Field Service Engineer has completed the shift for supporting users on Corteva Malang on 8th June 2026 at 5.00 PM"
  );

  const [finalUpdateStatus, setFinalUpdateStatus] = useState<string>(
    "The issues reported in this ticket were resolved successfully. FSE proceed to close the ticket."
  );

  // Appendix Upload state
  const [appendixList, setAppendixList] = useState<AppendixItem[]>([
    {
      id: 'app_corteva_1',
      name: 'system_config_migration.png',
      type: 'image',
      mimeType: 'image/png',
      size: '184 KB',
      url: configImage,
      caption: '1. Migrate User Account Credential'
    },
    {
      id: 'app_corteva_2',
      name: 'onedrive_login_screen.png',
      type: 'image',
      mimeType: 'image/png',
      size: '142 KB',
      url: onedriveImage,
      caption: '2. OneDrive Synchronizing Status Check'
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Signing Mode: 'physical' (Dikosongkan) vs 'digital' (Tanda tangan interaktif)
  const [signingMode, setSigningMode] = useState<'physical' | 'digital'>('digital');

  // Sign-off names and satisfaction rate
  const [engineerName, setEngineerName] = useState('M. NIZAR FAHLEVI');
  const [customerNameState, setCustomerNameState] = useState('DIAN EKO WIDAYANTI');
  const [overallSatisfaction, setOverallSatisfaction] = useState<number>(5);

  // HTML5 Drawing Signature pad Canvas Refs
  const engineerCanvasRef = useRef<HTMLCanvasElement>(null);
  const customerCanvasRef = useRef<HTMLCanvasElement>(null);
  const [engineerSigned, setEngineerSigned] = useState(false);
  const [customerSigned, setCustomerSigned] = useState(false);

  // Toast notification alerts
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Digital drawing coordinates track
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  const getCoordinates = (e: any, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: any, canvasRef: React.RefObject<HTMLCanvasElement | null>, setSigned: (val: boolean) => void) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing = true;
    const coords = getCoordinates(e, canvas);
    lastX = coords.x;
    lastY = coords.y;
    setSigned(true);
  };

  const draw = (e: any, canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (e.cancelable) e.preventDefault();

    const coords = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    lastX = coords.x;
    lastY = coords.y;
  };

  const stopDrawing = () => {
    isDrawing = false;
  };

  const clearCanvas = (canvasRef: React.RefObject<HTMLCanvasElement | null>, setSigned: (val: boolean) => void) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
  };

  const setupCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1E3A8A'; // Deep Blue Ink color
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  useEffect(() => {
    if (signingMode === 'digital') {
      // Small timeout to guarantee element is drawn
      setTimeout(() => {
        setupCanvas(engineerCanvasRef.current);
        setupCanvas(customerCanvasRef.current);
      }, 100);
    }
  }, [signingMode]);

  // Collapsible toggle helper
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper trigger for notifications
  const triggerNotification = (text: string, isError: boolean = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  // Template Quick preset selector
  const handleLoadCortevaPreset = () => {
    setActivePreset('corteva');
    setDetails({
      customerName: 'Corteva Malang, Indonesia',
      partnerTicketNumber: '619029',
      customerTicketNumber: 'SCTASK1946080',
      dateOfVisit: '2026-06-08',
      startTime: '08:30',
      endTime: '17:00',
    });
    setChecklist(defaultCortevaTasks);
    setIssueDetails("The Field Service Engineer’s, requested to help users migrate their account credential at Corteva Malang on Monday, 8th June 2026 at 8.30 AM – 5.00 PM");
    setResolution("FSE activities, available on Corteva Malang for supporting the ticket on Monday, 8th June 2026 at 8.30 AM – 5.00 PM\n\nFSE help customer to migrate their account credential, and the migration is still ongoing.");
    setRequestDescription("Need support to help users migrate their account credential at Corteva Malang");
    setStatusUpdate("The Field Service Engineer activities, migrate users account credential as instructed by Corteva’s IT on Corteva Malang at Jl. Raya Krebet DS Krebet Kec. Bululawang Malang East Java Indonesia 65171 this afternoon on 8th June 2026");
    setStatusUpdateBullet("FSE has done the instruction by Corteva’s IT to help users migrate their account");
    setFinalUpdate("The Field Service Engineer has completed the shift for supporting users on Corteva Malang on 8th June 2026 at 5.00 PM");
    setFinalUpdateStatus("The issues reported in this ticket were resolved successfully. FSE proceed to close the ticket.");
    setEngineerName('M. NIZAR FAHLEVI');
    setCustomerNameState('DIAN EKO WIDAYANTI');
    setOverallSatisfaction(5);
    setAppendixList([
      {
        id: 'app_corteva_1',
        name: 'system_config_migration.png',
        type: 'image',
        mimeType: 'image/png',
        size: '184 KB',
        url: configImage,
        caption: '1. Migrate User Account Credential'
      },
      {
        id: 'app_corteva_2',
        name: 'onedrive_login_screen.png',
        type: 'image',
        mimeType: 'image/png',
        size: '142 KB',
        url: onedriveImage,
        caption: '2. OneDrive Synchronizing Status Check'
      }
    ]);
    triggerNotification('Template Post-Visit Corteva Malang berhasil dimuat!', false);
  };

  const handleLoadBcaPreset = () => {
    setActivePreset('bca');
    setDetails({
      customerName: 'PT Bank Central Asia Tbk',
      partnerTicketNumber: 'PRT-2026-0897',
      customerTicketNumber: 'TKT-BCA-98721',
      dateOfVisit: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '11:30',
    });
    setChecklist(defaultBcaTasks);
    setIssueDetails("Eskalasi perbaikan jaringan terminal kantor cabang utama Bank BCA untuk menanggulangi latensi tinggi & interferensi fiber optik utama.");
    setResolution("Melakukan patching ulang sambungan fiber optik ke SFP Switch Port 4, mengganti kabel UTP kategori 6 sejauh 5 meter, dan melakukan ping test 500 paket tanpa rontok.");
    setRequestDescription("Gangguan koneksi berulang pada sistem ATM & teller Kantor Cabang BCA.");
    setStatusUpdate("Engineer melakukan monitoring voltase power supply UPS, didapati tegangan stabil di 220V.");
    setStatusUpdateBullet("Pengecekan fisik perangkat router core dan server local di ruang server.");
    setFinalUpdate("Pekerjaan diselesaikan sepenuhnya pada siang hari. Koneksi stabil.");
    setFinalUpdateStatus("Tiket ditutup dengan konfirmasi user di lokasi dalam keadaan normal.");
    setEngineerName('Imron Rosadi');
    setCustomerNameState('Hendra Wijaya');
    setOverallSatisfaction(5);
    setAppendixList([]);
    triggerNotification('Template BCA Network Report berhasil dimuat!', false);
  };

  const handleResetForm = () => {
    setDetails({
      customerName: '',
      partnerTicketNumber: '',
      customerTicketNumber: '',
      dateOfVisit: '',
      startTime: '',
      endTime: '',
    });
    setChecklist([]);
    setIssueDetails('');
    setResolution('');
    setRequestDescription('');
    setStatusUpdate('');
    setStatusUpdateBullet('');
    setFinalUpdate('');
    setFinalUpdateStatus('');
    setEngineerName('');
    setCustomerNameState('');
    setAppendixList([]);
    if (signingMode === 'digital') {
      clearCanvas(engineerCanvasRef, setEngineerSigned);
      clearCanvas(customerCanvasRef, setCustomerSigned);
    }
    triggerNotification('Formulir berhasil dibersihkan.', false);
  };

  // Modify checklist option values
  const handleChecklistOptionChange = (id: string, value: ChecklistValue) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, value } : item))
    );
  };

  // Modify checklists details inputs 
  const handleChecklistDetailsChange = (id: string, text: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, specifyDetails: text } : item))
    );
  };

  // Add custom questionnaire service tasks
  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newItem: ChecklistItem = {
      id: `custom_${Date.now()}`,
      task: newTaskText.trim(),
      value: 'Yes',
      specifyDetails: ''
    };
    setChecklist(prev => [...prev, newItem]);
    setNewTaskText('');
    triggerNotification('Item questionnaire baru ditambahkan!');
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
    triggerNotification('Item dihapus dari daftar.');
  };

  // File Upload Logic 
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFiles(files);
  };

  const processFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      let type: 'image' | 'video' | 'document' = 'document';
      if (file.type.startsWith('image/')) {
        type = 'image';
      } else if (file.type.startsWith('video/')) {
        type = 'video';
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const item: AppendixItem = {
          id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          type,
          mimeType: file.type || 'application/octet-stream',
          size: formatBytes(file.size),
          url: event.target?.result as string || '',
          caption: `Keterangan: ${file.name}`
        };
        setAppendixList(prev => [...prev, item]);
      };
      reader.readAsDataURL(file);
    });
    triggerNotification(`${files.length} berkas berhasil ditambahkan ke Appendix.`);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleUpdateAppendixCaption = (id: string, caption: string) => {
    setAppendixList(prev =>
      prev.map(item => (item.id === id ? { ...item, caption } : item))
    );
  };

  const handleRemoveAppendix = (id: string) => {
    setAppendixList(prev => prev.filter(item => item.id !== id));
    triggerNotification('Lampiran appendix dihapus.');
  };

  // Export PDF 
  const handleExportPDF = async () => {
    setIsExporting('PDF');
    triggerNotification('Sedang merender lembar PDF presisi...', false);
    const success = await exportToPdf('report-document-sheet', details.customerName || 'Post_Visit');
    setIsExporting(null);
    if (success) {
      triggerNotification('Laporan PDF berhasil diunduh!', false);
    } else {
      triggerNotification('Gagal membuat PDF. Harap coba lagi.', true);
    }
  };

  // Export DOCX Word
  const handleExportDOCX = async () => {
    setIsExporting('Word');
    triggerNotification('Mempersiapkan dokumen Word (.docx)...', false);
    try {
      let engSign: string | undefined = undefined;
      let custSign: string | undefined = undefined;

      if (signingMode === 'digital') {
        if (engineerSigned && engineerCanvasRef.current) {
          engSign = engineerCanvasRef.current.toDataURL('image/png');
        }
        if (customerSigned && customerCanvasRef.current) {
          custSign = customerCanvasRef.current.toDataURL('image/png');
        }
      }

      await exportToDocx(
        details,
        checklist,
        appendixList,
        signingMode,
        engineerName,
        customerNameState,
        overallSatisfaction,
        engineerSigned,
        customerSigned,
        engSign,
        custSign,
        issueDetails,
        resolution,
        requestDescription,
        statusUpdate,
        statusUpdateBullet,
        finalUpdate,
        finalUpdateStatus
      );
      triggerNotification('Laporan Word (.docx) berhasil dibuat!', false);
    } catch (err) {
      console.error(err);
      triggerNotification('Gagal menyusun berkas Word.', true);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased pb-16" id="main-container">
      {/* Dynamic Toast Status Notification */}
      {statusMessage && (
        <div 
          id="toast-notification"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl transition-all duration-300 transform translate-y-0 text-white ${
            statusMessage.isError 
              ? 'bg-rose-600 border border-rose-500' 
              : 'bg-indigo-650 border border-indigo-500 shadow-indigo-500/10'
          }`}
        >
          {statusMessage.isError ? (
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0" />
          )}
          <span className="text-sm font-semibold">{statusMessage.text}</span>
          <button type="button" onClick={() => setStatusMessage(null)} className="ml-3 text-white hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Application Bar */}
      <header className="bg-slate-950 border-b border-indigo-950/50 py-5 px-4 md:px-8 shadow-md" id="app-header">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-violet-900 text-violet-200 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Post-Visit Core
              </span>
              <span className="text-slate-400 text-xs font-mono font-bold">Active Preset: {activePreset === 'corteva' ? 'Corteva Malang Template' : 'BCA Network Report'}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1.5 flex items-center gap-2" id="app-title">
              <span className="p-1.5 bg-gradient-to-tr from-violet-600 to-indigo-700 text-white rounded-xl text-xs font-black shadow-inner">POST</span>
              Service Report &amp; Post-Visit Companion
            </h1>
            <p className="text-slate-400 text-xs mt-1 font-medium select-none">
              Isi parameter, tanda tangani secara interaktif, dan unduh lembar Word / PDF yang sesungguhnya secara instan.
            </p>
          </div>

          {/* Quick preset switch keys */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto" id="template-presets">
            <button
              type="button"
              onClick={handleLoadCortevaPreset}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activePreset === 'corteva'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
              id="preset-corteva-btn"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Template Corteva (PDF)
            </button>
            <button
              type="button"
              onClick={handleLoadBcaPreset}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activePreset === 'bca'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
              id="preset-bca-btn"
            >
              <FileText className="w-3.5 h-3.5" />
              Template BCA Bank
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-slate-400 hover:text-rose-450 hover:bg-rose-950/20 text-xs font-medium transition cursor-pointer"
              title="Formulir Kosong"
              id="btn-reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Panel split side-by-side */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8" id="app-main-content">
        
        {/* LEFT COLUMN: Input Fields controllers (5 columns wide) */}
        <div className="lg:col-span-5 space-y-5" id="controls-panel">
          
          {/* Section 1: Visit Details (Customer, Ticket, Date, Times) */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl" id="ctrl-section-details">
            <button 
              type="button"
              onClick={() => toggleSection('details')}
              className="w-full flex justify-between items-center px-5 py-4 bg-slate-900 border-b border-slate-800 hover:bg-slate-850/50 transition cursor-pointer text-left"
              id="toggle-details"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-5 bg-violet-500 rounded-full shrink-0 animate-pulse"></span>
                <div>
                  <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">1. Visit &amp; Customer Details</h2>
                  <p className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">Customer context and ticketing info</p>
                </div>
              </div>
              {expandedSections.details ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {expandedSections.details && (
              <div className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Customer Name</label>
                  <input 
                    type="text"
                    value={details.customerName}
                    onChange={(e) => setDetails({ ...details, customerName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:outline-none focus:border-violet-500"
                    placeholder="Contoh: Corteva Malang, Indonesia"
                    id="inp-customer-name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Partner Ticket Number</label>
                    <input 
                      type="text"
                      value={details.partnerTicketNumber}
                      onChange={(e) => setDetails({ ...details, partnerTicketNumber: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:outline-none focus:border-violet-500"
                      placeholder="619029"
                      id="inp-partner-ticket"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Customer Ticket Number</label>
                    <input 
                      type="text"
                      value={details.customerTicketNumber}
                      onChange={(e) => setDetails({ ...details, customerTicketNumber: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:outline-none focus:border-violet-500"
                      placeholder="SCTASK1946080"
                      id="inp-customer-ticket"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3 sm:col-span-1">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Date of Visit</label>
                    <input 
                      type="date"
                      value={details.dateOfVisit}
                      onChange={(e) => setDetails({ ...details, dateOfVisit: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2.5 text-white font-medium focus:outline-none focus:border-violet-500 text-xs font-mono"
                      id="inp-visit-date"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Start Time</label>
                    <input 
                      type="time"
                      value={details.startTime}
                      onChange={(e) => setDetails({ ...details, startTime: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-violet-500"
                      id="inp-start-time"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">End Time</label>
                    <input 
                      type="time"
                      value={details.endTime}
                      onChange={(e) => setDetails({ ...details, endTime: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-violet-500"
                      id="inp-end-time"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Questionnaire (Checklist items yes/no/na and details comments) */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl" id="ctrl-section-checklist">
            <button 
              type="button"
              onClick={() => toggleSection('questionnaire')}
              className="w-full flex justify-between items-center px-5 py-4 bg-slate-900 border-b border-slate-800 hover:bg-slate-850/50 transition cursor-pointer text-left"
              id="toggle-checklist"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-5 bg-violet-500 rounded-full shrink-0"></span>
                <div>
                  <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">2. Questionnaire &amp; Checklist</h2>
                  <p className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">Interactive validation questionnaire</p>
                </div>
              </div>
              {expandedSections.questionnaire ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {expandedSections.questionnaire && (
              <div className="p-5 space-y-4 text-xs">
                <div className="space-y-4">
                  {checklist.map((item, index) => (
                    <div key={item.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-extrabold text-violet-400">{index + 1}.</span>
                        <p className="font-semibold text-slate-200 flex-1 leading-normal">{item.task}</p>
                        <button 
                          type="button" 
                          onClick={() => handleDeleteChecklistItem(item.id)}
                          className="text-slate-550 hover:text-rose-400 transition"
                          title="Hapus baris ini"
                          id={`del-checklist-${item.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Yes / No / NA Options */}
                      <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg w-fit">
                        {(['Yes', 'No', 'NA'] as ChecklistValue[]).map((val) => {
                          const active = item.value === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleChecklistOptionChange(item.id, val)}
                              className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition cursor-pointer ${
                                active 
                                  ? 'bg-violet-600 text-white' 
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                              id={`opt-${item.id}-${val}`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>

                      {/* Optional details specification */}
                      <div>
                        <input 
                          type="text"
                          value={item.specifyDetails || ''}
                          onChange={(e) => handleChecklistDetailsChange(item.id, e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 placeholder-slate-650 text-[10px]"
                          placeholder="Beri rincian jika 'No' atau keterangan tambahan..."
                          id={`details-${item.id}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new custom task to the checklist questionnaire */}
                <form onSubmit={handleAddTask} className="flex gap-2 pt-2 border-t border-slate-850">
                  <input 
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Ketik pertanyaan/checklist baru..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                    id="new-task-input"
                  />
                  <button 
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4.5 py-2 rounded-xl font-bold cursor-pointer transition flex items-center gap-1 shrink-0"
                    id="add-task-btn"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Section 3: Write-ups & Incident Logs (Issue Details & Resolution) */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl" id="ctrl-section-writeups">
            <button 
              type="button"
              onClick={() => toggleSection('writeups')}
              className="w-full flex justify-between items-center px-5 py-4 bg-slate-900 border-b border-slate-800 hover:bg-slate-850/50 transition cursor-pointer text-left"
              id="toggle-writeups"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-5 bg-violet-500 rounded-full shrink-0"></span>
                <div>
                  <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">3. Service Write-ups &amp; Logs</h2>
                  <p className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">Edit page 1, 2 &amp; 3 logs text blocks</p>
                </div>
              </div>
              {expandedSections.writeups ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {expandedSections.writeups && (
              <div className="p-5 space-y-4 text-xs text-slate-300">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Issue Details (Page 1)</label>
                  <textarea
                    rows={2}
                    value={issueDetails}
                    onChange={(e) => setIssueDetails(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-medium focus:outline-none focus:border-violet-500 font-sans leading-relaxed text-xs"
                    id="ta-issue-details"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Resolution (Page 2)</label>
                  <textarea
                    rows={3}
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-medium focus:outline-none focus:border-violet-500 font-sans leading-relaxed text-xs"
                    id="ta-resolution"
                  />
                </div>

                <div className="p-3 bg-slate-900/30 border border-slate-850 rounded-xl space-y-3.5">
                  <div className="text-[10px] font-bold text-violet-450 uppercase tracking-widest border-b border-slate-800/80 pb-1">
                    Page 3: Ticket Status Log Writeups
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-450 mb-1">Request Description</label>
                    <input 
                      type="text"
                      value={requestDescription}
                      onChange={(e) => setRequestDescription(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-85/80 rounded-lg px-2.5 py-1.5 text-slate-200"
                      id="inp-request-desc"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-450 mb-1">Status Update Paragraph</label>
                    <textarea 
                      rows={3}
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-85/80 rounded-lg px-2.5 py-1.5 text-slate-200 font-sans text-xs"
                      id="ta-status-update"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-450 mb-1">Status Update Bullet Point</label>
                    <input 
                      type="text"
                      value={statusUpdateBullet}
                      onChange={(e) => setStatusUpdateBullet(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-85/80 rounded-lg px-2.5 py-1.5 text-slate-200 font-sans text-xs"
                      id="inp-status-update-bullet"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-450 mb-1">Final Update Title</label>
                    <input 
                      type="text"
                      value={finalUpdate}
                      onChange={(e) => setFinalUpdate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-85/80 rounded-lg px-2.5 py-1.5 text-slate-250 font-sans text-xs"
                      id="inp-final-update"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-450 mb-1">Final Update Status Closing</label>
                    <input 
                      type="text"
                      value={finalUpdateStatus}
                      onChange={(e) => setFinalUpdateStatus(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-85/80 rounded-lg px-2.5 py-1.5 text-slate-250 font-sans text-xs"
                      id="inp-final-update-status"
                    />
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Section 4: Sign-off verification (Physical toggle vs Interactive digital signatures) */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl" id="ctrl-section-signoff">
            <button 
              type="button"
              onClick={() => toggleSection('signoff')}
              className="w-full flex justify-between items-center px-5 py-4 bg-slate-900 border-b border-slate-800 hover:bg-slate-850/50 transition cursor-pointer text-left"
              id="toggle-signoff"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-5 bg-violet-500 rounded-full shrink-0"></span>
                <div>
                  <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">4. Lembar Pengesahan Signatures</h2>
                  <p className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">Configure offline sign-off vs interactive</p>
                </div>
              </div>
              {expandedSections.signoff ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {expandedSections.signoff && (
              <div className="p-5 space-y-4 text-xs">
                {/* Mode toggle */}
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSigningMode('physical')}
                    className={`py-2 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                      signingMode === 'physical' 
                        ? 'bg-violet-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    id="btn-switch-physical"
                  >
                    Physical (Dikosongkan)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSigningMode('digital')}
                    className={`py-2 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                      signingMode === 'digital' 
                        ? 'bg-violet-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    id="btn-switch-digital"
                  >
                    Digital Sign-off (Interaktif)
                  </button>
                </div>

                {signingMode === 'physical' ? (
                  <div className="p-4 bg-violet-950/20 border border-violet-900/50 rounded-xl text-[11px] text-violet-300 leading-relaxed flex gap-2">
                    <Info className="w-4 h-4 shrink-0 text-violet-400 mt-0.5" />
                    <span>
                      <strong>Mode Cetak Fisik:</strong> Bidang tanda tangan, Nama Engineer &amp; Pelanggan, komparasi skor kepuasan akan dikosongkan total di template keluaran PDF/Word. Menawarkan fungsionalitas tanda tangan basah pena setelah dokumen dicetak utuh.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4 text-slate-300 shadow-xxs p-1">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">E0ngineer Name</label>
                      <input 
                        type="text"
                        value={engineerName}
                        onChange={(e) => setEngineerName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-semibold"
                        id="inp-engineer-name"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Customer Name</label>
                      <input 
                        type="text"
                        value={customerNameState}
                        onChange={(e) => setCustomerNameState(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-semibold"
                        id="inp-customer-name-state"
                      />
                    </div>

                    {/* Overall satisfaction */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                        Customer Satisfaction: <span className="text-violet-400 font-extrabold">{overallSatisfaction}/5</span>
                      </label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setOverallSatisfaction(star)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center border transition font-bold text-xs cursor-pointer ${
                              overallSatisfaction >= star 
                                ? 'bg-violet-600 border-violet-500 text-white' 
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                            }`}
                            id={`rating-star-${star}`}
                          >
                            {star}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Signature pads elements */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Engineer Signature board */}
                      <div className="border border-slate-800 p-3 rounded-xl bg-slate-900/45">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Engineer Sign</span>
                          <button 
                            type="button" 
                            onClick={() => clearCanvas(engineerCanvasRef, setEngineerSigned)} 
                            className="text-[9px] text-rose-450 hover:underline cursor-pointer"
                            id="clear-eng"
                          >
                            Clear
                          </button>
                        </div>
                        <canvas 
                          ref={engineerCanvasRef}
                          width={150}
                          height={80}
                          className="bg-white rounded-lg w-full h-[80px] cursor-crosshair border border-slate-700"
                          onMouseDown={(e) => startDrawing(e, engineerCanvasRef, setEngineerSigned)}
                          onMouseMove={(e) => draw(e, engineerCanvasRef)}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={(e) => startDrawing(e, engineerCanvasRef, setEngineerSigned)}
                          onTouchMove={(e) => draw(e, engineerCanvasRef)}
                          onTouchEnd={stopDrawing}
                          id="canvas-eng-sign"
                        />
                      </div>

                      {/* Customer Signature board */}
                      <div className="border border-slate-800 p-3 rounded-xl bg-slate-900/45">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Customer Sign</span>
                          <button 
                            type="button" 
                            onClick={() => clearCanvas(customerCanvasRef, setCustomerSigned)} 
                            className="text-[9px] text-rose-450 hover:underline cursor-pointer"
                            id="clear-cust"
                          >
                            Clear
                          </button>
                        </div>
                        <canvas 
                          ref={customerCanvasRef}
                          width={150}
                          height={80}
                          className="bg-white rounded-lg w-full h-[80px] cursor-crosshair border border-slate-700"
                          onMouseDown={(e) => startDrawing(e, customerCanvasRef, setCustomerSigned)}
                          onMouseMove={(e) => draw(e, customerCanvasRef)}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={(e) => startDrawing(e, customerCanvasRef, setCustomerSigned)}
                          onTouchMove={(e) => draw(e, customerCanvasRef)}
                          onTouchEnd={stopDrawing}
                          id="canvas-cust-sign"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 5: Appendix Uploads & Captions */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl" id="ctrl-section-appendix">
            <button 
              type="button"
              onClick={() => toggleSection('appendix')}
              className="w-full flex justify-between items-center px-5 py-4 bg-slate-900 border-b border-slate-800 hover:bg-slate-850/50 transition cursor-pointer text-left"
              id="toggle-appendix"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-5 bg-violet-500 rounded-full shrink-0"></span>
                <div>
                  <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">5. Appendix &amp; Captures</h2>
                  <p className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">Device screen captures &amp; evidence ledger</p>
                </div>
              </div>
              {expandedSections.appendix ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {expandedSections.appendix && (
              <div className="p-5 space-y-4 text-xs">
                {/* Drop Zone Box */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files) processFiles(e.dataTransfer.files); }}
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-slate-800 hover:border-violet-600 rounded-xl p-6 text-center hover:bg-violet-950/20 cursor-pointer transition flex flex-col items-center justify-center gap-2"
                  id="dropzone"
                >
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    className="hidden"
                    accept="image/*"
                    id="inp-appendix-upload"
                  />
                  <div className="p-2.5 bg-violet-950/60 rounded-full text-violet-400">
                    <UploadCloud className="w-5 h-5 animate-bounce" />
                  </div>
                  <p className="font-semibold text-slate-300">Tarik berkas screenshot ke sini atau klik</p>
                  <p className="text-[10px] text-slate-500 font-mono">Format PNG/JPG otomatis mengalir ke Halaman 4</p>
                </div>

                {/* Listing preloaded or uploaded appendix items */}
                {appendixList.length > 0 && (
                  <div className="space-y-3 pt-2" id="appendix-files-list">
                    <span className="text-[10px] font-bold uppercase text-slate-450 tracking-wider">Daftar Lampiran ({appendixList.length})</span>
                    {appendixList.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-900 border border-slate-850 rounded-xl space-y-2">
                        <div className="flex items-center gap-2.5">
                          {item.type === 'image' ? (
                            <img 
                              src={item.url} 
                              alt={item.name} 
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 object-cover rounded bg-white shrink-0 border border-slate-700"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-slate-950 flex items-center justify-center text-rose-450 rounded border border-slate-800 font-bold text-xs">DOC</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-200 truncate text-[11px]" title={item.name}>{item.name}</p>
                            <p className="text-[9px] text-slate-500 font-mono font-bold uppercase">{item.size} • {item.mimeType}</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveAppendix(item.id)}
                            className="text-slate-500 hover:text-rose-500 p-1 rounded hover:bg-slate-800"
                            id={`del-app-${item.id}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input 
                          type="text"
                          value={item.caption || ''}
                          onChange={(e) => handleUpdateAppendixCaption(item.id, e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[10px] text-slate-300"
                          placeholder="Beri label keterangan lampiran..."
                          id={`caption-field-${item.id}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Real-time Printable A4 Document mockup (7 columns wide) */}
        <div className="lg:col-span-7 flex flex-col gap-6" id="preview-panel-column">
          
          {/* Output Control download trigger panel bar representing floating actions */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-md" id="action-trigger-bar">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-200">Export Ready: A4 Post-visit Blueprint</span>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                type="button"
                onClick={handleExportPDF}
                disabled={isExporting !== null}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs cursor-pointer transition shadow-lg shadow-violet-500/15 disabled:opacity-40"
                id="export-pdf-action"
              >
                <Download className="w-3.5 h-3.5" />
                {isExporting === 'PDF' ? 'Menyusun PDF...' : 'Simpan PDF Resmi'}
              </button>

              <button 
                type="button"
                onClick={handleExportDOCX}
                disabled={isExporting !== null}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-100 font-bold border border-slate-700 text-xs cursor-pointer transition disabled:opacity-40"
                id="export-docx-action"
              >
                <FileCode className="w-3.5 h-3.5 text-violet-400" />
                {isExporting === 'Word' ? 'Menyusun Word...' : 'Simpan Word (DOCX)'}
              </button>
            </div>
          </div>

          {/* Real-time styled multi-page PDF model preview */}
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950 p-3 shadow-2xl relative" id="layout-view-canvas">
            <div 
              id="report-document-sheet"
              className="bg-white text-slate-900 w-full mx-auto p-8 md:p-14 text-[10px] leading-relaxed relative min-w-[595px] max-w-[800px] shadow-inner divide-y divide-dashed divide-slate-200"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              
              {/* PAGE 1: Banner, metadata table, checklist & comment details */}
              <div className="pb-10 pt-2" id="pdf-page-1">
                <div className="text-right text-[8px] font-mono font-bold text-slate-400 uppercase mb-4 select-none">
                  Page 1 of 4 • Confidential Visit Record
                </div>

                {/* Purple header row block matching screenshot Page 1 */}
                <div className="bg-[#EADCF2] border border-slate-350 p-3 text-center mb-5 rounded-lg">
                  <h3 className="text-base font-extrabold text-violet-950 tracking-wide uppercase">
                    Post-Visit Template
                  </h3>
                </div>

                {/* Metadata Customer context grid */}
                <div className="grid grid-cols-6 border border-slate-300 text-left mb-6 text-[9px] rounded-md overflow-hidden">
                  <div className="bg-slate-100 p-2 border-r border-b border-slate-300 font-bold text-slate-700 col-span-1">Customer Name</div>
                  <div className="bg-slate-100 p-2 border-r border-b border-slate-300 font-bold text-slate-700 col-span-1">Partner Ticket Number</div>
                  <div className="bg-slate-100 p-2 border-r border-b border-slate-300 font-bold text-slate-700 col-span-1">Customer Ticket Number</div>
                  <div className="bg-slate-100 p-2 border-r border-b border-slate-300 font-bold text-slate-700 col-span-1">Date of Visit</div>
                  <div className="bg-slate-100 p-2 border-r border-b border-slate-300 font-bold text-slate-700 col-span-1">Start Time</div>
                  <div className="bg-slate-100 p-2 border-b border-slate-300 font-bold text-slate-700 col-span-1">End Time</div>

                  <div className="p-2 border-r border-slate-300 text-slate-900 font-medium col-span-1">{details.customerName || '-'}</div>
                  <div className="p-2 border-r border-slate-300 text-indigo-750 font-bold col-span-1">{details.partnerTicketNumber || '-'}</div>
                  <div className="p-2 border-r border-slate-300 text-slate-900 col-span-1 font-mono tracking-tighter">{details.customerTicketNumber || '-'}</div>
                  <div className="p-2 border-r border-slate-300 text-slate-900 col-span-1">{details.dateOfVisit ? new Date(details.dateOfVisit).toLocaleDateString("en-US", { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</div>
                  <div className="p-2 border-r border-slate-300 text-slate-900 col-span-1 font-mono">{details.startTime || '-'}</div>
                  <div className="p-2 text-slate-900 col-span-1 font-mono">{details.endTime || '-'}</div>
                </div>

                {/* Thin spacer block line representation */}
                <div className="h-6 border-y border-dashed border-slate-200 mb-6 bg-slate-50/50"></div>

                {/* Questionnaire 3-column table */}
                <div className="mb-6">
                  <table className="w-full border-collapse border border-slate-300 text-left text-[9px] rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-[#F5F3FF] border-b border-slate-300 text-violet-950 font-extrabold">
                        <th className="border border-slate-300 p-2.5 w-6/12">Questionnaire</th>
                        <th className="border border-slate-300 p-2.5 w-2/12 text-center">Yes/No/NA</th>
                        <th className="border border-slate-300 p-2.5 w-4/12">If No specify details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checklist.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="border border-slate-250 p-4 text-center text-slate-450 italic">Tidak ada pertanyaan terdaftar</td>
                        </tr>
                      ) : (
                        checklist.map((item) => (
                          <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                            <td className="border border-slate-300 p-2.5 text-slate-800 font-medium">{item.task}</td>
                            <td className={`border border-slate-300 p-2.5 text-center font-extrabold ${
                              item.value === 'Yes' 
                                ? 'bg-blue-50 text-blue-800' 
                                : item.value === 'No' 
                                  ? 'bg-rose-50 text-rose-800' 
                                  : 'bg-slate-100 text-slate-600'
                            }`}>
                              {item.value}
                            </td>
                            <td className="border border-slate-300 p-2.5 text-slate-600 font-mono text-[8px] leading-snug">
                              {item.specifyDetails || (item.value === 'No' ? 'Required details' : '')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Issue details content snippet */}
                <div className="mt-5 p-1">
                  <p className="font-extrabold text-[#111111] text-[10px] uppercase tracking-wider mb-2">Issue Details:</p>
                  <p className="text-slate-700 bg-[#FBFBFE] border border-slate-200 p-3 rounded-lg text-[9.5px] whitespace-pre-wrap leading-relaxed font-sans">{issueDetails || '-'}</p>
                </div>
              </div>

              {/* PAGE 2: Resolution & Verification Signing Table */}
              <div className="py-10" id="pdf-page-2">
                <div className="text-right text-[8px] font-mono font-bold text-slate-400 uppercase mb-4 select-none">
                  Page 2 of 4 • Handover Sign-off Sheet
                </div>

                <div className="mb-6 p-1">
                  <p className="font-extrabold text-[#111111] text-[10px] uppercase tracking-wider mb-2">Resolution:</p>
                  <p className="text-slate-700 bg-[#FBFBFE] border border-slate-200 p-3 rounded-lg text-[9.5px] whitespace-pre-wrap leading-relaxed font-sans">{resolution || '-'}</p>
                </div>

                {/* Verification signature boxes grid */}
                <div className="mt-8">
                  <p className="font-extrabold text-[#111111] text-[10px] uppercase tracking-wider mb-3">Lembar Pengesahan &amp; Verifikasi:</p>
                  
                  <table className="w-full border-collapse border border-slate-350 text-left text-[9px]">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-slate-300 text-slate-800 font-extrabold">
                        <th className="border border-slate-300 p-2.5 w-3/12">E0ngineer Name</th>
                        <th className="border border-slate-300 p-2.5 w-2/12 text-center">Engineer Signature</th>
                        <th className="border border-slate-300 p-2.5 w-3/12">Customer Name</th>
                        <th className="border border-slate-300 p-2.5 w-2/12 text-center">Customer Signature</th>
                        <th className="border border-slate-300 p-2.5 w-2/12 text-center">Overall Customer Satisfaction out of 5</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="h-16">
                        {/* Column Engineer Name */}
                        <td className="border border-slate-300 p-2.5 font-bold text-slate-900">
                          {signingMode === 'digital' ? engineerName : '______________________'}
                        </td>
                        
                        {/* Column Engineer Signature */}
                        <td className="border border-slate-300 p-1 bg-slate-50/50 text-center relative overflow-hidden">
                          {signingMode === 'digital' && engineerSigned && engineerCanvasRef.current ? (
                            <img 
                              src={engineerCanvasRef.current.toDataURL('image/png')} 
                              alt="Eng Sign" 
                              className="max-h-[50px] mx-auto object-contain"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-[7.5px] text-slate-400 select-none uppercase font-mono border border-dashed border-slate-200 p-1 flex items-center justify-center bg-white rounded">[ Tanda Tangan ]</span>
                          )}
                        </td>

                        {/* Column Customer Name */}
                        <td className="border border-slate-300 p-2.5 font-bold text-slate-900">
                          {signingMode === 'digital' ? customerNameState : '______________________'}
                        </td>

                        {/* Column Customer Signature */}
                        <td className="border border-slate-300 p-1 bg-slate-50/50 text-center relative overflow-hidden">
                          {signingMode === 'digital' && customerSigned && customerCanvasRef.current ? (
                            <img 
                              src={customerCanvasRef.current.toDataURL('image/png')} 
                              alt="Cust Sign" 
                              className="max-h-[50px] mx-auto object-contain"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-[7.5px] text-slate-400 select-none uppercase font-mono border border-dashed border-slate-200 p-1 flex items-center justify-center bg-white rounded">[ Tanda Tangan ]</span>
                          )}
                        </td>

                        {/* Column Rating */}
                        <td className="border border-slate-300 p-2 text-center font-extrabold text-base text-slate-950 font-mono">
                          {signingMode === 'digital' ? overallSatisfaction : '5'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  {/* Subtle checklist physical indicator if rating isn't digital */}
                  {signingMode === 'physical' && (
                    <div className="mt-4 p-2 bg-[#F8FAFC] border border-slate-200 rounded text-[8.5px] text-slate-500 font-mono flex items-center gap-4">
                      <span>Rating checklist:</span>
                      <span className="flex items-center gap-1">[ ] Star 1</span>
                      <span className="flex items-center gap-1">[ ] Star 2</span>
                      <span className="flex items-center gap-1">[ ] Star 3</span>
                      <span className="flex items-center gap-1">[ ] Star 4</span>
                      <span className="flex items-center gap-1 font-bold text-slate-700">[ ] Star 5</span>
                    </div>
                  )}
                </div>
              </div>

              {/* PAGE 3: Ticket status detailed log updates */}
              <div className="py-10" id="pdf-page-3">
                <div className="text-right text-[8px] font-mono font-bold text-slate-400 uppercase mb-4 select-none">
                  Page 3 of 4 • Ticket Status Logs
                </div>

                <div className="space-y-4 pt-4 leading-relaxed font-sans text-slate-800 text-[10px]" id="pdf-logs-block">
                  <h4 className="text-[11px] font-bold text-slate-950 border-b border-slate-300 pb-1.5 uppercase">
                    Ticket status update on {details.dateOfVisit ? new Date(details.dateOfVisit).toLocaleDateString("en-US", { day: 'numeric', month: 'long', year: 'numeric' }) : '8th June 2026'},
                  </h4>
                  
                  <div className="space-y-3.5">
                    <p>
                      <strong className="text-slate-950">Request Description:</strong> {requestDescription || '-'}
                    </p>

                    <p>
                      <strong className="text-slate-950">Status update:</strong> {statusUpdate || '-'}
                    </p>

                    {/* Styled Bullet point from screenshots */}
                    <ul className="list-disc pl-5 font-medium text-slate-900 space-y-1">
                      <li>{statusUpdateBullet || '-'}</li>
                    </ul>

                    <p>
                      <strong className="text-slate-950">Final Update:</strong> {finalUpdate || '-'}
                    </p>

                    <p className="bg-[#F8FAFC] p-3 border border-slate-200 rounded-lg font-medium text-slate-900">
                      {finalUpdateStatus || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* PAGE 4: Appendix device captures gallery */}
              <div className="py-10" id="pdf-page-4">
                <div className="text-right text-[8px] font-mono font-bold text-slate-400 uppercase mb-4 select-none">
                  Page 4 of 4 • Appendix Ledger
                </div>

                <h3 className="text-[11px] font-extrabold text-slate-950 border-b border-slate-300 pb-2 uppercase tracking-wide mb-4">
                  Appendix
                </h3>

                {appendixList.length === 0 ? (
                  <p className="text-slate-400 text-xs italic p-6 text-center border border-dashed border-slate-200 rounded-xl">
                    Tidak ada lampiran appendix berformat gambar screenshot yang dilampirkan.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {/* Caption Header Title */}
                    <p className="font-bold text-slate-900 text-[10.5px] uppercase tracking-wide">
                      1. Migrate User Account Credential
                    </p>

                    {/* Side by side screenshot images matches screenshots */}
                    <div className="grid grid-cols-2 gap-4">
                      {appendixList.map((item, index) => (
                        <div key={item.id} className="border border-slate-250 rounded-xl bg-[#FBFBFE] p-2 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-2 font-mono text-[8.5px] font-bold text-slate-450 uppercase">
                              <span>Capture [{index + 1}]</span>
                              <span>{item.size}</span>
                            </div>
                            
                            {item.type === 'image' && item.url ? (
                              <div className="rounded-lg overflow-hidden bg-white border border-slate-200 max-h-[190px] flex items-center justify-center p-1.5 shadow-xs">
                                <img 
                                  src={item.url} 
                                  alt={item.name} 
                                  className="max-h-[175px] object-contain w-full"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            ) : (
                              <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-400 flex flex-col items-center justify-center gap-1 font-mono text-[8px]">
                                <Video className="w-5 h-5 text-indigo-500 mb-1" />
                                <span>{item.name}</span>
                              </div>
                            )}
                          </div>

                          {item.caption && (
                            <p className="text-[8px] italic text-slate-600 mt-2 font-medium border-t border-slate-100 pt-1.5 text-center">
                              &ldquo;{item.caption}&rdquo;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Certificate Footer Coordinates */}
                <div className="text-[7.5px] text-slate-400 font-mono flex justify-between mt-14 pt-4 border-t border-slate-200 uppercase">
                  <span>Certificate ID: {details.partnerTicketNumber || 'DRAFT_TICKET_ID'}</span>
                  <span>System Output Generated Via Service Report Pro</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
