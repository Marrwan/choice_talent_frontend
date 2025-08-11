'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/store'
import { apiClient } from '@/lib/api'

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { isAuthenticated } = useAuth()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      console.log('[Test] File selected:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      })
    }
  }

  const handleTestUpload = async () => {
    if (!file) {
      alert('Please select a file first')
      return
    }

    setUploading(true)
    setResult(null)

    try {
      console.log('[Test] Starting test upload')
      
      const formData = new FormData()
      formData.append('testFile', file)
      
      console.log('[Test] FormData created with entries:', 
        Array.from(formData.entries()).map(([key, value]) => ({
          key,
          type: value instanceof File ? 'File' : 'String',
          name: value instanceof File ? value.name : 'N/A',
          size: value instanceof File ? value.size : value.length
        }))
      )

      const response = await apiClient.post('/user/test-upload', formData, true)
      
      console.log('[Test] Upload response:', response)
      setResult(response)
    } catch (error) {
      console.error('[Test] Upload error:', error)
      setResult({ error: error.message || 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }

  const handleCareerUpload = async () => {
    if (!file) {
      alert('Please select a file first')
      return
    }

    setUploading(true)
    setResult(null)

    try {
      console.log('[Test] Starting career profile upload')
      
      const formData = new FormData()
      formData.append('profilePicture', file)
      
      console.log('[Test] FormData created with entries:', 
        Array.from(formData.entries()).map(([key, value]) => ({
          key,
          type: value instanceof File ? 'File' : 'String',
          name: value instanceof File ? value.name : 'N/A',
          size: value instanceof File ? value.size : value.length
        }))
      )

      const response = await apiClient.post('/user/career-profile-picture', formData, true)
      
      console.log('[Test] Career upload response:', response)
      setResult(response)
    } catch (error) {
      console.error('[Test] Career upload error:', error)
      setResult({ error: error.message || 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Test Upload Page</h1>
        <p>Please log in to test file uploads.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Test Upload Page</h1>
      
      <div className="space-y-4">
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {file && (
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-semibold">Selected File:</h3>
            <p>Name: {file.name}</p>
            <p>Size: {file.size} bytes</p>
            <p>Type: {file.type}</p>
          </div>
        )}

        <div className="space-x-4">
          <Button 
            onClick={handleTestUpload} 
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Test Upload'}
          </Button>
          
          <Button 
            onClick={handleCareerUpload} 
            disabled={!file || uploading}
            variant="outline"
          >
            {uploading ? 'Uploading...' : 'Career Profile Upload'}
          </Button>
        </div>

        {result && (
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-semibold">Result:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 