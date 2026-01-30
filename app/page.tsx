'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Upload, X, Check, ArrowLeft, Brain, Menu, Camera, Image as ImageIcon } from 'lucide-react';

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    leistungserbringer: '',
    betrag: '',
    datum: '',
    art: 'arztbesuch',
    weiterleitungBeihilfe: true,
    weiterleitungPKV: true
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      processWithClaude(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      processWithClaude(selectedFile);
    }
  };

  const processWithClaude = async (file: File) => {
    setAiProcessing(true);
    setAiProgress(10);

    try {
      // Datei zu Base64 konvertieren
      const base64 = await fileToBase64(file);
      
      setAiProgress(30);

      // Determine media type
      const mediaType = file.type === 'application/pdf' ? 'application/pdf' : file.type;

      // Call our API route (avoids CORS)
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
          mediaType: mediaType
        })
      });

      setAiProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        
        if (response.status === 401) {
          alert('API Key Problem: Bitte prüfe ob der Anthropic Key korrekt ist.');
        } else if (response.status === 429) {
          alert('API Limit erreicht: Bitte warte einen Moment.');
        } else {
          alert(`API Fehler ${response.status}: Bitte versuche es später erneut.`);
        }
        
        throw new Error(`AI API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.content[0].text;
      
      console.log('🤖 Claude Response:', aiResponse);
      
      // Parse JSON aus AI Response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0]);
        
        // Felder füllen
        setFormData(prev => ({
          ...prev,
          leistungserbringer: extracted.leistungserbringer || prev.leistungserbringer,
          betrag: extracted.betrag || prev.betrag,
          datum: extracted.datum || prev.datum,
          art: extracted.art || prev.art
        }));

        console.log('✅ Extracted:', extracted);
      }

      setAiProgress(100);
      
      // Kurz 100% anzeigen
      setTimeout(() => {
        setAiProcessing(false);
        setAiProgress(0);
      }, 1000);

    } catch (error) {
      console.error('AI Extraction Error:', error);
      alert('KI-Analyse fehlgeschlagen. Bitte fülle die Felder manuell aus.');
      setAiProcessing(false);
      setAiProgress(0);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('data', JSON.stringify({
        leistungserbringer: formData.leistungserbringer,
        betrag: parseFloat(formData.betrag),
        datum: formData.datum,
        art: formData.art,
        status: 'in_bearbeitung',
        beihilfe_status: formData.weiterleitungBeihilfe ? 'eingereicht' : 'noch_nicht_eingereicht',
        pkv_status: formData.weiterleitungPKV ? 'eingereicht' : 'noch_nicht_eingereicht',
      }));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!res.ok) throw new Error('Upload failed');

      setUploading(false);
      setUploadSuccess(true);

      setTimeout(() => {
        setUploadSuccess(false);
        setFile(null);
        setFormData({
          leistungserbringer: '',
          betrag: '',
          datum: '',
          art: 'arztbesuch',
          weiterleitungBeihilfe: true,
          weiterleitungPKV: true
        });
      }, 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      alert('Upload fehlgeschlagen. Bitte versuche es erneut.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile-Optimized Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="text-white" size={20} />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                BeihilfePay
              </h1>
            </Link>

            <nav className="hidden md:flex gap-6">
              <Link href="/" className="text-slate-600 hover:text-teal-600 transition">Dashboard</Link>
              <Link href="/upload" className="text-teal-600 font-semibold">Upload</Link>
              <Link href="/rechnungen" className="text-slate-600 hover:text-teal-600 transition">Rechnungen</Link>
              <Link href="/einstellungen" className="text-slate-600 hover:text-teal-600 transition">Einstellungen</Link>
            </nav>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-teal-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-3 border-t border-slate-200 pt-3 space-y-2">
              <Link href="/" className="block py-2 px-3 text-slate-600 hover:bg-slate-50 rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <Link href="/upload" className="block py-2 px-3 text-teal-600 font-semibold bg-teal-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Upload
              </Link>
              <Link href="/rechnungen" className="block py-2 px-3 text-slate-600 hover:bg-slate-50 rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>
                Rechnungen
              </Link>
              <Link href="/einstellungen" className="block py-2 px-3 text-slate-600 hover:bg-slate-50 rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>
                Einstellungen
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600 transition mb-4 sm:mb-6">
          <ArrowLeft size={18} />
          <span className="text-sm sm:text-base">Zurück</span>
        </Link>

        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Neue Rechnung</h2>
          <p className="text-sm sm:text-base text-slate-600 flex items-center gap-2">
            <Brain size={18} className="text-purple-600 flex-shrink-0" />
            Claude AI liest automatisch aus!
          </p>
        </div>

        {/* AI Status Banner */}
        {aiProcessing && (
          <div className="mb-6 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-xl shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="animate-pulse flex-shrink-0" size={20} />
              <h3 className="text-base sm:text-lg font-bold">
                KI analysiert Rechnung...
              </h3>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2 sm:h-3 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-300 rounded-full"
                style={{ width: `${aiProgress}%` }}
              />
            </div>
            <p className="text-xs sm:text-sm mt-2 text-white/90">
              {aiProgress}% - Claude AI arbeitet...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Upload Area with Multiple Options */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Rechnung / Beleg
            </label>
            
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition ${
                dragActive 
                  ? 'border-teal-500 bg-teal-50' 
                  : file 
                  ? 'border-teal-300 bg-teal-50'
                  : 'border-slate-300 bg-slate-50'
              }`}
            >
              {/* Hidden File Inputs */}
              <input
                type="file"
                id="file-camera"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
                capture="environment"
              />
              
              <input
                type="file"
                id="file-gallery"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,.pdf"
              />
              
              {!file ? (
                <>
                  <Upload className="mx-auto mb-3 text-slate-400" size={40} />
                  <p className="text-sm sm:text-base text-slate-700 font-semibold mb-4">
                    Rechnung hochladen
                  </p>
                  
                  {/* Separate Buttons for Camera and Gallery */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <label 
                      htmlFor="file-camera"
                      className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-teal-600 text-white text-sm sm:text-base rounded-lg font-semibold hover:bg-teal-700 cursor-pointer transition active:scale-95"
                    >
                      <Camera size={18} />
                      Foto aufnehmen
                    </label>
                    
                    <label 
                      htmlFor="file-gallery"
                      className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white text-sm sm:text-base rounded-lg font-semibold hover:bg-blue-700 cursor-pointer transition active:scale-95"
                    >
                      <ImageIcon size={18} />
                      Aus Galerie
                    </label>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-slate-500 mt-3">
                    Oder PDF/Bild hierher ziehen (Desktop)
                  </p>
                </>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <FileText className="text-teal-600 flex-shrink-0" size={28} />
                    <div className="text-left min-w-0">
                      <p className="font-semibold text-sm sm:text-base text-slate-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-slate-400 hover:text-red-600 transition p-2 flex-shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Rechnungsinfo</h3>
              {formData.betrag && (
                <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full flex items-center gap-1">
                  <Brain size={10} />
                  KI
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Leistungserbringer
              </label>
              <input
                type="text"
                value={formData.leistungserbringer}
                onChange={(e) => setFormData({...formData, leistungserbringer: e.target.value})}
                placeholder="z.B. Dr. med. Schmidt"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Betrag (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.betrag}
                  onChange={(e) => setFormData({...formData, betrag: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Datum
                </label>
                <input
                  type="date"
                  value={formData.datum}
                  onChange={(e) => setFormData({...formData, datum: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Art der Behandlung
              </label>
              <select
                value={formData.art}
                onChange={(e) => setFormData({...formData, art: e.target.value})}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="arztbesuch">Arztbesuch</option>
                <option value="zahnarzt">Zahnarzt</option>
                <option value="medikamente">Medikamente</option>
                <option value="krankenhaus">Krankenhaus</option>
                <option value="physiotherapie">Physiotherapie</option>
                <option value="sonstiges">Sonstiges</option>
              </select>
            </div>
          </div>

          {/* Weiterleitung */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
              Weiterleitung
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.weiterleitungBeihilfe}
                  onChange={(e) => setFormData({...formData, weiterleitungBeihilfe: e.target.checked})}
                  className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 mt-0.5 flex-shrink-0"
                />
                <span className="text-base text-slate-900">
                  An Beihilfestelle NRW
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.weiterleitungPKV}
                  onChange={(e) => setFormData({...formData, weiterleitungPKV: e.target.checked})}
                  className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 mt-0.5 flex-shrink-0"
                />
                <span className="text-base text-slate-900">
                  An private Krankenversicherung
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!file || uploading || uploadSuccess || aiProcessing}
            className={`w-full py-3 sm:py-4 px-6 rounded-lg font-bold text-white text-base transition flex items-center justify-center gap-2 ${
              uploadSuccess
                ? 'bg-teal-600'
                : uploading || aiProcessing
                ? 'bg-slate-400 cursor-not-allowed'
                : !file
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:shadow-lg active:scale-95'
            }`}
          >
            {uploadSuccess ? (
              <>
                <Check size={20} />
                Erfolgreich!
              </>
            ) : uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Lädt...
              </>
            ) : aiProcessing ? (
              <>
                <Brain className="animate-pulse" size={20} />
                Analysiert...
              </>
            ) : (
              <>
                <Upload size={20} />
                Hochladen
              </>
            )}
          </button>
        </form>
      </main>

      {/* Mobile Bottom Padding */}
      <div className="h-20"></div>
    </div>
  );
}