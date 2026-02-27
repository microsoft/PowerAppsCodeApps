import { CardHeader, CardPreview, Title1, Title2, Body1 } from '@fluentui/react-components'
import CommonCard from './CommonCard'
import { STYLE_CONSTANTS, COMMON_STYLES } from '../../constants/styles'
import reactLogo from '../../assets/react.svg'
import viteLogo from '/vite.svg'

interface AboutCardProps {
    style?: React.CSSProperties
}

const AboutCard: React.FC<AboutCardProps> = ({ style }) => {
    return (
        <CommonCard style={{ ...COMMON_STYLES.settingsCard, ...style }}>
            <CardPreview>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: STYLE_CONSTANTS.SPACING.MD,
                    justifyContent: 'center',
                    padding: STYLE_CONSTANTS.SPACING.LG
                }}>
                    <img src={viteLogo} style={{ height: '6em' }} alt="Vite logo" />
                    <Title1>+</Title1>
                    <img src={reactLogo} style={{ height: '6em' }} alt="React logo" />
                </div>
            </CardPreview>
            <CardHeader
                header={<Title2>About this Power Platform Code App</Title2>}
                description={
                    <Body1>
                        This application is built with React + TypeScript + Vite and integrated with Microsoft's Fluent UI design system.
                        It connects to Dataverse and Office 365 services, providing a modern Teams-inspired interface for Power Platform development.
                    </Body1>
                }
            />
        </CommonCard>
    )
}

export default AboutCard
