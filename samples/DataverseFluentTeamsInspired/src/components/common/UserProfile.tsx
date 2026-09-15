import React from 'react'
import {
    Avatar,
    Text,
    Tooltip,
    Popover,
    PopoverTrigger,
    PopoverSurface,
    tokens
} from '@fluentui/react-components'
import type { GraphUser_V1 } from '../../Models/Office365UsersModel'
import { COMMON_STYLES } from '../../constants/styles'

interface UserProfileProps {
    user: GraphUser_V1
    userPhoto?: string | null
    isPopoverOpen: boolean
    onPopoverOpenChange: (open: boolean) => void
    className?: string
}

const UserProfile: React.FC<UserProfileProps> = ({
    user,
    userPhoto,
    isPopoverOpen,
    onPopoverOpenChange,
    className
}) => {
    const displayName = user.displayName || `${user.givenName || ''} ${user.surname || ''}`.trim()

    return (
        <Popover
            open={isPopoverOpen}
            onOpenChange={(_, data) => onPopoverOpenChange(data.open)}
            positioning="below-end"
        >
            <PopoverTrigger disableButtonEnhancement>
                <Tooltip content={displayName} relationship="label">
                    <Avatar
                        className={className}
                        image={userPhoto ? { src: `data:image/jpeg;base64,${userPhoto}` } : undefined}
                        name={displayName}
                        size={32}
                    />
                </Tooltip>
            </PopoverTrigger>
            <PopoverSurface style={{
                minWidth: '280px',
                maxWidth: 'min(400px, calc(100vw - 40px))',
                width: 'max-content',
                padding: '16px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                }}>
                    <Avatar
                        image={userPhoto ? { src: `data:image/jpeg;base64,${userPhoto}` } : undefined}
                        name={displayName}
                        size={48}
                    />
                    <div style={{ whiteSpace: 'nowrap' }}>
                        <Text weight="semibold" size={400}>
                            {displayName}
                        </Text>
                        <br />
                        <Text size={300} style={COMMON_STYLES.secondaryText}>
                            {user.mail}
                        </Text>
                    </div>
                </div>
                <div style={{
                    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
                    paddingTop: '12px'
                }}>
                    <Text size={200}>
                        Office 365 User Profile
                    </Text>
                    <br />
                    <Text size={200} style={{ opacity: 0.6 }}>
                        Connected via Power Platform
                    </Text>
                </div>
            </PopoverSurface>
        </Popover>
    )
}

export default UserProfile
