import React from 'react'
import { tokens } from '@fluentui/react-components'

interface NavigationButtonProps {
    icon: React.ReactElement
    label: string
    onClick: () => void
    className?: string
    isActive?: boolean
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
    icon,
    label,
    onClick,
    className,
    isActive = false
}) => {
    // Teams-style design: blue vertical line + blue icon/text for selected state
    const containerStyle: React.CSSProperties = {
        position: 'relative',
        width: '100%',
        height: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        backgroundColor: 'transparent', // No background change - Teams style
        color: isActive ? tokens.colorBrandForeground1 : tokens.colorNeutralForeground1,
        border: 'none',
        borderRadius: '0',
        padding: '8px 4px',
        gap: '2px',
        transition: 'all 0.2s ease',
    }

    // Blue vertical line overlay for selected state
    // Selection indicator: positioned so it sits flush with the outer left edge of the sidebar.
    // Sidebar has 4px horizontal padding; button sits inside. Using -4px compensates exactly.
    const blueLineStyle: React.CSSProperties = {
        position: 'absolute',
        left: '-6px', // Slightly closer to extreme left edge
        top: '6px',
        bottom: '6px',
        width: '2px', // Thinner
        backgroundColor: tokens.colorBrandBackground,
        borderRadius: '0 3px 3px 0',
        boxShadow: `0 0 0 1px ${tokens.colorNeutralBackground2}`,
        display: isActive ? 'block' : 'none',
    }

    return (
        <button
            className={className}
            title={label}
            onClick={onClick}
            style={containerStyle}
            aria-current={isActive ? 'page' : undefined}
        >
            {/* Blue vertical line overlay for selected state */}
            <div style={blueLineStyle}></div>

            <div style={{
                color: isActive ? tokens.colorBrandForeground1 : tokens.colorNeutralForeground1
            }}>
                {icon}
            </div>
            <span style={{
                fontSize: '10px',
                color: isActive ? tokens.colorBrandForeground1 : tokens.colorNeutralForeground1,
                fontWeight: isActive ? '600' : '400'
            }}>
                {label}
            </span>
        </button>
    )
}

export default NavigationButton
