import React, { useState } from 'react';

const categories = [
  { id: 'qualityRating', label: '1️⃣ Quality of Solar Glass supplied' },
  { id: 'deliveryRating', label: '2️⃣ On-time delivery performance' },
  { id: 'packagingRating', label: '3️⃣ Packaging quality and protection' },
  { id: 'supportRating', label: '4️⃣ Technical support provided' },
  { id: 'responseRating', label: '5️⃣ Responsiveness of sales/support team' },
  { id: 'complaintRating', label: '6️⃣ Complaint handling effectiveness' },
  { id: 'documentationRating', label: '7️⃣ Accuracy of delivery documents' },
];

function App() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    product: '',
    qualityRating: 0,
    deliveryRating: 0,
    packagingRating: 0,
    supportRating: 0,
    responseRating: 0,
    complaintRating: 0,
    documentationRating: 0,
    overallRating: 0,
    recommendation: '',
    suggestion: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRatingChange = (category: string, value: number) => {
    setFormData((prev) => ({ ...prev, [category]: value }));
  };

  const handleOverallChange = (value: number) => {
    setFormData((prev) => ({ ...prev, overallRating: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      // In production (Vercel), /api/feedback is handled by the serverless function.
      // In local dev, set VITE_DEV_API_URL=http://localhost:3000 to test via NestJS.
      const apiBase = import.meta.env.VITE_DEV_API_URL;
      const url = apiBase ? `${apiBase}/customer-feedback` : '/api/feedback';
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to submit. Please try again.');
      }
    } catch (error) {
      alert('An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center space-y-6">
          <div className="text-6xl text-center flex justify-center w-full">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900">Thank You !</h2>
          <p className="text-gray-600">Your valuable feedback will help us serve you better. We appreciate your time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-blue-800 text-white py-6 px-8 text-center">
          <h1 className="text-2xl font-bold">Customer Feedback Form</h1>
          <p className="mt-2 text-blue-100">Help us improve by rating your experience (takes &lt;30 seconds)</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name *</label>
              <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border" 
                value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Person *</label>
              <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border" 
                value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input required type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border" 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Supplied</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border" 
                value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} placeholder="e.g. Borosil Solar Glass" />
            </div>
          </div>

          <hr className="border-t border-gray-200" />

          {/* Ratings (Stars) */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Service Rating (1 = Poor, 5 = Excellent)</h3>
            {categories.map((cat) => (
              <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center justify-between group">
                <span className="text-gray-700 font-medium mb-2 sm:mb-0">{cat.label}</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(cat.id, star)}
                      className={`text-3xl transition-transform hover:scale-110 ${
                        (formData as any)[cat.id] >= star ? '' : 'grayscale opacity-30'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <hr className="border-t border-gray-200" />

          {/* Overall Satisfaction */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Overall Satisfaction</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { val: 5, label: 'Very Satisfied', emoji: '🤩' },
                { val: 4, label: 'Satisfied', emoji: '🙂' },
                { val: 3, label: 'Neutral', emoji: '😐' },
                { val: 2, label: 'Dissatisfied', emoji: '🙁' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => handleOverallChange(item.val)}
                  className={`flex flex-col items-center p-4 border rounded-lg transition-all cursor-pointer ${
                    formData.overallRating === item.val
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-4xl mb-2">{item.emoji}</span>
                  <span className="text-sm text-gray-700 font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-t border-gray-200" />

          {/* Recommendation & Suggestions */}
          <div className="space-y-6">
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Would you recommend us to others? *
              </label>
              <div className="flex gap-6">
                {['Yes', 'Maybe', 'No'].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      required
                      type="radio"
                      name="recommendation"
                      value={option}
                      checked={formData.recommendation === option}
                      onChange={(e) => setFormData({...formData, recommendation: e.target.value})}
                      className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 text-lg">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Suggestions / Improvements
              </label>
              <textarea
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                value={formData.suggestion}
                onChange={(e) => setFormData({...formData, suggestion: e.target.value})}
                placeholder="We would love to hear your thoughts..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || formData.overallRating === 0 || formData.qualityRating === 0}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
          
        </form>
      </div>
    </div>
  );
}

export default App;
