import type { Systemusers } from '../generated/models/SystemusersModel';

interface SystemUserListProps {
  systemUsers: Systemusers[];
  loading: boolean;
}

export function SystemUserList({ systemUsers, loading }: SystemUserListProps) {
  return (
    <section className="system-users-list">
      <div className="section-header">
        <h2>System Users ({systemUsers.length})</h2>
      </div>

      {loading ? (
        <p>Loading system users...</p>
      ) : systemUsers.length === 0 ? (
        <p>No system users found.</p>
      ) : (
        <div className="system-users-grid">
          {systemUsers.map((systemUser) => (
            <article className="system-user-card" key={systemUser.systemuserid}>
              <h3>{systemUser.fullname || systemUser.domainname}</h3>
              <p>{systemUser.internalemailaddress || systemUser.domainname}</p>
              {systemUser.jobtitle && <p>{systemUser.jobtitle}</p>}
              <span className={systemUser.isdisabled ? 'status-disabled' : 'status-active'}>
                {systemUser.isdisabled ? 'Disabled' : 'Active'}
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
