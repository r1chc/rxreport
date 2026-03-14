'use client'

import { useState } from 'react'

interface Props {
  text: string
}

const TRUNCATE_LENGTH = 400

export default function BlackBoxWarning({ text }: Props) {
  const [expanded, setExpanded] = useState(false)
  const needsTruncation = text.length > TRUNCATE_LENGTH
  const displayed = expanded || !needsTruncation ? text : text.slice(0, TRUNCATE_LENGTH) + '...'

  return (
    <div className="rounded-xl p-4 mb-6 print-hide" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#dc2626' }}>
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#dc2626' }}>FDA Black Box Warning</span>
            <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: '#dc2626', color: 'white', fontSize: '10px' }}>Boxed Warning</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#7f1d1d' }}>{displayed}</p>
          {needsTruncation && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs mt-2 font-medium underline"
              style={{ color: '#dc2626' }}
            >
              {expanded ? 'Show less' : 'Read full warning'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
