import { motion } from 'framer-motion'

export default function SkeletonLoader({ type = 'results', count = 4 }) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const childVariants = {
    hidden: { opacity: 0.4, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        yoyo: Infinity,
        duration: 0.8
      }
    }
  }

  if (type === 'chat') {
    return (
      <div className="flex space-x-2 p-4 max-w-[200px] glass rounded-2xl rounded-tl-none">
        <span className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2.5 h-2.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    )
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          variants={childVariants}
          className="relative glass rounded-2xl p-5 border border-primary/10 overflow-hidden"
        >
          {/* Pulsing overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />

          {/* Favicon & Site Name placeholder */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
            <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
          </div>

          {/* Product Title placeholder */}
          <div className="h-5 bg-white/10 rounded w-full mb-3 animate-pulse" />
          <div className="h-5 bg-white/10 rounded w-2/3 mb-6 animate-pulse" />

          {/* Badges placeholder */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="h-6 w-16 bg-accent/10 rounded-full animate-pulse" />
            <div className="h-6 w-24 bg-primary/10 rounded-full animate-pulse" />
            <div className="h-6 w-20 bg-white/5 rounded-full animate-pulse" />
          </div>

          {/* Price & Button placeholder */}
          <div className="flex justify-between items-center pt-2 border-t border-white/5">
            <div className="h-6 w-16 bg-white/20 rounded animate-pulse" />
            <div className="h-9 w-24 bg-primary/20 rounded-lg animate-pulse" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
