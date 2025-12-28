
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Chapter, DailyLog, ThesisSettings } from './types';
import { EditableText } from './components/EditableText';
import { ProgressBar } from './components/ProgressBar';
import { 
  Plus, Trash2, ChevronDown, ChevronUp, History, Layout, 
  BookOpen, BarChart3, Settings2, 
  X, Clock, Info, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';

// 升级键名以确保使用全新的存储空间
const STORAGE_KEY = 'phd_thesis_v5_final_stable';

interface ThesisData {
  chapters: Chapter[];
  logs: DailyLog[];
  settings: ThesisSettings;
}

const DEFAULT_DATA: ThesisData = {
  chapters: [
    { id: '1', title: '第一章 绪论', targetWords: 10000, currentWords: 2500, targetFigures: 5, currentFigures: 2, formattingProgress: 40, startDate: '2024-01-01', endDate: '2024-03-31' },
  ],
  logs: [
    { id: 'demo-1', date: new Date().toISOString().split('T')[0], deltaWords: 500, note: '完成了绪论的基本框架编写。' }
  ],
  settings: {
    totalGoal: 80000,
    themeColor: '#3b82f6',
    deadline: '2025-12-31'
  }
};

const App: React.FC = () => {
  // 1. 初始化数据
  const [data, setData] = useState<ThesisData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.chapters)) return parsed;
      }
    } catch (e) {
      console.error("加载数据失败:", e);
    }
    return DEFAULT_DATA;
  });

  const [isMinimized, setIsMinimized] = useState(false);
  const [isLogExpanded, setIsLogExpanded] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'ready' | 'saving' | 'error'>('ready');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  // 2. 核心同步逻辑
  const performSave = useCallback((updatedData: ThesisData) => {
    setSaveStatus('saving');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      // 故意留一点延迟，让用户能看到“同步中”的反馈
      setTimeout(() => setSaveStatus('ready'), 800);
    } catch (e) {
      setSaveStatus('error');
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    performSave(data);
  }, [data, performSave]);

  // 3. 数据计算
  const totalCurrentWords = useMemo(() => 
    data.chapters.reduce((acc, c) => acc + (Number(c.currentWords) || 0), 0), 
    [data.chapters]
  );

  const overallProgress = (totalCurrentWords / (data.settings.totalGoal || 1)) * 100;

  const daysRemaining = useMemo(() => {
    const today = new Date();
    const deadlineDate = new Date(data.settings.deadline);
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [data.settings.deadline]);

  // --- 操作函数 ---

  const addChapter = () => {
    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: '新章节 (双击修改)',
      targetWords: 5000,
      currentWords: 0,
      targetFigures: 0,
      currentFigures: 0,
      formattingProgress: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    };
    setData(prev => ({ ...prev, chapters: [...prev.chapters, newChapter] }));
  };

  const updateChapter = (id: string, updates: Partial<Chapter>) => {
    setData(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const deleteChapter = (id: string) => {
    if (window.confirm('确定要删除这一章节吗？此操作无法撤销。')) {
      setData(prev => ({
        ...prev,
        chapters: prev.chapters.filter(c => c.id !== id)
      }));
    }
  };

  const addDailyLog = () => {
    const newLog: DailyLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      deltaWords: 0,
      note: '输入今天的写作笔记...'
    };
    setData(prev => ({ ...prev, logs: [newLog, ...prev.logs] }));
    setIsLogExpanded(true);
  };

  const updateLog = (id: string, updates: Partial<DailyLog>) => {
    setData(prev => ({
      ...prev,
      logs: prev.logs.map(l => l.id === id ? { ...l, ...updates } : l)
    }));
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `论文进度备份_${new Date().toLocaleDateString()}.json`;
    a.click();
  };

  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-all text-blue-400 gap-3"
      >
        <BarChart3 size={40} className="animate-pulse" />
        <span className="text-xs font-bold tracking-widest opacity-60">点击展开进度面板</span>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-white flex flex-col overflow-hidden select-none text-slate-900">
      {/* 顶部标题栏 */}
      <div className="p-3 bg-slate-900 text-white flex justify-between items-center shrink-0 shadow-xl z-30">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-inner">
            <BookOpen size={16} />
          </div>
          <h1 className="text-sm font-black tracking-tight">博士论文进度追踪器</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* 核心反馈：保存状态指示灯 */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-300 ${
            saveStatus === 'saving' ? 'bg-blue-900/40 border-blue-500/50' : 
            saveStatus === 'error' ? 'bg-red-900/40 border-red-500/50' : 
            'bg-emerald-900/40 border-emerald-500/50'
          }`}>
            {saveStatus === 'saving' ? (
              <RefreshCw size={12} className="text-blue-400 animate-spin" />
            ) : saveStatus === 'error' ? (
              <AlertCircle size={12} className="text-red-400" />
            ) : (
              <CheckCircle2 size={12} className="text-emerald-400" />
            )}
            <span className="text-[10px] font-bold">
              {saveStatus === 'saving' ? '正在同步' : saveStatus === 'error' ? '同步出错' : '数据已就绪'}
            </span>
          </div>

          <div className="flex items-center gap-1 border-l border-white/10 pl-2">
            <button onClick={() => setShowSettings(true)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <Settings2 size={16} />
            </button>
            <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronDown size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 bg-slate-50">
        {/* 总进度总览 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
          <div className="flex justify-between items-end mb-4">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">总体写作进度</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 tabular-nums">{totalCurrentWords.toLocaleString()}</span>
                <div className="text-xs text-slate-400 font-bold flex items-center gap-1">
                  / <EditableText 
                    value={data.settings.totalGoal} 
                    type="number" 
                    onSave={(val) => setData(prev => ({...prev, settings: {...prev.settings, totalGoal: Number(val) || 0}}))}
                    className="text-slate-600 underline decoration-blue-200"
                  />
                  <span>字</span>
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">距离截止日期</p>
              <EditableText 
                value={data.settings.deadline} 
                type="date" 
                onSave={(val) => setData(prev => ({...prev, settings: {...prev.settings, deadline: val}}))}
                className="text-xs font-black text-slate-800"
              />
              <div className={`text-[10px] font-black px-2.5 py-1 rounded-full mt-2 inline-block ${daysRemaining > 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                {daysRemaining > 0 ? `还剩 ${daysRemaining} 天` : '任务已逾期'}
              </div>
            </div>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              style={{ width: `${Math.min(100, overallProgress)}%` }}
            />
          </div>
        </div>

        {/* 章节详情 */}
        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Layout size={14} className="text-blue-500" /> 章节进度看板
            </h2>
            <button 
              onClick={addChapter} 
              className="bg-blue-600 text-white px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 hover:shadow-lg active:scale-95 transition-all"
            >
              <Plus size={12} /> 添加章节
            </button>
          </div>

          <div className="space-y-4">
            {data.chapters.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                <p className="text-slate-400 text-sm font-medium">还没有开始任何章节？点击右上角加号开始吧 ✍️</p>
              </div>
            ) : (
              data.chapters.map((chapter) => (
                <div key={chapter.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-400 transition-all shadow-sm group">
                  <div className="flex justify-between items-start mb-4">
                    <EditableText 
                      value={chapter.title} 
                      onSave={(val) => updateChapter(chapter.id, { title: val })}
                      className="text-base font-black text-slate-800"
                    />
                    <button 
                      onClick={() => deleteChapter(chapter.id)} 
                      className="text-slate-200 hover:text-red-500 p-1 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[10px] text-slate-500 mb-6 bg-slate-50 rounded-xl px-3 py-2 font-bold">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-slate-400" />
                      <EditableText value={chapter.startDate} type="date" onSave={(v) => updateChapter(chapter.id, { startDate: v })} />
                      <span className="opacity-30">至</span>
                      <EditableText value={chapter.endDate} type="date" onSave={(v) => updateChapter(chapter.id, { endDate: v })} />
                    </div>
                  </div>

                  <div className="space-y-5">
                     <ProgressBar 
                       label="已写字数" 
                       current={chapter.currentWords} 
                       target={chapter.targetWords} 
                       colorClass="bg-blue-600"
                       onCurrentSave={(v) => updateChapter(chapter.id, { currentWords: Number(v) || 0 })}
                       onTargetSave={(v) => updateChapter(chapter.id, { targetWords: Number(v) || 0 })}
                     />
                     <ProgressBar 
                       label="插入图表" 
                       current={chapter.currentFigures} 
                       target={chapter.targetFigures} 
                       colorClass="bg-amber-500"
                       onCurrentSave={(v) => updateChapter(chapter.id, { currentFigures: Number(v) || 0 })}
                       onTargetSave={(v) => updateChapter(chapter.id, { targetFigures: Number(v) || 0 })}
                     />
                     <ProgressBar 
                       label="格式排版" 
                       current={chapter.formattingProgress} 
                       target={100} 
                       colorClass="bg-emerald-500" 
                       suffix="%" 
                       onCurrentSave={(v) => updateChapter(chapter.id, { formattingProgress: Number(v) || 0 })}
                     />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 写作日志 */}
      <div className="border-t border-slate-200 bg-white shadow-2xl z-20">
        <button 
          onClick={() => setIsLogExpanded(!isLogExpanded)}
          className="w-full p-4 flex justify-between items-center text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2.5 font-black text-xs uppercase tracking-widest">
            <History size={16} className="text-indigo-600" /> 每日写作日志 ({data.logs.length})
          </div>
          <div className="flex items-center gap-4">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all active:scale-90" 
                 onClick={(e) => { e.stopPropagation(); addDailyLog(); }}>
              <Plus size={18} />
            </div>
            {isLogExpanded ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronUp size={20} className="text-slate-400" />}
          </div>
        </button>
        {isLogExpanded && (
          <div className="max-h-[35vh] overflow-y-auto p-4 pt-0 space-y-3 bg-slate-50 border-t border-slate-100">
            {data.logs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">今天写了点什么吗？记录下来吧 ✨</div>
            ) : (
              data.logs.map((log) => (
                <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-indigo-200">
                  <div className="flex justify-between items-center mb-3 border-b border-slate-50 pb-2">
                    <EditableText value={log.date} type="date" onSave={(v) => updateLog(log.id, { date: v })} className="text-[11px] font-bold text-slate-400" />
                    <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${log.deltaWords >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {log.deltaWords >= 0 ? '+' : ''}
                      <EditableText value={log.deltaWords} type="number" onSave={(v)=>updateLog(log.id, {deltaWords: Number(v) || 0})} /> 
                      <span className="ml-1 opacity-70">字</span>
                    </span>
                  </div>
                  <EditableText value={log.note} onSave={(v) => updateLog(log.id, { note: v })} className="text-xs text-slate-600 leading-relaxed block italic font-medium" />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex flex-col justify-end">
           <div className="bg-white rounded-t-[32px] shadow-2xl p-8 flex flex-col animate-in slide-in-from-bottom duration-300 max-w-lg mx-auto w-full">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">配置中心</h2>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
             </div>
             
             <div className="space-y-8 mb-8">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">数据安全</p>
                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={exportData} className="bg-slate-900 text-white py-4 rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95">下载本地备份</button>
                      <button onClick={() => fileInputRef.current?.click()} className="bg-white text-slate-900 border border-slate-200 py-4 rounded-2xl text-sm font-black hover:bg-slate-50 transition-colors">恢复备份数据</button>
                      <input type="file" ref={fileInputRef} onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (re) => {
                            try {
                              const content = JSON.parse(re.target?.result as string);
                              if (confirm('导入后将覆盖当前进度，确定吗？')) setData(content);
                            } catch (err) { alert('无效的文件格式'); }
                          };
                          reader.readAsText(file);
                        }
                      }} accept=".json" className="hidden" />
                   </div>
                </div>

                <div className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">截稿截止日期</label>
                    <input 
                      type="date" 
                      value={data.settings.deadline} 
                      onChange={(e) => setData(prev => ({...prev, settings: {...prev.settings, deadline: e.target.value}}))}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">论文总目标字数</label>
                    <input 
                      type="number" 
                      value={data.settings.totalGoal} 
                      onChange={(e) => setData(prev => ({...prev, settings: {...prev.settings, totalGoal: Number(e.target.value) || 0}}))}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-black outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
             </div>
             
             <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 items-start border border-amber-100 mb-6">
                <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  数据实时保存在浏览器缓存中。请注意定期下载备份文件，以免清理浏览器导致进度丢失。
                </p>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
