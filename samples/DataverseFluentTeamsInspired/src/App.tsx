import { useState, Suspense, lazy } from 'react'
// Lazily load heavier / less frequently accessed pages to reduce initial bundle size.
const ContactsPage = lazy(() => import('./pages/ContactsPage'))
const AccountsPage = lazy(() => import('./pages/AccountsPage'))
const StarterPage = lazy(() => import('./pages/StarterPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
import { TitleBar, Sidebar, UserProfile } from './components'
import { useUserProfile } from './hooks'
import {
  Text,
  makeStyles,
  shorthands,
  tokens,
  Spinner,
  FluentProvider,
  webLightTheme,
  webDarkTheme
} from '@fluentui/react-components'


const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    height: '100vh',
    margin: 0,
    padding: 0,
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
  },
  titleBar: {
    height: '48px',
    backgroundColor: tokens.colorNeutralBackground2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.padding('0', '20px'),
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    width: '100%',
    boxSizing: 'border-box',
    overflow: 'visible',
  },
  mainLayout: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: '56px',
    backgroundColor: tokens.colorNeutralBackground2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...shorthands.padding('8px', '4px'),
    ...shorthands.gap('4px'),
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  sidebarButton: {
    width: '48px',
    height: '60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.borderRadius('6px'),
    ...shorthands.padding('6px', '2px'),
    fontSize: '10px',
    fontWeight: '400',
    lineHeight: '12px',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  contentArea: {
    flex: 1,
    ...shorthands.padding('0px'),
    display: 'flex',
    flexDirection: 'column',
    height: '100%', // Ensure full height
    overflow: 'auto', // Allow scrolling if content overflows
  },
  profilePopover: {
    minWidth: '280px',
    maxWidth: 'min(400px, calc(100vw - 40px))',
    width: 'max-content',
    ...shorthands.padding('16px'),
  },
  profilePopoverHeader: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
    ...shorthands.margin('0', '0', '12px', '0'),
  },
  profilePopoverText: {
    whiteSpace: 'nowrap',
  },
  profileAvatar: {
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.8,
    },
  }
})

function App() {
  const styles = useStyles()
  // Initialize theme from localStorage or default to dark theme
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('isDarkTheme')
    return savedTheme ? JSON.parse(savedTheme) : true
  })

  const [isProfilePopoverOpen, setIsProfilePopoverOpen] = useState(false)

  // Initialize current page from localStorage; map deprecated 'Home' to 'Contacts'
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem('currentPage')
    if (savedPage === 'Home') return 'Contacts'
    return savedPage ? savedPage : 'Contacts'
  })

  // Function to toggle theme and persist to localStorage
  const toggleTheme = () => {
    const newTheme = !isDarkTheme
    setIsDarkTheme(newTheme)
    localStorage.setItem('isDarkTheme', JSON.stringify(newTheme))
  }

  // Function to change page and persist to localStorage
  const changePage = (page: string) => {
    setCurrentPage(page)
    localStorage.setItem('currentPage', page)
  }

  const { user, userPhoto, loading } = useUserProfile()

  const renderPageContent = () => {
    switch (currentPage) {
      case 'Contacts':
        return <ContactsPage />
      case 'Accounts':
        return <AccountsPage />
      case 'Starter':
        return <StarterPage title={currentPage} />
      case 'Teams':
      case 'Apps':
        return <div style={{ padding: 24 }}>Page removed.</div>
      case 'Settings':
        return <SettingsPage
          title={currentPage}
          isDarkTheme={isDarkTheme}
          onThemeToggle={toggleTheme}
        />
      default:
        return <div>Page not found</div>
    }
  }

  const userProfileComponent = loading ? (
    <Spinner size="tiny" />
  ) : user ? (
    <UserProfile
      user={user}
      userPhoto={userPhoto}
      isPopoverOpen={isProfilePopoverOpen}
      onPopoverOpenChange={setIsProfilePopoverOpen}
      className={styles.profileAvatar}
    />
  ) : (
    <Text size={200} style={{ color: tokens.colorPaletteRedForeground1 }}>
      Profile unavailable
    </Text>
  )

  return (
    <FluentProvider
      theme={isDarkTheme ? webDarkTheme : webLightTheme}
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        display: 'block'
      }}
    >
      <div className={styles.root}>
        <TitleBar
          isDarkTheme={isDarkTheme}
          onThemeToggle={toggleTheme}
          userProfileComponent={userProfileComponent}
          className={styles.titleBar}
        />

        <div className={styles.mainLayout}>
          <Sidebar
            currentPage={currentPage}
            onPageChange={changePage}
            className={styles.sidebar}
            buttonClassName={styles.sidebarButton}
          />

          <div className={styles.mainContent}>
            <div className={styles.contentArea}>
              <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 32 }}><Spinner size="large" /></div>}>
                {renderPageContent()}
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </FluentProvider>
  )
}

export default App
