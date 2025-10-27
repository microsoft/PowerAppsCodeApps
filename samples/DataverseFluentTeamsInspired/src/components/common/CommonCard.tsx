import { Card } from '@fluentui/react-components'
import { COMMON_STYLES } from '../../constants/styles'

interface CommonCardProps {
    children: React.ReactNode
    style?: React.CSSProperties
}

const CommonCard: React.FC<CommonCardProps> = ({ children, style }) => {
    return (
        <Card style={{ ...COMMON_STYLES.standardCard, ...style }}>
            {children}
        </Card>
    )
}

export default CommonCard
