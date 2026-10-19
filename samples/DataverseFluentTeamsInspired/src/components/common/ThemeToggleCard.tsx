import React from 'react'
import { Card, CardHeader, Title3, Switch, Label } from '@fluentui/react-components'
import { COMMON_STYLES, STYLE_CONSTANTS } from '../../constants/styles'

interface ThemeToggleCardProps {
    isDarkTheme: boolean
    onThemeToggle: () => void
    style?: React.CSSProperties
}

const ThemeToggleCard: React.FC<ThemeToggleCardProps> = ({ isDarkTheme, onThemeToggle, style }) => {
    return (
        <Card style={{ ...COMMON_STYLES.settingsCard, ...style }}>
            <CardHeader
                header={<Title3>Theme Settings</Title3>}
            />

            <div style={{
                padding: STYLE_CONSTANTS.SPACING.LG,
                paddingTop: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: STYLE_CONSTANTS.SPACING.MD
            }}>
                {/* Dark Mode Setting */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: STYLE_CONSTANTS.SPACING.MD
                }}>
                    <Label htmlFor="theme-switch">
                        Dark Mode
                    </Label>
                    <Switch
                        id="theme-switch"
                        checked={isDarkTheme}
                        onChange={onThemeToggle}
                    />
                </div>

                {/* Future theme settings can be added here */}
                {/* Example:
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: STYLE_CONSTANTS.SPACING.MD
                }}>
                    <Label htmlFor="high-contrast-switch">
                        High Contrast
                    </Label>
                    <Switch
                        id="high-contrast-switch"
                        checked={false}
                        onChange={() => {}}
                    />
                </div>
                */}
            </div>
        </Card>
    )
}

export default ThemeToggleCard
