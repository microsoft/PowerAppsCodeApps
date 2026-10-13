import { useEffect, useState } from 'react';
import type { Systemusers } from '../generated/models/SystemusersModel';
import { SystemusersService } from '../generated/services/SystemusersService';

export function useSystemUsers() {
  const [systemUsers, setSystemUsers] = useState<Systemusers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSystemUsers() {
      try {
        const result = await SystemusersService.getAll({
          select: [
            'systemuserid',
            'fullname',
            'internalemailaddress',
            'domainname',
            'jobtitle',
            'isdisabled',
          ],
          orderBy: ['fullname asc'],
          top: 100,
        });

        if (result.data) {
          setSystemUsers(result.data);
        } else {
          setError(result.error?.message ?? 'Failed to load system users.');
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : 'Failed to load system users.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadSystemUsers();
  }, []);

  return { systemUsers, loading, error };
}
