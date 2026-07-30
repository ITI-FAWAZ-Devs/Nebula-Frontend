'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { SplineScene } from "@/components/ui/splite"
import { Spotlight } from "@/components/ui/spotlight"

export function SplineSceneBasic() {
  const [showBubble, setShowBubble] = useState(false)
  const [showHint, setShowHint] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 6000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden group">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
      />
      <div className="spline-container absolute inset-0 [&>iframe]:!overflow-hidden [&>iframe]:![clip-path:polygon(0_0,100%_0,100%_92%,92%_100%,0_100%)]">
        <SplineScene
          scene="https://prod.spline.design/tbiegWCjcBbBTRbH/scene.splinecode"
          className="w-full h-full"
        />
      </div>

      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute top-6 left-6 z-10 max-w-[240px] rounded-2xl border border-white/10 bg-[#0a0a0f]/80 px-4 py-3 shadow-2xl backdrop-blur-xl sm:top-8 sm:left-8"
          >
            <div className="absolute -bottom-2 left-10 h-0 w-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#0a0a0f]/80" />
            <p className="text-sm leading-relaxed text-white/80">
              Hi, I am <span className="font-medium text-primary">Nebula Agent</span>{' '}
              <motion.span
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block origin-[70%_70%]"
              >
                👋
              </motion.span>
              <br />
              I am here to help you.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2.5, duration: 0.5 }}
            className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] text-white/50 backdrop-blur-sm"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="h-3 w-3 rounded-full border border-white/20 border-t-primary"
              />
              Drag to interact
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
