'use client';

import React, { useState } from 'react';
import { Upload, DollarSign, TrendingUp, Users, Music2, ShieldCheck, HeartHandshake } from 'lucide-react';

export const ArtistDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'upload' | 'tips'>('analytics');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadGenre, setUploadGenre] = useState('Electronic');
  const [declaredCopyright, setDeclaredCopyright] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declaredCopyright) {
      alert('Please certify that you own the rights to this music.');
      return;
    }
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setUploadTitle('');
    }, 4000);
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto overflow-y-auto h-full select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#20222A]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white">Minion Artist Studio</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-minion-yellow text-black text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Creator
            </span>
          </div>
          <p className="text-minion-textMuted text-sm mt-1">
            Publish royalty-free music, inspect listener geography, and receive direct tips.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center bg-[#18191E] p-1.5 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'analytics' ? 'bg-minion-yellow text-black' : 'text-minion-textMuted hover:text-white'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'upload' ? 'bg-minion-yellow text-black' : 'text-minion-textMuted hover:text-white'
            }`}
          >
            Upload Music
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'tips' ? 'bg-minion-yellow text-black' : 'text-minion-textMuted hover:text-white'
            }`}
          >
            Tips & Earnings
          </button>
        </div>
      </div>

      {/* Tab: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#18191E] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-minion-textMuted">
                <span className="text-xs uppercase font-bold tracking-wider">Monthly Listeners</span>
                <Users className="w-4 h-4 text-minion-yellow" />
              </div>
              <p className="text-2xl font-black text-white">128,450</p>
              <span className="text-xs text-emerald-400 font-semibold">+18.4% from last month</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#18191E] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-minion-textMuted">
                <span className="text-xs uppercase font-bold tracking-wider">Total Streams</span>
                <TrendingUp className="w-4 h-4 text-minion-denim" />
              </div>
              <p className="text-2xl font-black text-white">1,489,200</p>
              <span className="text-xs text-emerald-400 font-semibold">+32.1% this week</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#18191E] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-minion-textMuted">
                <span className="text-xs uppercase font-bold tracking-wider">Catalog Tracks</span>
                <Music2 className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-white">14</p>
              <span className="text-xs text-minion-textMuted">All Creative Commons CC-BY</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#18191E] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-minion-textMuted">
                <span className="text-xs uppercase font-bold tracking-wider">Total Tips Raised</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-400">$3,420.50</p>
              <span className="text-xs text-white/70">From 482 fan supporters</span>
            </div>
          </div>

          {/* Top Listener Countries */}
          <div className="p-6 rounded-2xl bg-[#18191E] border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4">Top Listener Regions</h3>
            <div className="space-y-3">
              {[
                { country: 'United States', percentage: 42 },
                { country: 'United Kingdom', percentage: 21 },
                { country: 'Germany', percentage: 14 },
                { country: 'Japan', percentage: 11 },
                { country: 'Canada', percentage: 7 },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-white">{item.country}</span>
                    <span className="text-minion-yellow">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-minion-denim to-minion-yellow rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Upload */}
      {activeTab === 'upload' && (
        <form onSubmit={handleUploadSubmit} className="max-w-2xl bg-[#18191E] p-6 rounded-2xl border border-white/5 space-y-5">
          <h3 className="text-xl font-bold text-white">Publish New Track to Minion</h3>
          <p className="text-xs text-minion-textMuted">
            Minion automatically converts master audio files to high-fidelity HLS streams (96k, 160k, 320k kbps).
          </p>

          {uploadSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold">
              Track submitted successfully! Transcoding audio pipeline initiated.
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-minion-textMuted mb-2">
              Track Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Banana Sunset Groove"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F12] border border-white/10 text-white focus:border-minion-yellow focus:outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-minion-textMuted mb-2">
                Primary Genre
              </label>
              <select
                value={uploadGenre}
                onChange={(e) => setUploadGenre(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F12] border border-white/10 text-white focus:border-minion-yellow focus:outline-none text-sm"
              >
                <option>Electronic</option>
                <option>Synthwave</option>
                <option>Hip Hop</option>
                <option>Acoustic / Folk</option>
                <option>Chillout</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-minion-textMuted mb-2">
                License
              </label>
              <select className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F12] border border-white/10 text-white focus:border-minion-yellow focus:outline-none text-sm">
                <option>Creative Commons CC-BY 4.0</option>
                <option>Creative Commons CC0 (Public Domain)</option>
                <option>Direct Minion Creator License</option>
              </select>
            </div>
          </div>

          {/* Drag & drop file placeholder */}
          <div className="border-2 border-dashed border-white/10 hover:border-minion-yellow/50 rounded-2xl p-8 text-center cursor-pointer transition-colors">
            <Upload className="w-8 h-8 text-minion-yellow mx-auto mb-2" />
            <p className="text-sm font-bold text-white">Click or drag audio file here</p>
            <p className="text-xs text-minion-textMuted mt-1">Accepts FLAC, WAV, or 320kbps MP3 (up to 150MB)</p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={declaredCopyright}
              onChange={(e) => setDeclaredCopyright(e.target.checked)}
              className="mt-1 accent-minion-yellow rounded w-4 h-4 cursor-pointer"
            />
            <span className="text-xs text-white/80 leading-relaxed">
              I certify that I am the sole author or authorized copyright holder of this recording, and I grant Minion the right to stream this track with zero advertisements.
            </span>
          </label>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-minion-yellow hover:bg-minion-yellowHover text-black font-extrabold text-sm transition-transform hover:scale-[1.01]"
          >
            Upload and Transcode Track
          </button>
        </form>
      )}

      {/* Tab: Tips */}
      {activeTab === 'tips' && (
        <div className="max-w-3xl bg-[#18191E] p-6 rounded-2xl border border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <HeartHandshake className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-xl font-bold text-white">Direct Fan Support & Tipping</h3>
              <p className="text-xs text-minion-textMuted">Minion keeps 0% fees on tips. 100% of fan contributions (minus Stripe processing) go straight to you.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center">
            <div>
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Connected Payout Account</span>
              <p className="text-sm font-bold text-white">Stripe Express (**** 8841)</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">Active</span>
          </div>

          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Recent Supporter Tips</h4>
          <div className="space-y-3">
            {[
              { fan: 'MinionFan99', amount: '$25.00', message: 'Love the Banana Groove track! Keep it up!' },
              { fan: 'CyberGoggle', amount: '$10.00', message: 'Best study music ever!' },
              { fan: 'Anonymous', amount: '$50.00', message: 'Thanks for keeping music ad-free!' },
            ].map((tip, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#0F0F12] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{tip.fan}</span>
                    <span className="text-xs text-emerald-400 font-extrabold">{tip.amount}</span>
                  </div>
                  <p className="text-xs text-minion-textMuted italic mt-0.5">"{tip.message}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
