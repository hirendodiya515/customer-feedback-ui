import React, { useState, useMemo } from 'react';
import { 
  Star, 
  Mail, 
  User, 
  MapPin, 
  Info, 
  CheckCircle2, 
  ArrowRight,
  ClipboardList,
  Trophy,
  Activity} from 'lucide-react';

// --- Sub-components ---

const RatingWithComment = ({ 
  label, 
  value, 
  comment, 
  error,
  onRatingChange, 
  onCommentChange 
}: { 
  label: string; 
  value: number; 
  comment: string; 
  error?: string;
  onRatingChange: (val: number) => void; 
  onCommentChange: (val: string) => void;
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const ratingColors: Record<number, string> = {
    1: 'bg-red-600',
    2: 'bg-orange-500',
    3: 'bg-yellow-400',
    4: 'bg-lime-500',
    5: 'bg-green-800',
  };

  return (
    <div className={`space-y-2 p-3 rounded-lg transition-all border ${error ? 'border-red-200 bg-red-50' : 'border-transparent hover:bg-slate-50 hover:border-slate-100'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <span className="text-slate-700 font-semibold text-sm">{label} <span className="text-red-500">*</span></span>
        <div className="flex flex-col items-end">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((num) => {
              const isActive = (hoverValue === num) || (hoverValue === 0 && value === num);
              return (
                <button
                  key={num}
                  type="button"
                  onMouseEnter={() => setHoverValue(num)}
                  onMouseLeave={() => setHoverValue(0)}
                  onClick={() => onRatingChange(num)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 transform hover:scale-110 focus:outline-none ${
                    isActive 
                    ? `${ratingColors[num as keyof typeof ratingColors]} text-white shadow-md shadow-slate-200` 
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between w-full px-1 mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
          {error && <span className="text-[10px] text-red-500 font-bold mt-1 uppercase">{error}</span>}
        </div>
      </div>
      <textarea
        placeholder="Specific feedback (optional)..."
        className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-14"
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
      />
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
  <div className="mb-6 border-b border-slate-100 pb-3">
    <div className="flex items-center gap-2 text-blue-800">
      <div className="p-1.5 bg-blue-50 rounded">
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-lg font-bold uppercase tracking-tight">{title} <span className="text-red-500">*</span></h2>
    </div>
    {subtitle && <p className="text-slate-500 text-xs mt-0.5 ml-9">{subtitle}</p>}
  </div>
);

// --- Main App ---

export default function App() {
  const [formData, setFormData] = useState({
    basicInfo: {
      customerName: '',
      plantLocation: '',
      officeLocation: '',
      annualCapacity: '',
      representativeName: '',
      representativeMail: '',
      brlRepresentativeName: '',
      representativeDesignation: ''
    },
    quality: {
      thicknessDimensionQuality: { rating: 0, comment: '' },
      surfaceVisualQuality: { rating: 0, comment: '' },
      breakages: { rating: 0, comment: '' },
      edgeGrindingQuality: { rating: 0, comment: '' },
      arCoatingQuality: { rating: 0, comment: '' },
      packingLoadingQuality: { rating: 0, comment: '' },
    },
    competitiveness: {
      pricing: { rating: 0, comment: '' },
      deliveryLeadTime: { rating: 0, comment: '' },
      afterSalesServiceResponse: { rating: 0, comment: '' },
      salesTeamApproach: { rating: 0, comment: '' }
    },
    others: {
      procuredOtherThanBorosil: '', // 'Yes' or 'No'
      procurementReason: '',
      expectations: '',
      preferredChoice: [] as string[],
      recommendation: ''
    },
    overallSatisfaction: '',
    suggestion: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate Average Quality Score
  const averageQualityScore = useMemo(() => {
    const values = Object.values(formData.quality).map(v => v.rating);
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const count = values.filter(v => v > 0).length;
    return count > 0 ? (sum / count).toFixed(1) : '0.0';
  }, [formData.quality]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const updateBasicInfo = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, [field]: value }
    }));
  };

  const updateQuality = (field: string, type: 'rating' | 'comment', value: any) => {
    setFormData(prev => ({
      ...prev,
      quality: {
        ...prev.quality,
        [field]: { ...(prev.quality as any)[field], [type]: value }
      }
    }));
  };

  const updateCompetitiveness = (field: string, type: 'rating' | 'comment', value: any) => {
    setFormData(prev => ({
      ...prev,
      competitiveness: {
        ...prev.competitiveness,
        [field]: { ...(prev.competitiveness as any)[field], [type]: value }
      }
    }));
  };

  const togglePreferredChoice = (choice: string) => {
    setFormData(prev => {
      const current = prev.others.preferredChoice;
      const updated = current.includes(choice)
        ? current.filter(item => item !== choice)
        : [...current, choice];
      return { ...prev, others: { ...prev.others, preferredChoice: updated } };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Comprehensive validation
    const newErrors: Record<string, string> = {};
    
    // Basic Info Validation
    if (!formData.basicInfo.customerName.trim()) newErrors.customerName = 'Required';
    if (!formData.basicInfo.plantLocation.trim()) newErrors.plantLocation = 'Required';
    if (!formData.basicInfo.officeLocation.trim()) newErrors.officeLocation = 'Required';
    if (!formData.basicInfo.annualCapacity.trim()) newErrors.annualCapacity = 'Required';
    if (!formData.basicInfo.representativeName.trim()) newErrors.representativeName = 'Required';
    if (!formData.basicInfo.representativeMail || !validateEmail(formData.basicInfo.representativeMail)) {
      newErrors.representativeMail = 'Valid email required';
    }
    if (!formData.basicInfo.representativeDesignation.trim()) newErrors.representativeDesignation = 'Required';
    if (!formData.basicInfo.brlRepresentativeName.trim()) newErrors.brlRepresentativeName = 'Required';

    // Quality Ratings Validation
    Object.entries(formData.quality).forEach(([key, value]) => {
      if (value.rating === 0) newErrors[`quality_${key}`] = 'Rating Required';
    });

    // Competitiveness Ratings Validation
    Object.entries(formData.competitiveness).forEach(([key, value]) => {
      if (value.rating === 0) newErrors[`competitiveness_${key}`] = 'Rating Required';
    });

    // Other Questions Validation
    if (!formData.others.procuredOtherThanBorosil) newErrors.procuredOtherThanBorosil = 'Required';
    if (formData.others.procuredOtherThanBorosil === 'Yes' && !formData.others.procurementReason.trim()) {
      newErrors.procurementReason = 'Please specify reason';
    }
    if (!formData.others.expectations.trim()) newErrors.expectations = 'Required';
    if (formData.others.preferredChoice.length === 0) newErrors.preferredChoice = 'Select at least one';
    if (!formData.others.recommendation) newErrors.recommendation = 'Required';
    if (!formData.overallSatisfaction) newErrors.overallSatisfaction = 'Required';
    if (!formData.suggestion.trim()) newErrors.suggestion = 'Required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorKey = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorKey) || document.getElementsByName(firstErrorKey)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        ...formData,
        qualityAverage: averageQualityScore,
        submittedAt: new Date().toISOString()
      };

      // In dev mode, proxy to local backend. In production (Vercel), always use the `/api/feedback` serverless function.
      const url = import.meta.env.DEV && import.meta.env.VITE_DEV_API_URL
        ? `${import.meta.env.VITE_DEV_API_URL}/customer-feedback`
        : '/api/feedback';
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to submit. Please try again or contact support.');
      }
    } catch (error) {
      alert('An connectivity error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-lg w-full text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Thank You!</h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Your feedback has been successfully recorded. We value your partnership with <strong>Borosil Renewables Ltd.</strong>
          </p>
          <div className="h-px bg-slate-100 w-full my-4"></div>
          <button 
            onClick={() => window.location.reload()}
            className="text-blue-600 font-semibold hover:text-blue-700 underline underline-offset-4 text-sm"
          >
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-8">
      {/* Refined Header: L-C-R Alignment */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm transition-all duration-300 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-3 items-center">
          {/* Left: Logo */}
          <div className="flex justify-start">
            <img src="/logo.png" alt="Borosil Logo" className="h-10 md:h-12 w-auto object-contain" />
          </div>
          
          {/* Center: Survey Title */}
          <div className="flex justify-center text-center">
            <h1 className="text-blue-900 font-extrabold text-base md:text-lg uppercase tracking-wider whitespace-nowrap">
              Customer Satisfaction Survey
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div className="bg-white rounded-2xl shadow shadow-slate-200/50 overflow-hidden border border-slate-100">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 md:p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Your Voice Matters!</h1>
              <p className="text-blue-100 text-sm max-w-xl opacity-90">
                Help us refine our processes and products. Your honest feedback is instrumental in our journey towards excellence.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                
                <span className="text-[10px] font-bold uppercase tracking-tight">Note: High ratings indicate positive feedback</span>
              </div>
            </div>
            <Activity className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/5 rotate-12" />
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-12">
            
            {/* Section 1: Basic Info */}
            <section>
              <SectionHeader icon={User} title="Basic Information" subtitle="Tell us about yourself and your organization" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 ml-1">Customer Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      required
                      className={`w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border ${errors.customerName ? 'border-red-400 bg-red-50' : 'border-slate-200'} rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all`}
                      placeholder="Organization Name"
                      value={formData.basicInfo.customerName}
                      onChange={(e) => updateBasicInfo('customerName', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 ml-1">Plant Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      required
                      name="plantLocation"
                      className={`w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border ${errors.plantLocation ? 'border-red-400 bg-red-50' : 'border-slate-200'} rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all`}
                      placeholder="City/State"
                      value={formData.basicInfo.plantLocation}
                      onChange={(e) => updateBasicInfo('plantLocation', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 ml-1">Office Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      required
                      name="officeLocation"
                      className={`w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border ${errors.officeLocation ? 'border-red-400 bg-red-50' : 'border-slate-200'} rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all`}
                      placeholder="Headquarters"
                      value={formData.basicInfo.officeLocation}
                      onChange={(e) => updateBasicInfo('officeLocation', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 ml-1">Annual Capacity *</label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      required
                      name="annualCapacity"
                      className={`w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border ${errors.annualCapacity ? 'border-red-400 bg-red-50' : 'border-slate-200'} rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all`}
                      placeholder="e.g. 100MW"
                      value={formData.basicInfo.annualCapacity}
                      onChange={(e) => updateBasicInfo('annualCapacity', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 ml-1">Representative Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      required
                      name="representativeName"
                      className={`w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border ${errors.representativeName ? 'border-red-400 bg-red-50' : 'border-slate-200'} rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all`}
                      placeholder="Contact Person"
                      value={formData.basicInfo.representativeName}
                      onChange={(e) => updateBasicInfo('representativeName', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 ml-1">Representative Mail *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      required
                      name="representativeMail"
                      type="email"
                      className={`w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border ${errors.representativeMail ? 'border-red-400 bg-red-50' : 'border-slate-200'} rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all`}
                      placeholder="email@example.com"
                      value={formData.basicInfo.representativeMail}
                      onChange={(e) => updateBasicInfo('representativeMail', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 ml-1">Representative Designation *</label>
                  <div className="relative">
                    <Info className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      required
                      name="representativeDesignation"
                      className={`w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border ${errors.representativeDesignation ? 'border-red-400 bg-red-50' : 'border-slate-200'} rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all`}
                      placeholder="Position in company"
                      value={formData.basicInfo.representativeDesignation}
                      onChange={(e) => updateBasicInfo('representativeDesignation', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 ml-1">BRL Representative Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      required
                      name="brlRepresentativeName"
                      className={`w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border ${errors.brlRepresentativeName ? 'border-red-400 bg-red-50' : 'border-slate-200'} rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all`}
                      placeholder="Enter the name of BRL representative"
                      value={formData.basicInfo.brlRepresentativeName}
                      onChange={(e) => updateBasicInfo('brlRepresentativeName', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Quality */}
            <section>
              <SectionHeader icon={Trophy} title="Quality Assurance" subtitle="Rate our product quality and physical characteristics" />
              <div className="space-y-2">
                <div id="quality_thicknessDimensionQuality">
                  <RatingWithComment 
                    label="Thickness & Dimension quality."
                    value={formData.quality.thicknessDimensionQuality.rating}
                    comment={formData.quality.thicknessDimensionQuality.comment}
                    error={errors.quality_thicknessDimensionQuality}
                    onRatingChange={(v) => updateQuality('thicknessDimensionQuality', 'rating', v)}
                    onCommentChange={(v) => updateQuality('thicknessDimensionQuality', 'comment', v)}
                  />
                </div>
                <div id="quality_surfaceVisualQuality">
                  <RatingWithComment 
                    label="Surface & Visual Quality."
                    value={formData.quality.surfaceVisualQuality.rating}
                    comment={formData.quality.surfaceVisualQuality.comment}
                    error={errors.quality_surfaceVisualQuality}
                    onRatingChange={(v) => updateQuality('surfaceVisualQuality', 'rating', v)}
                    onCommentChange={(v) => updateQuality('surfaceVisualQuality', 'comment', v)}
                  />
                </div>
                <div id="quality_breakages">
                  <RatingWithComment 
                    label="Satisfaction with glass breakage inside pallets"
                    value={formData.quality.breakages.rating}
                    comment={formData.quality.breakages.comment}
                    error={errors.quality_breakages}
                    onRatingChange={(v) => updateQuality('breakages', 'rating', v)}
                    onCommentChange={(v) => updateQuality('breakages', 'comment', v)}
                  />
                </div>
                <div id="quality_edgeGrindingQuality">
                  <RatingWithComment 
                    label="Edge grinding quality."
                    value={formData.quality.edgeGrindingQuality.rating}
                    comment={formData.quality.edgeGrindingQuality.comment}
                    error={errors.quality_edgeGrindingQuality}
                    onRatingChange={(v) => updateQuality('edgeGrindingQuality', 'rating', v)}
                    onCommentChange={(v) => updateQuality('edgeGrindingQuality', 'comment', v)}
                  />
                </div>
                <div id="quality_arCoatingQuality">
                  <RatingWithComment 
                    label="Coating quality."
                    value={formData.quality.arCoatingQuality.rating}
                    comment={formData.quality.arCoatingQuality.comment}
                    error={errors.quality_arCoatingQuality}
                    onRatingChange={(v) => updateQuality('arCoatingQuality', 'rating', v)}
                    onCommentChange={(v) => updateQuality('arCoatingQuality', 'comment', v)}
                  />
                </div>
                <div id="quality_packingLoadingQuality">
                  <RatingWithComment 
                    label="Packing and Loading quality"
                    value={formData.quality.packingLoadingQuality.rating}
                    comment={formData.quality.packingLoadingQuality.comment}
                    error={errors.quality_packingLoadingQuality}
                    onRatingChange={(v) => updateQuality('packingLoadingQuality', 'rating', v)}
                    onCommentChange={(v) => updateQuality('packingLoadingQuality', 'comment', v)}
                  />
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-blue-900 font-bold text-sm md:text-base">Overall Product Quality & Performance</h3>
                    <p className="text-blue-700 text-[10px] md:text-xs">Weighted average score of quality metrics</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-blue-800 leading-none">{averageQualityScore}</span>
                    <span className="text-[9px] uppercase font-bold text-blue-600 mt-1">AVG SCORE</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Competitiveness */}
            <section>
              <SectionHeader icon={Activity} title="Market Competitiveness" subtitle="Benchmarking against industry standards" />
              <div className="space-y-2">
                <div id="competitiveness_pricing">
                  <RatingWithComment 
                    label="Pricing Compared to Competitors"
                    value={formData.competitiveness.pricing.rating}
                    comment={formData.competitiveness.pricing.comment}
                    error={errors.competitiveness_pricing}
                    onRatingChange={(v) => updateCompetitiveness('pricing', 'rating', v)}
                    onCommentChange={(v) => updateCompetitiveness('pricing', 'comment', v)}
                  />
                </div>
                <div id="competitiveness_deliveryLeadTime">
                  <RatingWithComment 
                    label="Delivery Lead Time Compared to Competitors"
                    value={formData.competitiveness.deliveryLeadTime.rating}
                    comment={formData.competitiveness.deliveryLeadTime.comment}
                    error={errors.competitiveness_deliveryLeadTime}
                    onRatingChange={(v) => updateCompetitiveness('deliveryLeadTime', 'rating', v)}
                    onCommentChange={(v) => updateCompetitiveness('deliveryLeadTime', 'comment', v)}
                  />
                </div>
                <div id="competitiveness_afterSalesServiceResponse">
                  <RatingWithComment 
                    label="After sales service & response time"
                    value={formData.competitiveness.afterSalesServiceResponse.rating}
                    comment={formData.competitiveness.afterSalesServiceResponse.comment}
                    error={errors.competitiveness_afterSalesServiceResponse}
                    onRatingChange={(v) => updateCompetitiveness('afterSalesServiceResponse', 'rating', v)}
                    onCommentChange={(v) => updateCompetitiveness('afterSalesServiceResponse', 'comment', v)}
                  />
                </div>
                <div id="competitiveness_salesTeamApproach">
                  <RatingWithComment 
                    label="Sales Team Approach and Response"
                    value={formData.competitiveness.salesTeamApproach.rating}
                    comment={formData.competitiveness.salesTeamApproach.comment}
                    error={errors.competitiveness_salesTeamApproach}
                    onRatingChange={(v) => updateCompetitiveness('salesTeamApproach', 'rating', v)}
                    onCommentChange={(v) => updateCompetitiveness('salesTeamApproach', 'comment', v)}
                  />
                </div>
              </div>
            </section>

            {/* Section 4: Others */}
            <section>
              <SectionHeader icon={ClipboardList} title="Additional Insights" subtitle="Understanding your sourcing and expectations" />
              <div className="space-y-6">
                <div className="space-y-3" id="procuredOtherThanBorosil">
                  <label className="text-sm font-semibold text-slate-700 block">Do you procure glasses apart from Borosil? And why? <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    {['Yes', 'No'].map(choice => (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, others: { ...prev.others, procuredOtherThanBorosil: choice } }))}
                        className={`px-6 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          formData.others.procuredOtherThanBorosil === choice
                          ? 'bg-blue-600 border-blue-600 text-white shadow shadow-blue-200'
                          : errors.procuredOtherThanBorosil ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                  <textarea 
                    id="procurementReason"
                    className={`w-full p-3 text-xs bg-slate-50 border ${errors.procurementReason ? 'border-red-400 bg-red-50' : 'border-slate-200'} rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all h-20`}
                    placeholder="If yes, please mention the reason..."
                    value={formData.others.procurementReason}
                    onChange={(e) => setFormData(prev => ({ ...prev, others: { ...prev.others, procurementReason: e.target.value } }))}
                  />
                  {errors.procurementReason && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.procurementReason}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">Your expectation from Borosil Renewables Ltd. <span className="text-red-500">*</span></label>
                  <textarea 
                    id="expectations"
                    className={`w-full p-3 text-xs bg-slate-50 border ${errors.expectations ? 'border-red-400 bg-red-50' : 'border-slate-200'} rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all h-20`}
                    placeholder="Future requirements or improvements..."
                    value={formData.others.expectations}
                    onChange={(e) => setFormData(prev => ({ ...prev, others: { ...prev.others, expectations: e.target.value } }))}
                  />
                </div>
                <div className="space-y-3" id="preferredChoice">
                  <label className="text-sm font-semibold text-slate-700 block">What makes Borosil Renewables Ltd. as your preferred choice? (Select Multiple) <span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Product and Service', 'Quality', 'Delivery', 
                      'Lead Time', 'Long Term Relationship', 'Price', 'Other'
                    ].map(choice => (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => togglePreferredChoice(choice)}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-all ${
                          formData.others.preferredChoice.includes(choice)
                          ? 'bg-blue-600 border-blue-600 text-white shadow shadow-blue-100'
                          : errors.preferredChoice ? 'bg-red-50 border-red-200 text-red-400' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                  {errors.preferredChoice && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.preferredChoice}</p>}
                </div>
                <div className="space-y-3" id="recommendation">
                  <label className="text-sm font-semibold text-slate-700 block">Would you recommend us to others? <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    {['Yes', 'Maybe', 'No'].map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, others: { ...prev.others, recommendation: option } }))}
                        className={`flex-1 py-2 rounded text-xs font-bold border transition-all ${
                          formData.others.recommendation === option
                          ? 'bg-blue-600 border-blue-600 text-white shadow shadow-blue-100'
                          : errors.recommendation ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Overall Satisfaction */}
            <section className="bg-slate-50 -mx-6 md:-mx-8 p-6 md:p-8 space-y-6" id="overallSatisfaction">
              <div className="text-center max-w-xl mx-auto">
                <h2 className="text-xl font-bold text-slate-900">Overall Satisfaction <span className="text-red-500">*</span></h2>
                <p className="text-slate-500 text-xs">Rate your overall experience with our products and services</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                {[
                  { id: 'very_satisfied', label: 'Very Satisfied', emoji: '🤩' },
                  { id: 'satisfied', label: 'Satisfied', emoji: '🙂' },
                  { id: 'neutral', label: 'Neutral', emoji: '😐' },
                  { id: 'dissatisfied', label: 'Dissatisfied', emoji: '🙁' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, overallSatisfaction: item.id }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      formData.overallSatisfaction === item.id
                      ? 'bg-white border-blue-600 shadow shadow-blue-100 scale-105'
                      : errors.overallSatisfaction ? 'bg-red-50 border-red-200' : 'bg-transparent border-slate-200 hover:border-blue-200 hover:bg-white/50'
                    }`}
                  >
                    <span className={`text-3xl transition-transform ${formData.overallSatisfaction === item.id ? '' : 'grayscale opacity-50'}`}>
                      {item.emoji}
                    </span>
                    <span className={`text-[10px] font-bold ${formData.overallSatisfaction === item.id ? 'text-blue-700' : 'text-slate-500'}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="max-w-2xl mx-auto space-y-2 mt-8">
                <label className="text-sm font-semibold text-slate-700 block">Suggestions or Improvement <span className="text-red-500">*</span></label>
                <textarea 
                  id="suggestion"
                  className={`w-full p-4 text-xs bg-white border ${errors.suggestion ? 'border-red-400 bg-red-50' : 'border-slate-200'} rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all h-24`}
                  placeholder="Share any additional thoughts or specific improvement areas..."
                  value={formData.suggestion}
                  onChange={(e) => setFormData(prev => ({ ...prev, suggestion: e.target.value }))}
                />
              </div>
            </section>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-700 text-white rounded py-4 text-base font-bold shadow-md shadow-blue-100 hover:bg-blue-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Feedback
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </main>

      <footer className="mt-8 text-center text-slate-400 text-[10px] pb-8 tracking-widest uppercase">
        &copy; 2026 Borosil Renewables Ltd. All Rights Reserved.
      </footer>
    </div>
  );
}
