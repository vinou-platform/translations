import React, { useEffect, useMemo, useState } from 'react'

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function flattenObject(obj, prefix = '', out = {}) {
  if (!isPlainObject(obj)) return out

  Object.entries(obj).forEach(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (isPlainObject(value)) {
      out[path] = { kind: 'object', value }
      flattenObject(value, path, out)
    } else {
      out[path] = { kind: Array.isArray(value) ? 'array' : 'leaf', value }
    }
  })

  return out
}

function getAtPath(obj, path) {
  if (!path) return obj
  return path.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), obj)
}

function setAtPath(obj, path, value) {
  const parts = path.split('.')
  let current = obj

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!isPlainObject(current[part])) current[part] = {}
    current = current[part]
  }

  current[parts[parts.length - 1]] = value
}

function deleteAtPath(obj, path) {
  const parts = path.split('.')
  let current = obj

  for (let i = 0; i < parts.length - 1; i++) {
    current = current?.[parts[i]]
    if (!current) return
  }

  delete current[parts[parts.length - 1]]
}

function cleanupEmptyObjects(obj) {
  if (!isPlainObject(obj)) return

  Object.keys(obj).forEach((key) => {
    if (isPlainObject(obj[key])) {
      cleanupEmptyObjects(obj[key])
      if (Object.keys(obj[key]).length === 0) {
        delete obj[key]
      }
    }
  })
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function lastSegment(path) {
  const parts = path.split('.')
  return parts[parts.length - 1]
}

function signature(value) {
  return `${typeof value}::${String(value)}`
}

function compareFiles(sourceObj, targetObj) {
  const sourceMap = flattenObject(sourceObj)
  const targetMap = flattenObject(targetObj)

  const targetLeaves = Object.entries(targetMap)
    .filter(([, meta]) => meta.kind === 'leaf')
    .map(([path, meta]) => ({ path, value: meta.value }))

  const targetByKey = new Map()
  const targetByValue = new Map()

  targetLeaves.forEach((item) => {
    const key = lastSegment(item.path)
    const sig = signature(item.value)

    if (!targetByKey.has(key)) targetByKey.set(key, [])
    if (!targetByValue.has(sig)) targetByValue.set(sig, [])

    targetByKey.get(key).push(item.path)
    targetByValue.get(sig).push(item.path)
  })

  const diffs = []

  Object.entries(sourceMap).forEach(([path, sourceMeta]) => {
    const targetMeta = targetMap[path]

    if (!targetMeta) {
      let candidatePath = null

      if (sourceMeta.kind === 'leaf') {
        const sameKeyCandidate = (targetByKey.get(lastSegment(path)) || []).find((p) => p !== path)
        const sameValueCandidate = (targetByValue.get(signature(sourceMeta.value)) || []).find((p) => p !== path)
        candidatePath = sameKeyCandidate || sameValueCandidate || null
      }

      diffs.push({
        type: candidatePath ? 'moved' : 'missing',
        path,
        targetPath: candidatePath,
        sourceKind: sourceMeta.kind,
        sourceValue: sourceMeta.kind === 'leaf' ? sourceMeta.value : sourceMeta.value,
        targetValue: candidatePath ? getAtPath(targetObj, candidatePath) : undefined,
      })
      return
    }

    if (sourceMeta.kind !== targetMeta.kind) {
      diffs.push({
        type: 'type_mismatch',
        path,
        sourceKind: sourceMeta.kind,
        targetKind: targetMeta.kind,
        sourceValue: sourceMeta.value,
        targetValue: targetMeta.value,
      })
    }
  })

  Object.entries(targetMap).forEach(([path, targetMeta]) => {
    if (!sourceMap[path]) {
      diffs.push({
        type: 'extra',
        path,
        sourceKind: undefined,
        targetKind: targetMeta.kind,
        targetValue: targetMeta.kind === 'leaf' ? targetMeta.value : targetMeta.value,
      })
    }
  })

  return {
    diffs,
    summary: {
      total: diffs.length,
      missing: diffs.filter((d) => d.type === 'missing').length,
      moved: diffs.filter((d) => d.type === 'moved').length,
      extra: diffs.filter((d) => d.type === 'extra').length,
      mismatch: diffs.filter((d) => d.type === 'type_mismatch').length,
    },
  }
}

function Badge({ type }) {
  const styles = {
    missing: { background: '#dcfce7', color: '#166534', label: 'missing' },
    moved: { background: '#fef3c7', color: '#92400e', label: 'moved/renamed' },
    extra: { background: '#fee2e2', color: '#991b1b', label: 'extra' },
    type_mismatch: { background: '#ede9fe', color: '#5b21b6', label: 'type mismatch' },
  }

  const item = styles[type] || { background: '#e5e7eb', color: '#111827', label: type }

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: item.background,
        color: item.color,
      }}
    >
      {item.label}
    </span>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 18,
        padding: 18,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 800, color: '#111827' }}>{value}</div>
      <div style={{ marginTop: 6, fontSize: 13, color: '#6b7280' }}>{label}</div>
    </div>
  )
}

