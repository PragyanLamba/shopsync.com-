import { motion } from 'framer-motion'

export default function GlowingOrb({ isTyping = false, size = 'md' }) {
  const dimensions = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  }

  const pulseScale = isTyping ? [1, 1.15, 1] : [1, 1.05, 1]
  const pulseDuration = isTyping ? 1.5 : 3

  return (
    <div className={`relative flex items-center justify-center ${dimensions[size]}`}>
      {/* Outer Glowing Ring */}
      <motion.div
        animate={{
          rotate: 360,
          scale: pulseScale
        }}
        transition={{
          rotate: { repeat: Infinity, duration: 10, ease: 'linear' },
          scale: { repeat: Infinity, duration: pulseDuration, ease: 'easeInOut' }
        }}
        className="absolute inset-0 rounded-full border border-dashed border-accent opacity-60"
        style={{
          boxShadow: '0 0 15px rgba(0, 245, 255, 0.4), inset 0 0 10px rgba(0, 245, 255, 0.2)'
        }}
      />

      {/* Middle Glowing Field */}
      <motion.div
        animate={{
          scale: pulseScale,
          rotate: -360
        }}
        transition={{
          scale: { repeat: Infinity, duration: pulseDuration, ease: 'easeInOut' },
          rotate: { repeat: Infinity, duration: 15, ease: 'linear' }
        }}
        className="absolute w-[85%] h-[85%] rounded-full border border-primary opacity-80"
        style={{
          boxShadow: '0 0 20px rgba(108, 99, 255, 0.5), inset 0 0 10px rgba(108, 99, 255, 0.3)'
        }}
      />

      {/* Inner Solid Gradient Core */}
      <motion.div
        animate={{
          scale: isTyping ? [0.9, 1.08, 0.9] : [1, 1.02, 1]
        }}
        transition={{
          repeat: Infinity,
          duration: isTyping ? 1.2 : 2.5,
          ease: 'easeInOut'
        }}
        className="relative w-[65%] h-[65%] rounded-full bg-gradient-to-tr from-primary via-accent to-secondary"
        style={{
          boxShadow: '0 0 25px rgba(0, 245, 255, 0.8), inset 0 0 5px rgba(255, 255, 255, 0.5)'
        }}
      />

      {/* Inner core accent dot */}
      <div className="absolute w-2.5 h-2.5 rounded-full bg-white opacity-90 blur-[1px]" />
    </div>
  )
}
