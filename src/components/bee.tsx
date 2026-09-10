export function Bee({ className = "", small = false }: { className?: string; small?: boolean }) {
  if (small) return <svg className={className} width="38" height="38" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="20" fill="#ffcf4b"/><ellipse cx="23" cy="20" rx="9" ry="12" transform="rotate(-35 23 20)" fill="white"/><ellipse cx="42" cy="20" rx="9" ry="12" transform="rotate(35 42 20)" fill="white"/><ellipse cx="32" cy="37" rx="21" ry="16" fill="#293e33"/><path d="M25 22v30m13-30v30" stroke="#ffcf4b" strokeWidth="8"/><circle cx="47" cy="32" r="3" fill="#293e33"/></svg>;
  return <svg className={className} viewBox="0 0 320 260" fill="none" aria-hidden="true">
    <ellipse cx="170" cy="237" rx="106" ry="12" fill="#d7a62c" opacity=".18"/>
    <rect x="90" y="207" width="155" height="27" rx="7" fill="#436950"/>
    <path d="M104 211h128v17H104" fill="#fffdf2"/><path d="M112 219h112" stroke="#dbdfcc" strokeWidth="2"/>
    <rect x="68" y="178" width="151" height="30" rx="6" fill="#8c83ba"/>
    <path d="M80 183h128v18H80" fill="#fffdf2"/><path d="M91 192h104" stroke="#e4deec" strokeWidth="2"/>
    <path d="M218 180l21-21M231 186l26-6" stroke="#be9636" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="142" cy="72" rx="27" ry="42" transform="rotate(-39 142 72)" fill="#fffdf1" stroke="#ead493" strokeWidth="2"/>
    <ellipse cx="195" cy="65" rx="25" ry="39" transform="rotate(30 195 65)" fill="#fffdf1" stroke="#ead493" strokeWidth="2"/>
    <path d="M104 129l-18 8 17 9" fill="#2e4435"/>
    <ellipse cx="164" cy="125" rx="66" ry="51" transform="rotate(-12 164 125)" fill="#f6b92e"/>
    <path d="M128 83c-10 26-4 68 17 89M158 76c-10 23-7 70 16 98" stroke="#314834" strokeWidth="17"/>
    <ellipse cx="200" cy="118" rx="38" ry="42" transform="rotate(-12 200 118)" fill="#ffcd49"/>
    <path d="M192 79l-6-18m26 18 8-17" stroke="#314834" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="185" cy="59" r="5" fill="#314834"/><circle cx="222" cy="59" r="5" fill="#314834"/>
    <ellipse cx="192" cy="114" rx="4" ry="6" fill="#314834"/><ellipse cx="215" cy="109" rx="4" ry="6" fill="#314834"/>
    <path d="M197 128q10 9 17-3" stroke="#314834" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="185" cy="126" rx="7" ry="4" fill="#ef9a63" opacity=".65"/><ellipse cx="225" cy="120" rx="7" ry="4" fill="#ef9a63" opacity=".65"/>
    <path d="M167 163l-8 15m29-18 7 16" stroke="#314834" strokeWidth="4" strokeLinecap="round"/>
    <path d="M62 89q-27 42 10 64" stroke="#b89538" strokeWidth="2" strokeDasharray="5 7" strokeLinecap="round"/>
    <path d="M61 59v16m-8-8h16M266 100v16m-8-8h16" stroke="#fff9df" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="252" cy="45" r="5" fill="#d6a735"/><circle cx="62" cy="181" r="4" fill="#fff9df"/>
  </svg>;
}
