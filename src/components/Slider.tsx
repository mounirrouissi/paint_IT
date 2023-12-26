type SliderProps = {
  label?: any
  value?: number
  min?: number
  max?: number
  onChange: (value: number) => void
  onStart?: () => void
}

export default function Slider(props: SliderProps) {
  const { value, label, min, max, onChange, onStart } = props

  const step = ((max || 100) - (min || 0)) / 100

  return (
    <div className="inline-flex items-center space-x-4 text-black">
  
  <span className="hidden md:block">{label}</span>
  
  
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 hidden xs:block w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>

  
  <input
    className={['appearance-none rounded-lg h-4', 'bg-primary'].join(' ')}
    type="range"
    step={step}
    min={min}
    max={max}
    value={value}
    onPointerDown={onStart}
    onChange={ev => {
      ev.preventDefault()
      ev.stopPropagation()
      onChange(parseInt(ev.currentTarget.value, 10))
    }}
  />
</div>

  )
}
