import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X, Check, Smartphone } from 'lucide-react';

interface InstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#0E121A] border border-white/[0.12] p-5 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#141924] border border-white/[0.12] flex items-center justify-center text-sky-400 font-display font-bold text-sm shadow-sm">
            AX
          </div>
          <div>
            <h3 className="font-display font-semibold text-base text-white">
              Добавить Axiom на экран
            </h3>
            <p className="text-xs text-slate-400">Быстрый доступ как мини-плагин</p>
          </div>
        </div>

        {isInstalled ? (
          <div className="p-4 rounded-xl bg-emerald-950/25 border border-emerald-500/20 text-center space-y-2">
            <Check className="w-6 h-6 text-emerald-400 mx-auto" />
            <div className="text-xs font-medium text-emerald-300">Приложение уже установлено!</div>
            <div className="text-[11px] text-slate-400">
              Вы можете запускать его прямо с домашнего экрана или из панели браузера.
            </div>
          </div>
        ) : isInstallable ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Установите Axiom на рабочий стол или экран телефона. Приложение будет открываться моментально в отдельном окне без адресной строки браузера.
            </p>

            <button
              onClick={handleInstallClick}
              className="w-full py-2.5 px-4 rounded-lg bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>{installSuccess ? 'Установлено!' : 'Установить в 1 клик'}</span>
            </button>
          </div>
        ) : isIOS ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              На iPhone и iPad для добавления виджета на главный экран:
            </p>
            <div className="space-y-2 p-3 rounded-xl bg-[#141924] border border-white/[0.08] text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1C2333] flex items-center justify-center text-[10px] font-mono text-sky-300 shrink-0">
                  1
                </span>
                <span>
                  Нажмите кнопку <strong className="text-white">«Поделиться»</strong> (иконка со стрелкой внизу Safari).
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1C2333] flex items-center justify-center text-[10px] font-mono text-sky-300 shrink-0">
                  2
                </span>
                <span>
                  Прокрутите вниз и выберите <strong className="text-white">«На экран “Домой”»</strong>.
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2 rounded-lg bg-[#141924] hover:bg-[#1A2232] text-xs font-medium text-slate-200 transition-colors"
            >
              Понятно
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              Чтобы добавить виджет в закладки или на рабочий стол:
            </p>
            <div className="p-3 rounded-xl bg-[#141924] border border-white/[0.08] text-xs text-slate-300 space-y-1.5">
              <div>
                В Chrome/Edge нажмите на иконку <strong className="text-white">«Установить»</strong> в правой части адресной строки (или меню ⋮ &rarr; «Установить Axiom»).
              </div>
              <div className="text-[11px] text-slate-400">
                Либо сохраните страницу в закладки клавишами <kbd className="px-1.5 py-0.5 rounded bg-black/50 border border-white/[0.1] font-mono text-slate-300">Ctrl+D</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-black/50 border border-white/[0.1] font-mono text-slate-300">⌘+D</kbd>.
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2 rounded-lg bg-[#141924] hover:bg-[#1A2232] text-xs font-medium text-slate-200 transition-colors"
            >
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
