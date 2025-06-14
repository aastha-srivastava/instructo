import React, { useState, useRef } from 'react'
import { Upload, X, File, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'
import { cn } from '../../lib/utils'

function FileUpload({ 
  onFileSelect, 
  accept = "*", 
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  className = "",
  disabled = false,
  placeholder = "Drop files here or click to upload"
}) {
  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    if (file.size > maxSize) {
      return `File size must be less than ${(maxSize / (1024 * 1024)).toFixed(1)}MB`
    }
    
    if (accept !== "*") {
      const allowedTypes = accept.split(',').map(type => type.trim())
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
      const mimeType = file.type
      
      const isAllowed = allowedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type.toLowerCase()
        }
        return mimeType.match(type.replace('*', '.*'))
      })
      
      if (!isAllowed) {
        return 'File type not supported'
      }
    }
    
    return null
  }

  const processFiles = (fileList) => {
    const fileArray = Array.from(fileList)
    const validFiles = []
    let hasError = false

    for (const file of fileArray) {
      const error = validateFile(file)
      if (error) {
        setError(error)
        hasError = true
        break
      }
      validFiles.push(file)
    }

    if (!hasError) {
      setError('')
      const newFiles = multiple ? [...files, ...validFiles] : validFiles
      setFiles(newFiles)
      onFileSelect?.(multiple ? newFiles : validFiles[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!disabled) {
      setDragOver(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    
    if (disabled) return
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles)
    }
  }

  const handleFileSelect = (e) => {
    const selectedFiles = e.target.files
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles)
    }
  }

  const removeFile = (indexToRemove) => {
    const newFiles = files.filter((_, index) => index !== indexToRemove)
    setFiles(newFiles)
    onFileSelect?.(multiple ? newFiles : null)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase()
    // You could expand this with more specific icons
    return <File className="h-4 w-4" />
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Card className={cn(
        "border-2 border-dashed transition-colors",
        dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"
      )}>
        <CardContent
          className="p-6 text-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center space-y-2">
            <Upload className={cn(
              "h-8 w-8",
              dragOver ? "text-primary" : "text-muted-foreground"
            )} />
            <div className="text-sm">
              <span className="font-medium">{placeholder}</span>
              <p className="text-muted-foreground mt-1">
                {accept !== "*" && `Supported: ${accept}`}
                {maxSize && ` • Max size: ${(maxSize / (1024 * 1024)).toFixed(1)}MB`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {error && (
        <div className="flex items-center space-x-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files:</h4>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center space-x-3">
                {getFileIcon(file.name)}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload
