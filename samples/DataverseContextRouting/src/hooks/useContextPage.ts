import { useEffect, useState } from 'react';
import { getContext } from '@microsoft/power-apps/app';

export type ActivePage = 'contacts' | 'accounts' | 'systemusers';

const pageAliases: Record<string, ActivePage> = {
  account: 'accounts',
  accounts: 'accounts',
  contact: 'contacts',
  contacts: 'contacts',
  systemuser: 'systemusers',
  systemusers: 'systemusers',
  user: 'systemusers',
  users: 'systemusers',
};

export function resolveContextPage(queryParams: Record<string, string>): ActivePage {
  const requestedPage = queryParams.table ?? queryParams.page ?? '';
  return pageAliases[requestedPage.trim().toLowerCase()] ?? 'contacts';
}

export function useContextPage() {
  const [activePage, setActivePage] = useState<ActivePage>('contacts');
  const [contextError, setContextError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadContext() {
      try {
        const context = await getContext();
        if (cancelled) {
          return;
        }

        setActivePage(resolveContextPage(context.app.queryParams));
      } catch (error) {
        if (!cancelled) {
          setContextError(error instanceof Error ? error.message : 'Unable to read app context.');
        }
      }
    }

    loadContext();

    return () => {
      cancelled = true;
    };
  }, []);

  return { activePage, setActivePage, contextError };
}
