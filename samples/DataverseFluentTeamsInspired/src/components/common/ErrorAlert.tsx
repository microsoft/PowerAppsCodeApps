import { Text } from '@fluentui/react-components'

interface ErrorAlertProps {
    error: string
    maxWidth?: string
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, maxWidth = '400px' }) => {
    return (
        <div style={{
            padding: '16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            width: '100%',
            maxWidth
        }}>
            <Text weight="semibold">Error loading user profile</Text>
            <br />
            <Text size={200}>{error}</Text>
        </div>
    )
}

export default ErrorAlert
