
# Power Apps Code Apps Development Guide

# General Coding Guidance

## General Behavior

- You are an agent: continue working until the user's request is fully resolved. 
  Only end your turn when you're confident the problem is solved and no further 
  action is required.

- Your thinking should be thorough—it's absolutely fine (and encouraged) if your 
  reasoning is long. Think step by step before and after each action you take.

- Plan extensively before making any function calls. Reflect critically after 
  each one. Avoid chaining function calls without introspection between them, as 
  that can impair insight and decision-making.

- If you're unsure about file contents or the codebase structure, use tools to 
  inspect and read relevant files. Never guess or make assumptions.

- Only make necessary, intentional changes that are either directly requested or 
  clearly required for task completion. Avoid editing unrelated or unclear areas.

## Code Quality and Style

- Prefer simple solutions that are easy to understand and maintain.

- Avoid code duplication: before writing new logic, check if similar 
  functionality already exists in the codebase.

- Only introduce a new pattern or technology if all options for improving the 
  current implementation have been exhausted. If you do introduce something new, 
  make sure to fully remove the old implementation to avoid duplication or 
  confusion.

- Keep the codebase clean and organized. Use consistent patterns and naming 
  conventions where applicable.

- Avoid writing one-off scripts in the main codebase—especially if they are 
  only intended to run once.

- Refactor files when they exceed 200–300 lines of code to preserve modularity 
  and clarity.

- Never overwrite the .env file without asking for and receiving explicit 
  confirmation.

- Follow best practices around formatting and consistency. Use linters, 
  formatters, and style guides where appropriate.

## Coding Workflow

- Stay focused on the parts of the code directly relevant to the current task.

- Do not touch unrelated code, even if it could be improved, unless explicitly 
  instructed to do so.

- Avoid major architectural changes or large refactors unless they are 
  structured, justified, and approved.

- Before making a change, always consider its impact on other parts of the 
  system—downstream dependencies, shared services, and global logic should be 
  reviewed.

- Document or summarize your reasoning and decision-making if a change affects 
  multiple components.

---

# Using this template repository to build Power Apps Code App.

Follow these steps in order to create a complete Power Apps Code App:

1. **Install dependencies and build the app** - Set up the foundation
2. **Configure for Power Apps Code App** - Add Power Platform SDK integration
3. **Build app to work locally with mocked data** - Develop and test locally
4. **Check requirements for connecting with live data** - Ensure you have connectors setup to connect.
5. **Connect to Office 365** - Connect to live data sources
6. **Connect to SQL** - Connect to live data sources
7. **Connect to custom API** - Connect to custom connector
7. **Test and deploy** - Final testing and deployment

---

## Step 1: Install depedencies

Use only the files within FluentSample folder.

Open the VS Code terminal (Terminal → New Terminal) and navigate to the FluentSample folder:

```bash
cd samples/FluentSample
npm install
npm run build
```

This ensures the project compiles successfully before running.

---

## Step 2: Configure for Power Apps Code App

Be sure the user has PAC CLI installed and it is connected to the right environment. To know what is your user - 'pac auth who'. To know what is current environment 'pac org who'.

Initialize the app

```bash
pac code init
```

If any error occurs, it is likely due to the wrong environment. Inform the user and don't proceed.

---

## Step 3: Build app to work locally with mocked data

```bash
npm run dev
```

This will start both Vite dev server and PAC Code Run automatically for local development and testing.
The server will start in a new terminal window, don't look for terminal output. You can assume the app is running in the port 3000. The file power.config.json has the necessary configuration for the Power Apps environment.

---
## Step 4: Check requirements for connecting with live data

Check if the user has the needed connections. Use:

```bash
pac connection list
```

This will show all available connections with their IDs and names. It is important to have the Office 365 Users, SQL and Custom Connector connections available.

---

## Step 5: Connect to Office 365

For Office 365 Users:

```bash
pac code add-data-source -a "shared_office365users" -c <connectionId>
```

Replace static data with real data.

