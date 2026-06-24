import { useState, useEffect } from 'react'
import { Office365UsersService } from '../Services/Office365UsersService'
import type { GraphUser_V1 } from '../Models/Office365UsersModel'
import { usePowerRuntime } from './usePowerRuntime'

interface UseUserProfileReturn {
    user: GraphUser_V1 | null
    userPhoto: string | null
    loading: boolean
    error: string | null
}

export const useUserProfile = (): UseUserProfileReturn => {
    const [user, setUser] = useState<GraphUser_V1 | null>(null)
    const [userPhoto, setUserPhoto] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { isReady } = usePowerRuntime()

    useEffect(() => {
        if (!isReady) return
        const loadUserProfile = async () => {
            try {
                console.log('Starting to load user profile...')

                // Get user profile
                const profileResult = await Office365UsersService.MyProfile_V2('displayName,mail,givenName,surname,id')
                console.log('Profile result:', profileResult)

                if (profileResult.success && profileResult.data) {
                    console.log('Profile data:', profileResult.data)
                    setUser(profileResult.data)

                    // Get user photo using the user ID
                    if (profileResult.data.id) {
                        console.log('Loading photo for user ID:', profileResult.data.id)
                        const photoResult = await Office365UsersService.UserPhoto_V2(profileResult.data.id)
                        console.log('Photo result:', photoResult)

                        if (photoResult.success && photoResult.data) {
                            setUserPhoto(photoResult.data)
                        } else {
                            console.log('Photo failed or no data:', photoResult.error)
                        }
                    }
                } else {
                    console.error('Profile request failed:', profileResult.error)
                    setError(profileResult.error || 'Unknown error loading profile')
                }
            } catch (error) {
                console.error('Error loading user profile:', error)
                setError(error instanceof Error ? error.message : 'Unknown error')
            } finally {
                setLoading(false)
            }
        }

        loadUserProfile()
    }, [isReady])

    return { user, userPhoto, loading, error }
}
