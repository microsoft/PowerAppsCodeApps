import React from 'react'
import { Text, Title1, makeStyles } from '@fluentui/react-components'
import { BasePage, AboutCard, ThemeToggleCard } from '../components'
import { COMMON_STYLES } from '../constants/styles'

const useStyles = makeStyles({
    centeredContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
    }
})

interface SettingsPageProps {
    title: string
    isDarkTheme: boolean
    onThemeToggle: () => void
}

const SettingsPage: React.FC<SettingsPageProps> = ({ title, isDarkTheme, onThemeToggle }) => {
    const styles = useStyles()
    const header = <Title1>{title}</Title1>;

    return (
        <BasePage header={header}>
            <div className={styles.centeredContainer}>
                <AboutCard />
                <ThemeToggleCard
                    isDarkTheme={isDarkTheme}
                    onThemeToggle={onThemeToggle}
                />
                <Text size={200} style={{
                    ...COMMON_STYLES.secondaryText,
                    textAlign: 'center',
                    maxWidth: '800px'
                }}>
                    Click on the Vite and React logos to learn more about the technologies powering this app.
                    The sidebar navigation follows Microsoft Teams design patterns for familiarity.
                </Text>
            </div>
        </BasePage>
    )
}

export default SettingsPage
