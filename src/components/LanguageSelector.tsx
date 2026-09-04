import { Languages } from 'lucide-react'
import { useLanguage, type Language } from '../context/LanguageContext'

const languages: Array<{ code: Language; flag: string; key: 'romanian' | 'english' | 'german' | 'hungarian' }> = [
  { code: 'ro', flag: '🇷🇴', key: 'romanian' },
  { code: 'en', flag: '🇺🇸', key: 'english' },
  { code: 'de', flag: '🇩🇪', key: 'german' },
  { code: 'hu', flag: '🇭🇺', key: 'hungarian' },
]

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()
  const current = languages.find(item => item.code === language)!

  return (
    <details className="fixed bottom-24 right-5 z-[6000] w-44 rounded-lg p-1.5 shadow-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glow)' }}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-md px-2.5 py-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        <span className="flex items-center gap-2"><Languages size={16} style={{ color: 'var(--primary)' }} /> {current.flag} {t(current.key)}</span>
      </summary>
      <div className="mt-1 border-t pt-1" style={{ borderColor: 'var(--border-inner)' }}>
        {languages.map(item => (
          <button key={item.code} onClick={() => setLanguage(item.code)} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm" style={{ color: item.code === language ? 'var(--primary)' : 'var(--text-secondary)', background: item.code === language ? 'rgba(0,212,255,0.1)' : 'transparent' }}>
            <span>{item.flag}</span>{t(item.key)}
          </button>
        ))}
      </div>
    </details>
  )
}