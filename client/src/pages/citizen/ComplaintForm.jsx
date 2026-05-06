// Citizen complaint portal — full page form with AI classification and streaming acknowledgement
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useGroqStream } from '../../hooks/useGroqStream';
import StreamingText from '../../components/ai/StreamingText';
import MarkdownRenderer from '../../components/ai/MarkdownRenderer';
import {
  ArrowLeft, Send, Lock, Shield, CheckCheck, CheckCircle, AlertCircle,
  AlertTriangle, Upload, MapPin, X, Check, Clock,
  Lightbulb, Route, Droplets, Wrench
} from 'lucide-react';
import './ComplaintForm.css';

const API_URL = import.meta.env.VITE_API_URL || '';

const AREAS = [
  'Anna Nagar', 'T Nagar', 'Adyar', 'Velachery', 'Tambaram', 'Porur',
  'Nungambakkam', 'Egmore', 'Royapuram', 'Mylapore', 'Guindy', 'Kodambakkam',
  'Perambur', 'Ambattur', 'Avadi', 'Chromepet', 'Pallavaram', 'Sholinganallur',
  'OMR Phase 1', 'Besant Nagar', 'Thiruvanmiyur', 'Chetpet', 'Kilpauk',
  'Tondiarpet', 'Washermanpet'
];

const ASSET_TYPES = [
  { value: 'streetlight', label: 'Street Light', icon: Lightbulb },
  { value: 'road', label: 'Road', icon: Route },
  { value: 'waterpipe', label: 'Water Pipeline', icon: Droplets },
  { value: 'sewer', label: 'Sewer', icon: Wrench },
];

const SEVERITY_OPTIONS = [
  { value: 'minor', label: 'Minor', desc: 'Low impact, not urgent', color: '#22C55E', iconColor: '#16A34A', iconBg: '#DCFCE7', Icon: CheckCircle },
  { value: 'moderate', label: 'Moderate', desc: 'Needs attention soon', color: '#F59E0B', iconColor: '#D97706', iconBg: '#FEF3C7', Icon: AlertCircle },
  { value: 'severe', label: 'Severe', desc: 'Immediate action needed', color: '#EF4444', iconColor: '#DC2626', iconBg: '#FEE2E2', Icon: AlertTriangle },
];

