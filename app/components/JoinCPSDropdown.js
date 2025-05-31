'use client'
import { useState, useRef, useEffect } from 'react'
import styles from './JoinCPSDropdown.module.css'

export default function JoinCPSDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  // close on outside click
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const links = [
    {   icon: '/Facebook-joinus.svg',   url: 'https://www.facebook.com/maulanawkhan' },
    {   icon: '/Instagram-joinus.svg',  url: 'https://www.instagram.com/maulanawahiduddinkhan/' },
    {     icon: '/Youtube-joinus.svg',    url: 'https://www.youtube.com/c/CPSInternational' },
    {    icon: '/Whatsapp-joinus.svg',   url: 'https://www.whatsapp.com/channel/0029Va5jZQQ8vd1VVZHFlv23' },
    { icon: '/Twitter-joinus.svg',    url: 'https://x.com/wahiduddinkhan' },
    {      icon: '/Quora-joinus.svg',      url: 'https://www.quora.com/profile/Maulana-Wahiduddin-Khan-1' },
    {   icon: '/Pinterest-joinus.svg',  url: 'https://www.pinterest.com/mwk1125/' },
    {   icon: '/Telegram-joinus.svg',   url: 'https://t.me/maulanawahiduddinkhan' },
  ]

  return (
    <div className={styles.container} ref={ref}>
      <button
        className={styles.button}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        Join us 
      </button>

      <div className={`${styles.menu} ${open ? styles.open : ''}`}>
        <div className={styles.frame}>
          {links.map(l => (
            <a
              key={l.name}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
             className={
                l.name === 'Whatsapp'
                  ? `${styles.item} ${styles.whatsapp}`
                  : styles.item
              }
            >
              <img src={l.icon} alt={l.name} className={styles.icon} />
              {l.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
