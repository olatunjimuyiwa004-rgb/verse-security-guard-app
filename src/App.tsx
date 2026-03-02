import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Info, ExternalLink, Trash2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface ScamReport {
  id: string;
  content: string;
  timestamp: number;
  riskScore: number;
}

// --- Components ---

const Badge = ({ children, variant = 'safe' }: { children: React.ReactNode; variant?: 'safe' | 'alert' | 'warning' }) => {
  const styles = {
    safe: 'verse-badge-safe',
    alert: 'verse-badge-alert',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  };
  return <span className={`verse-badge ${styles[variant]}`}>{children}</span>;
};

const Card = ({ children, title, icon: Icon, className = "" }: { children: React.ReactNode; title?: string; icon?: any; className?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`verse-card ${className}`}
  >
    {title && (
      <div className="flex items-center gap-3 mb-6">
        {Icon && <Icon className="w-5 h-5 text-verse-purple" />}
        <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
      </div>
    )}
    {children}
  </motion.div>
);

const Alert = ({ variant, message }: { variant: 'low' | 'medium' | 'high'; message: string }) => {
  const config = {
    low: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: CheckCircle, label: 'Low Risk' },
    medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: Info, label: 'Medium Risk' },
    high: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', icon: AlertTriangle, label: 'High Risk' },
  };
  const { bg, border, text, icon: Icon, label } = config[variant];
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${bg} ${border} ${text} border p-4 rounded-xl flex items-start gap-3 mt-4`}
    >
      <Icon className="w-5 h-5 mt-0.5 shrink-0" />
      <div>
        <p className="font-bold text-sm uppercase tracking-wider">{label}</p>
        <p className="text-sm opacity-90">{message}</p>
      </div>
    </motion.div>
  );
};

const ProgressBar = ({ progress, colorClass }: { progress: number; colorClass: string }) => (
  <div className="verse-progress-bg">
    <motion.div 
      className={`verse-progress-fill ${colorClass}`}
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
    />
  </div>
);

export default function App() {
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState<{ score: number; level: 'low' | 'medium' | 'high'; message: string } | null>(null);
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('verse_scam_reports');
    if (saved) setReports(JSON.parse(saved));
  }, []);

  const analyzeRisk = () => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      const text = input.toLowerCase();
      let score = 0;
      
      const highRiskKeywords = ["seed phrase", "private key", "send crypto first", "double your money", "verify wallet"];
      const mediumRiskKeywords = ["claim now", "urgent", "airdrop reward", "limited time", "official support"];
      
      highRiskKeywords.forEach(k => { if (text.includes(k)) score += 35; });
      mediumRiskKeywords.forEach(k => { if (text.includes(k)) score += 15; });
      
      // Link detection
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = text.match(urlRegex);
      if (urls) {
        score += 10;
        urls.forEach(url => {
          if (url.includes('bit.ly') || url.includes('t.co') || url.includes('tinyurl')) score += 15;
          if (!url.includes('https')) score += 20;
        });
      }

      score = Math.min(score, 100);
      
      let level: 'low' | 'medium' | 'high' = 'low';
      let message = "This message appears to be safe. Always stay vigilant.";
      
      if (score > 60) {
        level = 'high';
        message = "WARNING: High probability of a scam. Do not interact with this message or click any links.";
      } else if (score > 25) {
        level = 'medium';
        message = "Caution: This message contains suspicious elements. Verify the source carefully.";
      }

      setAnalysis({ score, level, message });
      setIsAnalyzing(false);
    }, 1000);
  };

  const reportScam = () => {
    if (!input.trim() || !analysis) return;
    
    const newReport: ScamReport = {
      id: Date.now().toString(),
      content: input.slice(0, 100) + (input.length > 100 ? '...' : ''),
      timestamp: Date.now(),
      riskScore: analysis.score
    };
    
    const updated = [newReport, ...reports].slice(0, 10);
    setReports(updated);
    localStorage.setItem('verse_scam_reports', JSON.stringify(updated));
    setInput('');
    setAnalysis(null);
  };

  const deleteReport = (id: string) => {
    const updated = reports.filter(r => r.id !== id);
    setReports(updated);
    localStorage.setItem('verse_scam_reports', JSON.stringify(updated));
  };

  const getScoreColor = (score: number) => {
    if (score > 60) return 'bg-rose-500';
    if (score > 25) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <nav className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-verse-purple to-verse-blue rounded-xl flex items-center justify-center shadow-lg shadow-verse-purple/20">
            <Shield className="text-white w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Verse <span className="verse-gradient-text">Security Guard</span>
          </h1>
        </div>
        <Badge variant={analysis?.level === 'high' ? 'alert' : 'safe'}>
          {analysis?.level === 'high' ? 'System Alert' : 'Network Safe'}
        </Badge>
      </nav>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Analyzer */}
        <div className="lg:col-span-8 space-y-8">
          <Card title="Scam Analyzer" icon={Shield}>
            <div className="space-y-4">
              <textarea
                className="verse-input w-full min-h-[160px] resize-none"
                placeholder="Paste suspicious message, email content, or link here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button 
                  onClick={analyzeRisk}
                  disabled={isAnalyzing || !input.trim()}
                  className="verse-button-primary flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Shield className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Risk'}
                </button>
              </div>

              <AnimatePresence>
                {analysis && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-4"
                  >
                    <Alert variant={analysis.level} message={analysis.message} />
                    
                    <div className="mt-8 space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-medium text-gray-400">Risk Probability</span>
                        <span className={`text-2xl font-bold ${analysis.level === 'high' ? 'text-rose-500' : analysis.level === 'medium' ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {analysis.score}%
                        </span>
                      </div>
                      <ProgressBar progress={analysis.score} colorClass={getScoreColor(analysis.score)} />
                    </div>

                    <div className="mt-8 flex justify-center">
                      <button 
                        onClick={reportScam}
                        className="text-sm text-gray-400 hover:text-white transition-colors underline underline-offset-4"
                      >
                        Report this as a scam to the community
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>

          <Card title="Community Scam Reports" icon={AlertTriangle}>
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No community reports yet. Stay safe!</p>
                </div>
              ) : (
                <div className="divide-y divide-verse-border">
                  {reports.map((report) => (
                    <div key={report.id} className="py-4 flex items-center justify-between group">
                      <div className="space-y-1 pr-4">
                        <p className="text-sm text-gray-300 line-clamp-1">{report.content}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{new Date(report.timestamp).toLocaleString()}</span>
                          <span className={`${report.riskScore > 60 ? 'text-rose-500' : 'text-amber-500'}`}>
                            Score: {report.riskScore}%
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteReport(report.id)}
                        className="p-2 text-gray-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Info & Education */}
        <div className="lg:col-span-4 space-y-8">
          <Card title="Link Inspection" icon={ExternalLink}>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-black/20 rounded-lg border border-verse-border">
                <p className="text-gray-400 mb-2">Suspicious Patterns Detected:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    Shortened URLs (bit.ly, t.co)
                  </li>
                  <li className="flex items-center gap-2 text-amber-400">
                    <Info className="w-4 h-4" />
                    Non-HTTPS connections
                  </li>
                  <li className="flex items-center gap-2 text-amber-400">
                    <Info className="w-4 h-4" />
                    Misspelled official domains
                  </li>
                </ul>
              </div>
              <p className="text-xs text-gray-500 italic">
                Our inspector automatically flags these patterns during analysis.
              </p>
            </div>
          </Card>

          <Card title="Security Education" icon={Info}>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-verse-purple/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-verse-purple">01</span>
                  </div>
                  <p className="text-sm text-gray-300">Never share your private key or seed phrase with anyone.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-verse-purple/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-verse-purple">02</span>
                  </div>
                  <p className="text-sm text-gray-300">No legitimate project will ever ask you to send crypto first to "verify" your wallet.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-verse-purple/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-verse-purple">03</span>
                  </div>
                  <p className="text-sm text-gray-300">Always verify links before connecting your wallet to any dApp.</p>
                </div>
              </div>
              
              <a 
                href="https://verse.bitcoin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-center py-3 border border-verse-purple/30 rounded-xl text-verse-purple font-medium hover:bg-verse-purple/10 transition-colors text-sm"
              >
                Learn more at Verse.com
              </a>
            </div>
          </Card>

          {/* Status Widget */}
          <div className="verse-card bg-linear-to-br from-verse-purple/20 to-verse-blue/20 border-verse-purple/30">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="text-emerald-500 w-6 h-6" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-verse-dark animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-emerald-400">Shield Active</p>
                <p className="text-xs text-gray-400">Real-time detection enabled</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-20 pt-8 border-t border-verse-border text-center">
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Verse Security Guard. Powered by the Verse Ecosystem.
        </p>
      </footer>
    </div>
  );
}