function JsonBox({ title, value, tone = 'neutral' }) {
  const backgrounds = {
    neutral: '#f8fafc',
    source: '#f0fdf4',
    target: '#fff7ed',
  }

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 18,
        background: backgrounds[tone],
        padding: 16,
        minHeight: 180,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 10, color: '#111827' }}>{title}</div>
      <pre
        style={{
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontSize: 12,
          lineHeight: 1.5,
          color: '#334155',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        }}
      >
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}

export default function App() {
  const [translations, setTranslations] = useState({})
  const [sourceLang, setSourceLang] = useState('de')
  const [targetLang, setTargetLang] = useState('en')
  const [drafts, setDrafts] = useState({})
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [manualValue, setManualValue] = useState('')
  const [saveState, setSaveState] = useState('idle')

  useEffect(() => {
    fetch('/api/translations')
      .then((res) => res.json())
      .then((data) => setTranslations(data))
  }, [])

  const langs = Object.keys(translations)
  const sourceData = translations[sourceLang] || {}
  const targetData = drafts[targetLang] || translations[targetLang] || {}

  useEffect(() => {
    if (translations[targetLang] && !drafts[targetLang]) {
      setDrafts((prev) => ({
        ...prev,
        [targetLang]: deepClone(translations[targetLang]),
      }))
    }
  }, [translations, targetLang, drafts])

  const comparison = useMemo(() => compareFiles(sourceData, targetData), [sourceData, targetData])

  const visibleDiffs = useMemo(() => {
    return comparison.diffs.filter((diff) => {
      const filterMatch = filter === 'all' ? true : diff.type === filter
      const q = search.trim().toLowerCase()
      const haystack = `${diff.path} ${diff.targetPath || ''} ${String(diff.sourceValue || '')} ${String(diff.targetValue || '')}`.toLowerCase()
      const searchMatch = q ? haystack.includes(q) : true
      return filterMatch && searchMatch
    })
  }, [comparison, filter, search])

  const selectedDiff = visibleDiffs[selectedIndex] || null

  useEffect(() => {
    setSelectedIndex(0)
  }, [filter, search, sourceLang, targetLang])

  useEffect(() => {
    if (!selectedDiff) {
      setManualValue('')
      return
    }

    const currentTargetValue = getAtPath(targetData, selectedDiff.path)
    setManualValue(typeof currentTargetValue === 'string' ? currentTargetValue : '')
  }, [selectedDiff, targetData])

  function updateDraft(mutator) {
    const next = deepClone(targetData)
    mutator(next)
    cleanupEmptyObjects(next)
    setDrafts((prev) => ({ ...prev, [targetLang]: next }))
  }

  function copyFromSource(path) {
    const sourceValue = getAtPath(sourceData, path)
    updateDraft((draft) => setAtPath(draft, path, deepClone(sourceValue)))
  }

  function moveToSourcePath(sourcePath, oldTargetPath) {
    const value = getAtPath(targetData, oldTargetPath)
    updateDraft((draft) => {
      setAtPath(draft, sourcePath, deepClone(value))
      deleteAtPath(draft, oldTargetPath)
    })
  }

  function removeExtra(path) {
    updateDraft((draft) => deleteAtPath(draft, path))
  }

  function saveManualValue() {
    if (!selectedDiff) return
    if (selectedDiff.sourceKind !== 'leaf') return

    updateDraft((draft) => setAtPath(draft, selectedDiff.path, manualValue))
  }

  function applyAllMissing() {
    const missing = comparison.diffs.filter((d) => d.type === 'missing')
    updateDraft((draft) => {
      missing.forEach((diff) => {
        setAtPath(draft, diff.path, deepClone(getAtPath(sourceData, diff.path)))
      })
    })
  }

  async function saveTarget() {
    setSaveState('saving')
    const response = await fetch('/api/save-translation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lang: targetLang,
        data: targetData,
      }),
    })

    if (!response.ok) {
      setSaveState('error')
      window.alert('Speichern fehlgeschlagen')
      return
    }

    setTranslations((prev) => ({
      ...prev,
      [targetLang]: deepClone(targetData),
    }))
    setSaveState('saved')
    window.setTimeout(() => setSaveState('idle'), 1500)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
        color: '#111827',
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 20,
            flexWrap: 'wrap',
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.03em' }}>Translation Structure Diff Tool</div>
            <div style={{ marginTop: 8, color: '#475569', maxWidth: 760, lineHeight: 1.5 }}>
              Compare two language files, visualize structural differences, copy missing keys, resolve moved keys, and edit target values directly.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={applyAllMissing} style={styles.secondaryButton}>Apply all missing keys</button>
            <button onClick={saveTarget} style={styles.primaryButton}>
              {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : 'Save target'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, marginBottom: 24 }}>
          <SummaryCard label="Missing in target" value={comparison.summary.missing} />
          <SummaryCard label="Moved / renamed" value={comparison.summary.moved} />
          <SummaryCard label="Extra in target" value={comparison.summary.extra} />
          <SummaryCard label="Type mismatches" value={comparison.summary.mismatch} />
        </div>

        <div style={styles.panel}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div style={styles.label}>Source</div>
              <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} style={styles.select}>
                {langs.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={styles.label}>Target</div>
              <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} style={styles.select}>
                {langs.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={styles.label}>Search</div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search path or value"
                style={styles.input}
              />
            </div>

            <div>
              <div style={styles.label}>Filter</div>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.select}>
                <option value="all">All</option>
                <option value="missing">Missing</option>
                <option value="moved">Moved / renamed</option>
                <option value="extra">Extra</option>
                <option value="type_mismatch">Type mismatch</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.2fr', gap: 20, marginTop: 20 }}>
          <div style={styles.panel}>
            <div style={styles.sectionTitle}>Diff list</div>
            <div style={{ maxHeight: 650, overflow: 'auto', paddingRight: 4 }}>
              {visibleDiffs.length === 0 && (
                <div style={styles.emptyState}>No differences found for the current filter.</div>
              )}

              {visibleDiffs.map((diff, index) => (
                <button
                  key={`${diff.type}-${diff.path}-${index}`}
                  onClick={() => setSelectedIndex(index)}
                  style={{
                    ...styles.diffCard,
                    borderColor: index === selectedIndex ? '#111827' : '#e5e7eb',
                    background: index === selectedIndex ? '#f8fafc' : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Badge type={diff.type} />
                        <code style={styles.code}>{diff.path}</code>
                      </div>

                      <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
                        {diff.sourceKind === 'leaf' ? 'Leaf value' : diff.sourceKind === 'object' ? 'Structure node' : 'Target-only key'}
                      </div>

                      {diff.targetPath && (
                        <div style={{ marginTop: 10, fontSize: 12, color: '#64748b' }}>
                          Suggested match: <code style={styles.inlineCode}>{diff.targetPath}</code>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>#{index + 1}</div>
                  </div>

                  {typeof diff.sourceValue === 'string' && (
                    <div style={{ ...styles.diffPreview, background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 6 }}>Source</div>
                      <div style={styles.previewText}>{diff.sourceValue}</div>
                    </div>
                  )}

                  {typeof diff.targetValue === 'string' && (
                    <div style={{ ...styles.diffPreview, background: '#fff7ed', borderColor: '#fed7aa' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#9a3412', marginBottom: 6 }}>Target candidate</div>
                      <div style={styles.previewText}>{diff.targetValue}</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 20 }}>
            <div style={styles.panel}>
              <div style={styles.sectionTitle}>Inspector</div>

              {!selectedDiff ? (
                <div style={styles.emptyState}>Select a difference from the list.</div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
                    <Badge type={selectedDiff.type} />
                    <code style={styles.code}>{selectedDiff.path}</code>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                    <JsonBox title="Source" value={getAtPath(sourceData, selectedDiff.path)} tone="source" />
                    <JsonBox title="Target" value={getAtPath(targetData, selectedDiff.path)} tone="target" />
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
                    {selectedDiff.type === 'missing' && (
                      <button onClick={() => copyFromSource(selectedDiff.path)} style={styles.primaryButton}>Copy from source</button>
                    )}

                    {selectedDiff.type === 'moved' && selectedDiff.targetPath && (
                      <button onClick={() => moveToSourcePath(selectedDiff.path, selectedDiff.targetPath)} style={styles.primaryButton}>Move target entry here</button>
                    )}

                    {selectedDiff.type === 'extra' && (
                      <button onClick={() => removeExtra(selectedDiff.path)} style={styles.dangerButton}>Remove extra key</button>
                    )}

                    {selectedDiff.type === 'type_mismatch' && (
                      <button onClick={() => copyFromSource(selectedDiff.path)} style={styles.primaryButton}>Replace with source structure</button>
                    )}
                  </div>

                  {selectedDiff.sourceKind === 'leaf' ? (
                    <div>
                      <div style={styles.label}>Manual target value</div>
                      <textarea
                        value={manualValue}
                        onChange={(e) => setManualValue(e.target.value)}
                        placeholder="Enter or correct the translated value"
                        style={styles.textarea}
                      />
                      <div style={{ marginTop: 10 }}>
                        <button onClick={saveManualValue} style={styles.secondaryButton}>Save manual value</button>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.emptyState}>
                      This key is a structure node. You cannot assign a direct value here. The target must keep the same nested structure as the source.
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={styles.panel}>
              <div style={styles.sectionTitle}>Working target preview</div>
              <div style={styles.jsonPanel}>
                <pre style={styles.jsonPre}>{JSON.stringify(targetData, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  panel: {
    background: '#ffffffcc',
    backdropFilter: 'blur(8px)',
    border: '1px solid #e5e7eb',
    borderRadius: 24,
    padding: 20,
    boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 14,
    border: '1px solid #cbd5e1',
    background: '#fff',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    minWidth: 150,
    padding: '12px 14px',
    borderRadius: 14,
    border: '1px solid #cbd5e1',
    background: '#fff',
    fontSize: 14,
    outline: 'none',
  },
  textarea: {
    width: '100%',
    minHeight: 130,
    borderRadius: 18,
    border: '1px solid #cbd5e1',
    padding: 14,
    fontSize: 14,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    resize: 'vertical',
  },
  primaryButton: {
    border: 0,
    background: '#111827',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: 14,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(17,24,39,0.16)',
  },
  secondaryButton: {
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: '#111827',
    padding: '12px 16px',
    borderRadius: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  dangerButton: {
    border: 0,
    background: '#b91c1c',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  diffCard: {
    width: '100%',
    textAlign: 'left',
    border: '1px solid #e5e7eb',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  diffPreview: {
    marginTop: 12,
    border: '1px solid',
    borderRadius: 14,
    padding: 12,
  },
  previewText: {
    fontSize: 13,
    color: '#334155',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    lineHeight: 1.45,
  },
  code: {
    fontSize: 12,
    color: '#0f172a',
    wordBreak: 'break-all',
    background: '#e2e8f0',
    borderRadius: 10,
    padding: '4px 8px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  inlineCode: {
    background: '#e2e8f0',
    borderRadius: 8,
    padding: '2px 6px',
    color: '#0f172a',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  emptyState: {
    border: '1px dashed #cbd5e1',
    borderRadius: 18,
    padding: 20,
    color: '#64748b',
    background: '#f8fafc',
  },
  jsonPanel: {
    maxHeight: 360,
    overflow: 'auto',
    background: '#020617',
    borderRadius: 18,
    padding: 16,
  },
  jsonPre: {
    margin: 0,
    color: '#e2e8f0',
    fontSize: 12,
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
}