The Office365Page.tsx file is specifically designed for easy conversion from mock to live data:

#### Step 1: Update Imports
**Current (Mock Data):**
```typescript
// TODO: Replace with live Office365UsersService when connecting to real data
// import { Office365UsersService } from '../Services/Office365UsersService';
import * as mockData from '../mockData/office365Data';
```

**Replace with (Live Data):**
```typescript
import { Office365UsersService } from '../Services/Office365UsersService';
// import * as mockData from '../mockData/office365Data';
```

#### Step 2: Update Current User Loading
**Current (Mock Data):**
```typescript
// Using mock data for demonstration
setCurrentUser(mockData.mockCurrentUser);
```

**Replace with (Live Data):**
```typescript
const result = await Office365UsersService.MyProfile();
if (result.data) {
  setCurrentUser(result.data);
  // Load the current user's photo
  const photo = await loadUserPhoto(result.data.Id);
  if (photo) {
    setUserPhotos(prev => ({ ...prev, [result.data.Id]: photo }));
  }
}
```

#### Step 3: Update Photo Loading
**Current (Mock Data):**
```typescript
// For mock data, we don't have real photos
console.log(`Mock: Would load photo for user ${userId}`);
```

**Replace with (Live Data):**
```typescript
const result = await Office365UsersService.UserPhoto(userId);
if (result.data) {
  // The photo comes as base64 data, create a data URL
  return `data:image/jpeg;base64,${result.data}`;
}
```

#### Step 4: Update Search Function
**Current (Mock Data):**
```typescript
// Using mock data for demonstration
const pageSize = 50;
const mockResults = mockData.searchUsers(searchTerm.trim(), pageSize);
setUsers(mockResults);
```

**Replace with (Live Data):**
```typescript
const pageSize = 50;
const result = await Office365UsersService.SearchUser(
  searchTerm.trim(),
  pageSize
);

if (result.success && result.data) {
  setUsers(result.data);
  console.log('Users loaded:', result.data.length);
  
  // Load photos for the users
  await loadPhotosForUsers(result.data);
} else {
  console.error('Search failed:', result.errorMessage);
  setUsers([]);
}
```

#### Step 5: Update UI Status Indicators
**Current (Mock Data):**
```typescript
<Badge appearance="tint" color="important">
  📋 Demo Mode - Using Mock Data (Welcome, {currentUser.DisplayName}!)
</Badge>
```

**Replace with (Live Data):**
```typescript
<Badge appearance="tint" color="success">
  ✅ Connected to Office 365 - Welcome, {currentUser.DisplayName}!
</Badge>
```

---

## step 6: Connect to SQL

Discover the tables available in your database using the MSSQL tool 
or ask the user to provide them.

Always ask the user to confirm the server name and the database name. Prefer to use tables, as they have pagination support.

Example stored procedures for a typical CRUD application:

```bash
pac code add-data-source -a "shared_sql" -c <connectionId> \
  -t "dbo.Projects" -d "server.database.windows.net,database"
```

**Note:** Replace the table name, server and database name with the actual 
values available in your database. Ask the user to provide their specific 
values or use the MSSQL tool to discover them. Ask the user to confirm the values.

replace static data from SQL sample with real data. User server side pagination. 

---

# Step 7: Connect to custom API

Custom connector api id is usualy a long string. Use:
```bash
pac code add-data-source -a "shared_customapi" -c <connectionId>
```

---

## Step 8: Test and Deploy

---


### Original configuration

To run code app, the following settings are needed. Use this in case changes cause the app to do not build or run.

