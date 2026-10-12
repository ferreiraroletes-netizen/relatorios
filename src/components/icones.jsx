// Ícones simplificados das redes (a biblioteca lucide não inclui marcas)
const base = (size) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
})

export const IconInstagram = ({ size = 18 }) => (
  <svg {...base(size)}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></svg>
)

export const IconFacebook = ({ size = 18 }) => (
  <svg {...base(size)}><path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" /></svg>
)

export const IconLinkedin = ({ size = 18 }) => (
  <svg {...base(size)}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10.5V17M8 7.5v.01M11.5 17v-6.5M11.5 13.5c0-1.7 1.2-3 2.7-3s2.3 1 2.3 2.8V17" /></svg>
)

export const IconTiktok = ({ size = 18 }) => (
  <svg {...base(size)}><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.4 2.6 2.2 4.4 5 4.6" /></svg>
)

export const IconYoutube = ({ size = 18 }) => (
  <svg {...base(size)}><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10.5 9.5v5l4.3-2.5z" fill="currentColor" /></svg>
)
