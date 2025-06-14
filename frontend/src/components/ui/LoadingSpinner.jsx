import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

function LoadingSpinner({ className, ...props }) {
  return (
    <div className={cn('flex items-center justify-center p-8', className)} {...props}>
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
}

export default LoadingSpinner
