import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as XLSX from 'xlsx';

interface PracticeLog {
  id: string;
  date: string;
  category: string;
  duration: number;
  notes: string;
}

interface ExcelReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  practiceLogs: PracticeLog[];
  interviews?: any[];
  codingProfile?: any;
}

export function ExcelReportModal({ isOpen, onClose, practiceLogs, interviews = [], codingProfile = null }: ExcelReportModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const getDatesBetween = (startStr: string, endStr: string) => {
    const dates = [];
    let currentDate = new Date(startStr);
    const end = new Date(endStr);
    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const handleDownload = () => {
    setError(null);

    if (!startDate || !endDate) {
      setError('Please select both a start date and an end date.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setError('Start date cannot be after end date.');
      return;
    }

    const dates = getDatesBetween(startDate, endDate);

    // Aggregate data for each day
    const excelData = dates.map(dateStr => {
      // 1. Practice Logs & Duration
      const logsForDate = practiceLogs.filter(l => l.date === dateStr);
      const totalDuration = logsForDate.reduce((sum, l) => sum + l.duration, 0);

      // 2. Coding Submissions & Topics
      let solvedCount = 0;
      const topics = new Set<string>();
      
      if (codingProfile) {
        ['leetcode', 'codeforces', 'codechef'].forEach(platform => {
          if (codingProfile[platform]) {
            // Daily submission count
            if (codingProfile[platform].dailySubmissions && codingProfile[platform].dailySubmissions[dateStr]) {
              solvedCount += codingProfile[platform].dailySubmissions[dateStr];
            }
            // Topics from recent submissions
            if (codingProfile[platform].recentSubmissions) {
              codingProfile[platform].recentSubmissions.forEach((sub: any) => {
                const subDate = sub.timestamp ? new Date(sub.timestamp * 1000).toISOString().split('T')[0] : '';
                if (subDate === dateStr) {
                  if (sub.topic) topics.add(sub.topic);
                  else if (sub.title) topics.add(sub.title);
                  else if (sub.problem) topics.add(sub.problem);
                }
              });
            }
          }
        });
      }

      // Add topics/notes from coding practice logs
      logsForDate.forEach(l => {
        if (l.category === 'coding' && l.notes) {
          topics.add(l.notes);
        }
      });

      // 3. Interviews
      const interviewsForDate = interviews.filter(i => {
        return i.createdAt && new Date(i.createdAt).toISOString().split('T')[0] === dateStr;
      });

      let interviewRole = "None";
      let interviewScore = "N/A";
      let avgScoreNum = 0;

      if (interviewsForDate.length > 0) {
        interviewRole = Array.from(new Set(interviewsForDate.map(i => i.role))).join(", ");
        
        let totalScore = 0;
        let validScores = 0;
        interviewsForDate.forEach(i => {
          if (i.report) {
             const avg = ((i.report.technicalScore || 0) + (i.report.communicationScore || 0) + (i.report.confidenceScore || 0)) / 3;
             totalScore += avg;
             validScores++;
          }
        });
        if (validScores > 0) {
          avgScoreNum = Math.round(totalScore / validScores);
          interviewScore = `${avgScoreNum}/100`;
        } else {
          interviewScore = "Pending Evaluation";
        }
      }

      // 4. Overall Performance Calculation
      let performance = "Needs Activity";
      let scorePoints = 0;
      scorePoints += solvedCount * 10;
      if (avgScoreNum > 0) scorePoints += (avgScoreNum * 0.5);
      scorePoints += (totalDuration / 10); // 1 point per 10 mins

      if (scorePoints > 80) performance = "Excellent";
      else if (scorePoints > 40) performance = "Good";
      else if (scorePoints > 15) performance = "Average";
      else if (scorePoints > 0) performance = "Fair";

      return {
        Date: dateStr,
        'Coding Questions Solved': solvedCount,
        'Topics Covered': Array.from(topics).join(" | ") || "None",
        'Mock Interview Role': interviewRole,
        'Interview Score': interviewScore,
        'Duration (Minutes)': totalDuration,
        'Overall Performance': performance
      };
    });

    if (excelData.length === 0) {
      setError('No performance records found in the selected date range.');
      return;
    }

    // Generate Excel file
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Detailed_Performance');

    // Auto-size columns
    const wscols = [
      { wch: 15 }, // Date
      { wch: 25 }, // Coding Questions Solved
      { wch: 50 }, // Topics Covered
      { wch: 30 }, // Mock Interview Role
      { wch: 18 }, // Interview Score
      { wch: 18 }, // Duration (Minutes)
      { wch: 22 }  // Overall Performance
    ];
    worksheet['!cols'] = wscols;

    const fileName = `Detailed_Performance_${startDate}_to_${endDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-file-excel text-zinc-900 dark:text-white"></i>
            Detailed Performance Report
          </h2>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Select a date range to download a comprehensive daily breakdown of your coding, interviews, and practice durations.
          </p>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
                Start Date
              </label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
                End Date
              </label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleDownload}
              className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors shadow-sm shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-download"></i>
              Download .xlsx
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
