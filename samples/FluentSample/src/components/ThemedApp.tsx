import { FluentProvider } from '@fluentui/react-components';
import { QueryClientProvider } from '@tanstack/react-query';
import { HashRouter } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { queryClient } from '../main';
import App from '../App';

export const ThemedApp = () => {
  const { theme } = useTheme();
  
  return (
    <FluentProvider theme={theme}>
      <QueryClientProvider client={queryClient}> 
        <HashRouter>
          <App />
        </HashRouter>
      </QueryClientProvider>
    </FluentProvider>
  );
};
