import { Heart } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-4 p-6">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="absolute w-16 h-16 rounded-full bg-forest-100 animate-ping opacity-75" />
        
        {/* Main rotating icon boundary */}
        <div className="w-12 h-12 rounded-full bg-forest-500 flex items-center justify-center shadow-md relative z-10 animate-bounce">
          <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
        </div>
      </div>
      
      <div className="text-center space-y-1">
        <h3 className="font-serif font-semibold text-brown-800 text-lg">Fetching happy tails...</h3>
        <p className="text-xs text-brown-500 max-w-xs">
          Connecting you with animals who are waiting for a second chance at love.
        </p>
      </div>
    </div>
  )
}
