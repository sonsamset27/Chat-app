import { useState } from 'react'

const CLOUD_NAME = 'dwwuxjmxv'
const UPLOAD_PRESET = 'chat-app'

const useUploadImage = () => {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(null)

    const uploadImage = async (file) => {
        if (!file) return null

        try {
            setUploading(true)
            setError(null)

            const formData = new FormData()

            formData.append('file', file)
            formData.append('upload_preset', UPLOAD_PRESET)

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            )

            const data = await response.json()

            return data.secure_url
        } catch (err) {
            console.error('Upload image error:', err)
            setError(err.message)
            return null
        } finally {
            setUploading(false)
        }
    }

    return {
        uploadImage,
        uploading,
        error,
    }
}

export default useUploadImage