`vite.config.ts` proper configuration:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  server: {
    host: "::",
    port: 3000,  // Important: Power Apps Code Apps require port 3000
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Package.json Scripts

The dev script in `package.json`:

```json
{
  "scripts": {
    "dev": "start pac code run && vite",
    "build": "tsc -b && vite build"
  }
}
```

**Note for macOS users**: Remove `start` from the dev script:
```json
{
  "scripts": {
    "dev": "vite && pac code run"
  }
}
```

### PowerProvider Component

Need a `src/PowerProvider.tsx` with the following content:

```typescript
import React from 'react';
import { PowerProvider as Provider } from '@microsoft/power-apps';

interface PowerProviderProps {
  children: React.ReactNode;
}

const PowerProvider: React.FC<PowerProviderProps> = ({ children }) => {
  return (
    <Provider>
      {children}
    </Provider>
  );
};

export default PowerProvider;
```

### Update main.tsx

Update `src/main.tsx` to include the PowerProvider:

```typescript
  <StrictMode>
    <PowerProvider>
      <App />
    </PowerProvider>
  </StrictMode>,
```

---

## Fluent UI v9

### To Install Fluent UI Packages

```bash
npm install @fluentui/react-components @fluentui/react-icons
```

### FluentProvider Setup

Wrap your app with FluentProvider for consistent theming:

```typescript
import { 
  FluentProvider, 
  webLightTheme, 
  webDarkTheme 
} from '@fluentui/react-components';

function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      {/* Your app content */}
    </FluentProvider>
  );
}
```
---
The user might want to create more examples. Guidance:

### Critical Implementation Rules for DataGrids

1. **Server-Side Only**: Never implement client-side sorting with compare functions
2. **Responsive Design**: Always provide both desktop table and mobile card views
3. **Loading States**: Include skeleton components for all data loading states
4. **Column Resizing**: Use columnSizingOptions with proper width constraints
5. **Pagination**: Reset to page 1 when changing sort or filter parameters
6. **Accessibility**: Implement proper ARIA labels and keyboard navigation

### Reference Documentation
- [Fluent UI DataGrid Documentation](https://fluentuipr.z22.web.core.windows.net/heads/master/public-docsite-v9/storybook/?path=/docs/components-datagrid--default)
- [Resizable Columns Example](https://github.com/microsoft/fluentui/blob/938a069ea4e0c460050e0dc147b9786e144cb6d3/packages/react-components/react-table/stories/src/DataGrid/ResizableColumns.stories.tsx)

### Common Implementation Patterns
- Use `makeStyles` for consistent styling with design tokens
- Implement `useEffect` hooks for data loading on parameter changes
- Use `useMemo` for column definitions to prevent unnecessary re-renders
- Handle loading, error, and empty states appropriately
- Implement proper accessibility with ARIA labels and keyboard navigation
- Use proper TypeScript interfaces for type safety

---

### Data Access Service Interface Pattern

- Define TypeScript interfaces for all data operations (CRUD, search, pagination)
- Create contracts that both mock and real services will implement
- Ensure strongly-typed parameters and return types for all operations

- Implement singleton factory to manage service instances
- Allow runtime switching between mock and real services
- Provide single point of configuration for the entire application

#### Mock Services (Initial Implementation)

- Create mock implementations that simulate real data operations
- Include realistic test data and proper pagination/filtering simulation
- Provide comprehensive logging for development debugging
- **Start here - implement mock services first**

#### Real Services (Future Implementation)

- **Do not implement initially - focus on mock services**
- **Stored procedure names will be determined later**
- Will integrate with Power Apps generated service classes
- Must maintain same interface as mock services

### Accessibility Guidelines

#### ARIA Best Practices
- Always include `aria-label` or `aria-labelledby` for interactive elements
- Use `aria-describedby` for additional context
- Implement proper focus management with `tabIndex`
- Use semantic HTML elements when possible

#### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Implement proper tab order with `tabIndex`
- Use arrow keys for grid navigation
- Provide skip links for long content

#### Color and Contrast
- Use Fluent UI design tokens for consistent colors
- Ensure minimum contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Don't rely solely on color to convey information

### Performance Optimization

#### React Best Practices
- Use `useMemo` and `useCallback` for expensive computations
- Implement proper dependency arrays in `useEffect`
- Use `React.memo` for components that don't need frequent re-renders
- Implement proper key props for lists

#### Data Loading Patterns
- Implement server-side pagination for large datasets
- Use loading skeletons instead of spinners
- Implement proper error boundaries
- Cache API responses where appropriate

#### Bundle Optimization
- Use dynamic imports for code splitting
- Implement proper tree shaking
- Optimize images and assets
- Use Vite's built-in optimization features

### Responsive Design Guidelines

#### Mobile-First Approach
- Design for mobile screens first, then enhance for larger screens
- Use Fluent UI's responsive breakpoints
- Implement touch-friendly interactions (minimum 44px tap targets)

#### Layout Patterns
- Use CSS Grid and Flexbox for responsive layouts
- Implement proper viewport meta tags
- Use relative units (rem, em, %) instead of fixed pixels
- Test on various screen sizes and orientations

#### Component Responsiveness
- Provide alternative layouts for different screen sizes
- Use compound components for complex responsive patterns
- Implement proper overflow handling
- Consider content hierarchy on smaller screens

### Local Development Testing

```bash
npm run dev
```

This starts both the Vite development server and Power SDK server.

---

### Power Platform Setup

First release environment is required. Confirm with the user:

```bash
pac admin create --name 'Code Apps' --region 'unitedstatesfirstrelease' --type 'Developer'
```

Authenticate and select environment:

```bash
pac auth create --environment {environment id}
pac auth who  # Verify correct environment is selected
```

### Initialize Power Apps Code App

Configure the Power Apps Code App:

```bash
pac code init --displayName "My App" -l "[location of the vite.svg]"    
```

**Note:** Replace "My App" with the actual app name provided by the user. 
Replace [location of the vite.svg] with the real location

---

## Step 6: Wire Up to Real Connectors

Initially use mocked data for development. Once the app is ready, replace with 
actual data sources.

Confirm everything is working with mocked data before integrating with real 
data sources.

### Get Connection IDs

List available connections to find the connection ID:

```bash
pac connection list
```

This will show all available connections with their IDs and names.

---

## Step 7: Test and Deploy

### Build and Deploy

```bash
npm run build
pac code push
```

### Common Issues and Troubleshooting

- **Port 3000 Required**: Power Apps Code Apps require port 3000
- **PowerProvider Issues**: Ensure PowerProvider.tsx is properly configured
- **Build Errors**: Run `npm run build` before deploying
- **Authentication**: Use same browser profile as Power Platform tenant

---

# FluentSample Template Guide

## 🎯 Template Overview

The FluentSample template is a comprehensive Power Apps Code Apps example demonstrating:
- Fluent UI v9 integration patterns in Power Platform context
- Navigation and data management with realistic mock data
- Clear transition path from mock data to live Power Platform connectors
- GitHub Copilot-optimized code patterns for AI-assisted development

## 📁 FluentSample Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main app layout with navigation
├── pages/              # Route components
│   ├── HomePage.tsx    # Landing page with overview
│   ├── Office365Page.tsx    # Office 365 connector example (READY FOR LIVE DATA)
│   ├── SqlPage.tsx          # SQL database connector example
│   └── CustomApiPage.tsx    # Custom API connector example
├── mockData/           # Mock data matching live API structures
│   ├── office365Data.ts    # Office 365 Users mock data
│   ├── sqlData.ts          # SQL mock data
│   └── customApiData.ts    # Custom API mock data
├── Services/           # Auto-generated service files
│   └── Office365UsersService.ts  # Live Office 365 connector (commented out)
└── Models/             # TypeScript interfaces matching Power Platform
    └── Office365UsersModel.ts   # Office 365 data models
```

## 🔄 Converting Mock Data to Live Data in FluentSample

### Office 365 Connector Integration



## 🤖 GitHub Copilot Integration for FluentSample

### Optimized Copilot Prompts for FluentSample

**For Office 365 Integration:**
```
@workspace Convert the Office 365 mock data to live Office365UsersService calls. Replace the mock searchUsers, mockCurrentUser, and photo loading with actual API calls while maintaining the same UI patterns and error handling.
```

**For Complete Mock-to-Live Conversion:**
```
@workspace I need to replace all mock data in Office365Page.tsx with live Office365UsersService calls. Update the imports, replace mockData.searchUsers with Office365UsersService.SearchUser, replace mockCurrentUser with MyProfile API call, and update photo loading to use UserPhoto API.
```

**For Error Handling Updates:**
```
@workspace Update the error handling in Office365Page.tsx to handle live API failures, network errors, and authentication issues when using Office365UsersService instead of mock data.
```

**For UI Status Updates:**
```
@workspace Update the connection status badge and integration note to reflect live Office 365 connection instead of mock data.
```

### Copilot-Friendly Code Patterns in FluentSample

The FluentSample code uses specific patterns that Copilot can easily recognize:

1. **Side-by-side mock/live code examples** with clear TODO comments
2. **Consistent function signatures** between mock and live services
3. **TypeScript interfaces** that match both mock and live data structures
4. **Clear separation** between UI logic and data access patterns

Example pattern:
```typescript
// TODO: Replace with live Office365UsersService when connecting to real data
// const result = await Office365UsersService.SearchUser(searchTerm, pageSize);
// if (result.success && result.data) { ... }

// Using mock data for demonstration
const mockResults = mockData.searchUsers(searchTerm.trim(), pageSize);
```

## 🎨 FluentSample Features Demonstrated

### Office 365 Integration (Ready for Live Data)
- **User Directory Search**: Comprehensive search functionality with realistic Office 365 user data
- **User Profile Display**: Rich user cards showing DisplayName, JobTitle, BusinessPhones, OfficeLocation
- **Profile Photos**: User photo loading and display with fallback avatars
- **Current User Context**: Display of authenticated user profile and photo
- **Department Grouping**: Users organized by department for realistic organizational view
- **Responsive Design**: Cards adapt to different screen sizes using Fluent UI responsive patterns

### UI Patterns & Components
- **Fluent UI v9 Integration**: Modern, accessible components following Microsoft design system
- **Navigation System**: Sidebar navigation with route management
- **Search Interface**: Real-time search with loading states and empty state handling
- **Card Layouts**: Responsive grid layouts for displaying user information
- **Status Indicators**: Connection badges showing current data source (mock vs live)
- **Loading States**: Proper loading indicators for async operations

### Developer Experience Features
- **Clear Transition Path**: Well-documented mock-to-live data conversion
- **Copilot-Friendly Code**: Structured comments and patterns optimized for AI assistance
- **TypeScript Integration**: Full type safety with Power Platform data models
- **Error Handling**: Comprehensive error handling patterns for API integrations
- **Realistic Mock Data**: Mock data that exactly matches live API structures

## 🔧 Troubleshooting FluentSample Live Data Integration

### Common Issues and Solutions

**Authentication Errors:**
- Ensure your Office 365 connection is properly configured
- Check that you have the necessary permissions
- Verify your Power Platform environment is active

**No Users Returned:**
- Check your search terms are valid
- Verify the connector has access to your organization's directory
- Ensure the Office 365 Users connector is properly connected

**Photos Not Loading:**
- User photos may not exist for all users
- Check network permissions and policies
- Verify the UserPhoto API has proper permissions

**API Rate Limiting:**
- Implement proper error handling for rate limits
- Consider caching strategies for frequently accessed data
- Add loading states for better user experience

## 🔄 Advanced Customization for FluentSample

### Adding New Connector Examples

1. **Create new service file** (auto-generated by Power Platform CLI)
2. **Create corresponding mock data file** with matching interfaces
3. **Create new page component** following the Office365Page.tsx pattern
4. **Add navigation route** in Layout.tsx
5. **Document conversion steps** in this guide

### Extending the Office 365 Example

The Office 365 integration can be extended with additional features:
- **Group Management**: Add groups search and member listing
- **Calendar Integration**: Show user availability and calendar events
- **Contact Details**: Extended contact information and organizational hierarchy
- **Manager/Direct Reports**: Organizational chart functionality

