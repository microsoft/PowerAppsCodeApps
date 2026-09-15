import React from 'react'
import NavigationButton from '../common/NavigationButton'
import {
    ContactCard24Regular,
    Building24Regular,
    Lightbulb24Regular,
    Settings24Regular
} from '@fluentui/react-icons'

interface SidebarProps {
    currentPage: string
    onPageChange: (page: string) => void
    className?: string
    buttonClassName?: string
}

const mainNavigationItems = [
    { key: 'Contacts', icon: <ContactCard24Regular />, label: 'Contacts' },
    { key: 'Accounts', icon: <Building24Regular />, label: 'Accounts' },
    { key: 'Starter', icon: <Lightbulb24Regular />, label: 'Starter' },
]

const bottomNavigationItems = [
    { key: 'Settings', icon: <Settings24Regular />, label: 'Settings' }
]

const Sidebar: React.FC<SidebarProps> = ({
    currentPage,
    onPageChange,
    className,
    buttonClassName
}) => {
    return (
        <div className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Main navigation items */}
            <div>
                {mainNavigationItems.map((item) => (
                    <NavigationButton
                        key={item.key}
                        icon={item.icon}
                        label={item.label}
                        onClick={() => onPageChange(item.key)}
                        className={buttonClassName}
                        isActive={currentPage === item.key}
                    />
                ))}
            </div>

            {/* Spacer to push bottom items down */}
            <div style={{ flex: 1 }}></div>

            {/* Bottom navigation items (Settings) */}
            <div style={{ paddingBottom: '16px', paddingTop: '12px' }}>
                {bottomNavigationItems.map((item) => (
                    <NavigationButton
                        key={item.key}
                        icon={item.icon}
                        label={item.label}
                        onClick={() => onPageChange(item.key)}
                        className={buttonClassName}
                        isActive={currentPage === item.key}
                    />
                ))}
            </div>
        </div>
    )
}

export default Sidebar
