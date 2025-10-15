import type { ReactNode } from 'react';
import { 
  makeStyles, 
  shorthands,
  Text,
  Button,
  tokens,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbDivider
} from '@fluentui/react-components';
import { 
  HomeRegular,
  HomeFilled,
  PeopleRegular,
  PeopleFilled,
  DatabaseRegular,
  DatabaseFilled,
  CloudRegular,
  CloudFilled,
  NavigationRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular
} from '@fluentui/react-icons';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    overflow: 'hidden',
  },
  sidebar: {
    width: '280px',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRight('1px', 'solid', tokens.colorNeutralStroke2),
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding('16px'),
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    zIndex: 1000,
    paddingTop: '76px',
    transition: 'transform 0.3s ease-in-out',
    '@media (max-width: 768px)': {
      width: '100vw',
      transform: 'translateX(-100%)',
      paddingTop: '60px',
    },
  },
  sidebarVisible: {
    '@media (max-width: 768px)': {
      transform: 'translateX(0) !important',
    },
  },
  sidebarCollapsed: {
    width: '60px',
    '@media (max-width: 768px)': {
      transform: 'translateX(-100%)',
    },
  },
  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    display: 'none',
    '@media (max-width: 768px)': {
      display: 'block',
    },
  },
  mobileHeader: {
    display: 'none',
    '@media (max-width: 768px)': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...shorthands.padding('16px'),
      backgroundColor: tokens.colorNeutralBackground2,
      ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1001,
    },
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '280px',
    marginTop: '76px',
    width: 'calc(100vw - 280px)',
    '@media (max-width: 768px)': {
      marginLeft: 0,
      marginTop: '60px',
      width: '100vw',
      paddingTop: '60px', // Account for mobile header
    },
  },
  contentCollapsed: {
    marginLeft: '60px',
    marginTop: '76px',
    width: 'calc(100vw - 60px)',
    '@media (max-width: 768px)': {
      marginLeft: 0,
      marginTop: '60px',
      width: '100vw',
      paddingTop: '60px',
    },
  },
  appHeader: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.padding('16px', '24px'),
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1100,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    minHeight: '60px',
    boxShadow: tokens.shadow4,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    // Reserved for future actions like user menu, etc.
  },
  pageTitle: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    marginLeft: '16px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  logo: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  navList: {
    listStyle: 'none',
    ...shorthands.margin(0),
    ...shorthands.padding(0),
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
  },
  navItem: {
    display: 'flex',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
    ...shorthands.padding('12px', '16px'),
    textDecoration: 'none',
    color: tokens.colorNeutralForeground2,
    backgroundColor: 'transparent',
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border('2px', 'solid', 'transparent'),
    width: '100%',
    transition: 'all 0.2s ease-in-out',
    position: 'relative',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      color: tokens.colorNeutralForeground1,
      transform: 'translateY(-1px)',
    },
    '&:focus': {
      outline: `2px solid ${tokens.colorBrandBackground}`,
      outlineOffset: '2px',
    },
  },
  navLinkActive: {
    backgroundColor: `${tokens.colorBrandBackground} !important`,
    color: `${tokens.colorNeutralForegroundOnBrand} !important`,
    fontWeight: '600',
    ...shorthands.border('2px', 'solid', tokens.colorBrandBackgroundSelected),
    boxShadow: `0 4px 8px ${tokens.colorNeutralShadowAmbient}, 0 2px 4px ${tokens.colorNeutralShadowKey}`,
    transform: 'translateY(-2px)',
    '&:hover': {
      backgroundColor: `${tokens.colorBrandBackgroundHover} !important`,
      color: `${tokens.colorNeutralForegroundOnBrand} !important`,
      transform: 'translateY(-2px)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '-16px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '4px',
      height: '24px',
      backgroundColor: tokens.colorBrandForeground1,
      ...shorthands.borderRadius('2px'),
    },
  },
  navLinkCollapsed: {
    justifyContent: 'center',
    ...shorthands.padding('12px'),
  },
  navText: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightMedium,
    lineHeight: tokens.lineHeightBase300,
    color: 'inherit',
  },
  navTextActive: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightBase300,
    color: 'inherit',
  },
  navDescription: {
    fontSize: tokens.fontSizeBase200,
    marginTop: '2px',
    lineHeight: tokens.lineHeightBase200,
    opacity: 0.9,
    color: 'inherit',
  },
  navIcon: {
    fontSize: '20px',
    transition: 'transform 0.2s ease-in-out',
  },
  navIconActive: {
    fontSize: '20px',
    transform: 'scale(1.1)',
  },
  main: {
    flex: 1,
    ...shorthands.padding('24px'),
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    overflow: 'auto',
    minHeight: 'calc(100vh - 120px)',
    '@media (max-width: 768px)': {
      ...shorthands.padding('16px'),
      minHeight: 'calc(100vh - 180px)',
    },
  },
  themeToggle: {
    marginTop: 'auto',
    ...shorthands.padding('12px'),
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    justifyContent: 'center',
  },
  footer: {
    ...shorthands.padding('16px', '24px'),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralStroke2),
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    textAlign: 'center',
    '@media (max-width: 768px)': {
      ...shorthands.padding('12px', '16px'),
      fontSize: tokens.fontSizeBase100,
    },
  },
  toggleButton: {
    minWidth: 'auto',
    width: '32px',
    height: '32px',
  },
});

