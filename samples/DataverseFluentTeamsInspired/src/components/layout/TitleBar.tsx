import React from 'react'
import { Button, Text } from '@fluentui/react-components'
import { WeatherSunny24Regular, WeatherMoon24Regular } from '@fluentui/react-icons'
import { COMMON_STYLES, STYLE_CONSTANTS } from '../../constants/styles'
// Import assets through Vite so URLs are resolved correctly under HTTPS wrappers
import reactLogo from '../../assets/react.svg'

interface TitleBarProps {
    isDarkTheme: boolean
    onThemeToggle: () => void
    userProfileComponent: React.ReactNode
    className?: string
}

const TitleBar: React.FC<TitleBarProps> = ({
    isDarkTheme,
    onThemeToggle,
    userProfileComponent,
    className
}) => {
    return (
        <div className={className}>
            <div style={COMMON_STYLES.centeredRow}>
                <img src={reactLogo} style={COMMON_STYLES.icon} alt="React logo" />
                <Text
                    size={500}
                    weight="semibold"
                    style={{ marginLeft: STYLE_CONSTANTS.SPACING.LG }}
                >
                    Power Platform Code App using Dataverse (Fluent UI React v9 & Teams inspired)
                </Text>
            </div>

            <div style={COMMON_STYLES.rightAlignedRow}>
                <Button
                    appearance="subtle"
                    icon={isDarkTheme ? <WeatherSunny24Regular /> : <WeatherMoon24Regular />}
                    onClick={onThemeToggle}
                    title={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
                />
                {userProfileComponent}
            </div>
        </div>
    )
}

export default TitleBar