export default function ComplaintForm() {
  const navigate = useNavigate();
  const { text: streamText, loading: streamLoading, error: streamError, startStream } = useGroqStream();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '', phone: '', area: '', asset_type: '', asset_id: '', description: '', severity: '', photo_url: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [myComplaints, setMyComplaints] = useState([]);

  // Load previous complaints from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('urbanguard_my_complaints');
      if (stored) setMyComplaints(JSON.parse(stored));
    } catch { /* no-op */ }
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) errs.phone = 'Enter valid 10-digit Indian mobile number';
    if (!formData.area) errs.area = 'Please select an area';
    if (!formData.asset_type) errs.asset_type = 'Please select an asset type';
    if (!formData.description.trim()) errs.description = 'Description is required';
    else if (formData.description.trim().length < 20) errs.description = 'Description must be at least 20 characters';
    if (!formData.severity) errs.severity = 'Please select severity';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const res = await axios.post(`${API_URL}/api/complaints`, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        area: formData.area,
        asset_type: formData.asset_type,
        asset_id: formData.asset_id.trim() || null,
        description: formData.description.trim(),
        severity: formData.severity,
        photo_url: formData.photo_url || null,
      });

      if (res.data.success) {
        const complaint = res.data.data;
        setSubmittedData(complaint);

        // Save to localStorage
        const newList = [{ id: complaint.id, date: new Date().toISOString(), area: formData.area, severity: formData.severity, status: 'open' }, ...myComplaints].slice(0, 10);
        setMyComplaints(newList);
        localStorage.setItem('urbanguard_my_complaints', JSON.stringify(newList));

        // Stream AI acknowledgement
        await startStream(`${API_URL}/api/ai/complaint-ack`, {
          method: 'POST',
          body: {
            complaint_id: complaint.id,
            asset_type: formData.asset_type,
            area: formData.area,
            ai_severity: complaint.classification?.severity || formData.severity,
            ai_urgency: complaint.classification?.urgency || (formData.severity === 'severe' ? 'immediate' : 'within_24hrs'),
          }
        });
      }
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to submit complaint. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setSelectedFile(null);
    setFormData({ name: '', phone: '', area: '', asset_type: '', asset_id: '', description: '', severity: '', photo_url: '' });
    setErrors({});
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData({ ...formData, photo_url: file.name });
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setFormData({ ...formData, photo_url: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getResponseTimeInfo = () => {
    const severity = submittedData?.classification?.severity || formData.severity;
    if (severity === 'severe') return { text: 'Emergency response within 2 hours', color: '#EF4444', Icon: Clock };
    if (severity === 'moderate') return { text: 'Response within 24 hours', color: '#F59E0B', Icon: Clock };
    return { text: 'Response within the week', color: '#22C55E', Icon: Clock };
  };

  // ─── SUCCESS SCREEN ─────────────────────────────
  if (submittedData) {
    const responseInfo = getResponseTimeInfo();

    return (
      <div className="complaint-page">
        {/* Navbar */}
        <header className="complaint-nav">
          <div className="complaint-nav-logo">
            <span className="logo-urban">Urban</span>
            <span className="logo-guard">Guard-AI</span>
          </div>
          <button onClick={() => navigate('/')} className="complaint-nav-back">
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </header>

        <div className="complaint-content">
          <div className="complaint-form-card">
            <div className="success-container">
              {/* Animated checkmark */}
              <div className="success-checkmark">
                <CheckCheck size={36} color="white" />
              </div>

              <h2 className="success-title">Report Submitted Successfully</h2>

              {/* Complaint ID */}
              <div className="success-id-box">
                <div className="success-id-label">COMPLAINT ID</div>
                <div className="success-id-value">{submittedData.id}</div>
              </div>

              {/* Response time */}
              <div className="success-response-time">
                <responseInfo.Icon size={16} color={responseInfo.color} />
                <span>{responseInfo.text}</span>
              </div>

              {/* Classification summary */}
              {submittedData.classification && (
                <div className="classification-card">
                  <div className="classification-header">
                    <span className="success-ai-badge">AI</span>
                    <span className="success-ai-label">CLASSIFICATION</span>
                  </div>
                  <div className="classification-grid">
                    <div className="classification-item">AI Severity: <span className="value">{submittedData.classification.severity}</span></div>
                    <div className="classification-item">Confidence: <span className="value">{submittedData.classification.confidence}%</span></div>
                    <div className="classification-item">Urgency: <span className="value">{submittedData.classification.urgency?.replace(/_/g, ' ')}</span></div>
                    <div className="classification-item">Dispatch: <span className="value" style={{ color: submittedData.classification.requires_dispatch ? '#EF4444' : '#22C55E' }}>{submittedData.classification.requires_dispatch ? 'Yes' : 'No'}</span></div>
                  </div>
                </div>
              )}

              {/* AI Acknowledgement card */}
              <div className={`success-ai-card ${streamLoading ? 'streaming' : ''}`}>
                <div className="success-ai-header">
                  <span className="success-ai-badge">AI</span>
                  <span className="success-ai-label">AI RESPONSE</span>
                  {streamLoading && (
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#9D72FF', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9D72FF', animation: 'purple-pulse 1s ease-in-out infinite' }} />
                      Generating...
                    </span>
                  )}
                </div>
                {streamError ? (
                  <div className="success-ai-text" style={{ color: '#EF4444' }}>{streamError}</div>
                ) : (
                  <div className="success-ai-text">
                    <MarkdownRenderer content={streamText} />
                    {streamLoading && <span style={{ display: 'inline-block', animation: 'purple-pulse 1s ease-in-out infinite', marginLeft: '2px', opacity: 0.7 }}>|</span>}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="success-actions">
                <button onClick={handleReset} className="btn-secondary">
                  Submit Another Report
                </button>
                <button onClick={() => navigate('/')} className="btn-primary">
                  Track My Complaint
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── COMPLAINT FORM ─────────────────────────────
  const charCount = formData.description.length;
  const charCountClass = charCount >= 500 ? 'red' : charCount >= 400 ? 'amber' : '';

  return (
    <div className="complaint-page">
      {/* Navbar */}
      <header className="complaint-nav">
        <div className="complaint-nav-logo">
          <span className="logo-urban">Urban</span>
          <span className="logo-guard">Guard-AI</span>
        </div>
        <button onClick={() => navigate('/')} className="complaint-nav-back">
          <ArrowLeft size={16} />
          Back to Home
        </button>
      </header>

      <div className="complaint-content">
        {/* Hero card */}
        <div className="complaint-hero">
          <span className="hero-pill">CHENNAI MUNICIPAL CORPORATION</span>
          <h1 className="hero-title">Report an Infrastructure Issue</h1>
          <p className="hero-subtitle">Your report is AI-classified and routed instantly to the right team.</p>
          <div className="hero-stats">
            {[
              { num: '100', label: 'Assets Monitored' },
              { num: '24/7', label: 'AI Analysis' },
              { num: '<2hr', label: 'Severe Response' },
            ].map(s => (
              <div key={s.label} className="hero-stat-card">
                <div className="hero-stat-number">{s.num}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit} className="complaint-form-card">
          <div className="form-section-title">YOUR REPORT</div>

          {errors.submit && (
            <div className="form-error-banner">
              <p>{errors.submit}</p>
            </div>
          )}

          {/* ── Section: Contact Information ── */}
          <div className="form-divider">
            <span>Contact Information</span>
          </div>

          {/* Row 1: Name + Phone */}
          <div className="form-row-2col">
            <div>
              <label className="form-label">Full name <span className="required">*</span></label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Enter your full name"
                className={`form-input ${errors.name ? 'error' : ''}`}
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>
            <div>
              <label className="form-label">Phone number <span className="required">*</span></label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="10-digit mobile number"
                maxLength={10}
                className={`form-input ${errors.phone ? 'error' : ''}`}
              />
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>
          </div>

          {/* ── Section: Issue Details ── */}
          <div className="form-divider">
            <span>Issue Details</span>
          </div>

          {/* Row 2: Area + Asset Type */}
          <div className="form-row-2col">
            <div>
              <label className="form-label">Area <span className="required">*</span></label>
              <select value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})}
                className={`form-input form-select ${errors.area ? 'error' : ''}`}
              >
                <option value="">Select area...</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {errors.area && <p className="field-error">{errors.area}</p>}
            </div>
            <div>
              <label className="form-label">Asset type <span className="required">*</span></label>
              <select value={formData.asset_type} onChange={e => setFormData({...formData, asset_type: e.target.value})}
                className={`form-input form-select ${errors.asset_type ? 'error' : ''}`}
              >
                <option value="">Select type...</option>
                {ASSET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {errors.asset_type && <p className="field-error">{errors.asset_type}</p>}
            </div>
          </div>

          {/* Row 3: Asset ID (optional) */}
          <div className="form-row-1col">
            <label className="form-label">Asset ID</label>
            <input type="text" value={formData.asset_id} onChange={e => setFormData({...formData, asset_id: e.target.value.toUpperCase()})}
              placeholder="Leave blank if unknown"
              className="form-input"
            />
            <div className="field-helper">
              <MapPin size={12} />
              Optional — check the Asset Map to find the exact ID
            </div>
          </div>

          {/* Row 4: Description */}
          <div className="form-row-1col">
            <label className="form-label">Description <span className="required">*</span></label>
            <textarea value={formData.description} onChange={e => { if (e.target.value.length <= 500) setFormData({...formData, description: e.target.value}); }}
              placeholder="Please describe the issue in detail — what you see, how long it's been, and any safety concerns..."
              rows={5}
              className={`form-input form-textarea ${errors.description ? 'error' : ''}`}
            />
            <div className={`char-counter ${charCountClass}`}>{charCount}/500</div>
            {errors.description && <p className="field-error">{errors.description}</p>}
          </div>

          {/* ── Section: Severity & Evidence ── */}
          <div className="form-divider">
            <span>Severity & Evidence</span>
          </div>

          {/* Row 5: Severity selector cards */}
          <div className="form-row-1col">
            <label className="form-label">Severity <span className="required">*</span></label>
            <div className="severity-grid">
              {SEVERITY_OPTIONS.map(s => {
                const isSelected = formData.severity === s.value;
                const selectedClass = isSelected ? `${s.value}-selected` : '';

                return (
                  <button key={s.value} type="button"
                    onClick={() => setFormData({...formData, severity: s.value})}
                    className={`severity-card ${selectedClass}`}
                  >
                    {isSelected && (
                      <div className={`severity-check ${s.value}`}>
                        <Check size={12} color="white" />
                      </div>
                    )}
                    <div className={`severity-icon-container ${s.value}`}>
                      <s.Icon size={20} color={s.iconColor} />
                    </div>
                    <div className="severity-label">{s.label}</div>
                    <div className="severity-desc">{s.desc}</div>
                  </button>
                );
              })}
            </div>
            {errors.severity && <p className="field-error">{errors.severity}</p>}
          </div>

          {/* Row 6: Photo upload */}
          <div className="form-row-1col">
            <label className="form-label">Photo evidence</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            {selectedFile ? (
              <div className="photo-selected">
                <CheckCircle size={20} color="#22C55E" />
                <div className="photo-selected-info">
                  <div className="photo-selected-name">{selectedFile.name}</div>
                  <div className="photo-selected-size">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                </div>
                <button type="button" onClick={handleFileRemove} className="photo-remove-btn">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="photo-upload-area" onClick={() => fileInputRef.current?.click()}>
                <Upload size={28} color="#94A3B8" />
                <div className="photo-upload-title">Upload a photo (optional)</div>
                <div className="photo-upload-hint">Drag and drop or click to browse</div>
                <div className="photo-upload-size">PNG, JPG up to 10MB</div>
              </div>
            )}
          </div>

          {/* Submit button */}
          <button disabled={isSubmitting} type="submit" className="submit-btn">
            {isSubmitting ? (
              <>
                <div className="submit-spinner" />
                Analysing with AI...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Complaint Report
              </>
            )}
          </button>
          <div className="submit-trust-line">
            <Lock size={12} color="#94A3B8" />
            Your report is encrypted and handled securely
          </div>
        </form>

        {/* Previous complaints */}
        {myComplaints.length > 0 && (
          <div className="my-complaints">
            <h3 className="my-complaints-title">My Recent Complaints</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {myComplaints.map(c => (
                <div key={c.id} className="my-complaint-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="my-complaint-id">{c.id}</span>
                    <span className="my-complaint-area">{c.area}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="my-complaint-status" style={{
                      background: c.status === 'resolved' ? '#ECFDF5' : c.status === 'in_review' ? '#FFFBEB' : '#FEF2F2',
                      color: c.status === 'resolved' ? '#10B981' : c.status === 'in_review' ? '#F59E0B' : '#EF4444',
                    }}>{c.status?.replace(/_/g, ' ').toUpperCase()}</span>
                    <span className="my-complaint-date">
                      {new Date(c.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