interface NavItem {
  path: string;
  label: string;
  description: string;
  icon: React.ReactElement;
  iconFilled: React.ReactElement;
}

const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Home',
    description: 'Welcome and overview',
    icon: <HomeRegular />,
    iconFilled: <HomeFilled />,
  },
  {
    path: '/office365',
    label: 'Office 365',
    description: 'User profiles and directory',
    icon: <PeopleRegular />,
    iconFilled: <PeopleFilled />,
  },
  {
    path: '/sql',
    label: 'SQL Database',
    description: 'Project management with DataGrid and pagination',
    icon: <DatabaseRegular />,
    iconFilled: <DatabaseFilled />,
  },
  {
    path: '/custom-api',
    label: 'Custom API',
    description: 'Custom connector template',
    icon: <CloudRegular />,
    iconFilled: <CloudFilled />,
  },
];

const routeNames: Record<string, string> = {
  '/': 'Home',
  '/office365': 'Office 365 Connector',
  '/sql': 'SQL Database Connector', 
  '/custom-api': 'Custom API Connector'
};

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const styles = useStyles();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ path: '/', name: 'Home' }];
    
    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      const routeName = routeNames[currentPath];
      if (routeName) {
        breadcrumbs.push({ path: currentPath, name: routeName });
      }
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleMobileToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileClose = () => {
    setMobileMenuOpen(false);
  };

  const sidebarClassName = `${styles.sidebar} ${
    collapsed ? styles.sidebarCollapsed : ''
  } ${mobileMenuOpen ? styles.sidebarVisible : ''}`;

  const contentClassName = `${styles.content} ${
    collapsed ? styles.contentCollapsed : ''
  }`;

  return (
    <div className={styles.root}>
      {/* Fixed App Header with Hamburger, Breadcrumbs, and Centered Title */}
      <header className={styles.appHeader}>
        {/* Left Section: Hamburger + Breadcrumbs */}
        <div className={styles.headerLeft}>
          <Button
            icon={<NavigationRegular />}
            appearance="subtle"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          />
          <Breadcrumb aria-label="Breadcrumb navigation">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} style={{ display: 'flex', alignItems: 'center' }}>
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <Text weight="semibold">{crumb.name}</Text>
                  ) : (
                    <Link 
                      to={crumb.path}
                      style={{ 
                        textDecoration: 'none',
                        color: tokens.colorBrandForeground1
                      }}
                    >
                      {crumb.name}
                    </Link>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbDivider />}
              </div>
            ))}
          </Breadcrumb>
        </div>
        
        {/* Center Section: App Title with Logo */}
        <div className={styles.headerCenter}>
          <img 
            src="./PowerApps_scalable.svg" 
            alt="Power Apps" 
            style={{ 
              width: '24px', 
              height: '24px', 
              marginRight: '12px' 
            }} 
          />
          <Text 
            weight="semibold"
            size={500}
            style={{ 
              color: tokens.colorNeutralForeground1
            }}
          >
            Sample Code App
          </Text>
        </div>
        
        {/* Right Section: Reserved for future actions */}
        <div className={styles.headerRight}>
          {/* Space for user menu, notifications, etc. */}
        </div>
      </header>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <Button
          icon={<NavigationRegular />}
          appearance="subtle"
          className={styles.toggleButton}
          onClick={handleMobileToggle}
          title="Open menu"
        />
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className={styles.mobileOverlay} 
          onClick={handleMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClassName}>
        <nav style={{ flex: 1 }}>
          <ul className={styles.navList}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path} className={styles.navItem}>
                  <Link
                    to={item.path}
                    className={`${styles.navLink} ${
                      isActive ? styles.navLinkActive : ''
                    } ${collapsed ? styles.navLinkCollapsed : ''}`}
                    title={collapsed ? `${item.label} - ${item.description}` : undefined}
                    onClick={handleMobileClose}
                  >
                    <span className={isActive ? styles.navIconActive : styles.navIcon}>
                      {isActive ? item.iconFilled : item.icon}
                    </span>
                    {!collapsed && (
                      <div>
                        <div className={isActive ? styles.navTextActive : styles.navText}>
                          {item.label}
                        </div>
                        <div className={styles.navDescription}>{item.description}</div>
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Theme Toggle */}
        <div className={styles.themeToggle}>
          <Button
            icon={isDarkMode ? <WeatherSunnyRegular /> : <WeatherMoonRegular />}
            appearance="subtle"
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ 
              width: collapsed ? 'auto' : '100%',
              justifyContent: collapsed ? 'center' : 'flex-start',
              minWidth: collapsed ? '40px' : 'auto',
            }}
          >
            {!collapsed && (isDarkMode ? 'Light Mode' : 'Dark Mode')}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={contentClassName}>
        <main className={styles.main}>
          {children}
        </main>
        
        <footer className={styles.footer}>
          <Text style={{ 
            textAlign: 'center', 
            color: tokens.colorNeutralForeground2,
            fontSize: 'inherit'
          }}>
            Power Apps Code App sample crafted with Copilot Chat 🤖
          </Text>
        </footer>
      </div>
    </div>
  );
}
