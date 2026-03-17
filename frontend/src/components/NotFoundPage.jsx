import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinOff, ArrowLeft, Plane } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6 font-sans text-slate-800">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Animated Icon Container */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 flex items-center justify-center">
            <MapPinOff size={64} className="text-blue-600 animate-bounce" />
            <Plane 
              size={24} 
              className="absolute -top-4 -right-4 text-blue-400 transform -rotate-12 animate-pulse"
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tighter">
            404
          </h1>
          <h2 className="text-3xl font-bold text-slate-900">
            Lost in the Clouds?
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed max-w-sm mx-auto">
            We couldn't find the flight path you're looking for. Let's get you back on track.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            onClick={() => navigate('/')}
            className="cursor-pointer group relative inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Go Back Home</span>
          </button>
        </div>

        {/* Subtle Decorative Elements */}
        <div className="pt-12 text-slate-400 text-sm font-medium tracking-widest uppercase">
          Flight Tracker • Terminal 404
        </div>
      </div>

      {/* Background Decorative Circles */}
      <div className="fixed top-20 left-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -z-10 animate-pulse delay-700" />
    </div>
  );
};

export default NotFoundPage;
