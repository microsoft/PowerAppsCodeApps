/**
 * ApiActionsPanel — Advanced Queries & Actions tab (connector edition)
 *
 * The Dataverse *connector's* single generated `MicrosoftDataverseService` exposes advanced
 * querying and action operations directly (no per-API `add-dataverse-api` generation like native
 * Dataverse code apps need). This tab runs three of them LIVE:
 *
 *   1. OData Query          — ListRecords with $filter / $orderby / $top
 *   2. FetchXML Query       — ListRecords with a FetchXML string
 *   3. Perform Unbound Action — PerformUnboundAction (Dataverse actions)
 *
 * NOTE ON CONNECTOR LIMITS (surfaced honestly here):
 *   - Dataverse *functions* (e.g. WhoAmI, GET-only) are NOT invokable via the connector's
 *     unbound-action operation, which POSTs to the action endpoint.
 *   - Relevance Search (GetRelevantRows) is generated without an organization binding, so it
 *     can't target the current environment through this data source.
 */

import { useState } from 'react';
import { listRows, listEntities, type DataverseRow, type EntityInfo } from '../dataverse/client';

export function ApiActionsPanel() {
  // --- OData query ---
  const [odEntity, setOdEntity] = useState('accounts');
  const [odFilter, setOdFilter] = useState("contains(name, 'a')");
  const [odOrderBy, setOdOrderBy] = useState('name asc');
  const [odTop, setOdTop] = useState('5');
  const [odRows, setOdRows] = useState<DataverseRow[] | null>(null);
  const [odError, setOdError] = useState<string | null>(null);
  const [odBusy, setOdBusy] = useState(false);

  const runOData = async () => {
    setOdBusy(true);
    setOdError(null);
    setOdRows(null);
    try {
      const rows = await listRows(odEntity.trim(), {
        filter: odFilter.trim() || undefined,
        orderBy: odOrderBy.trim() ? [odOrderBy.trim()] : undefined,
        top: Number(odTop) || 5,
      });
      setOdRows(rows);
    } catch (err) {
      setOdError((err as Error).message);
    } finally {
      setOdBusy(false);
    }
  };

  // --- FetchXML query ---
  const [fxEntity, setFxEntity] = useState('contacts');
  const [fetchXml, setFetchXml] = useState(
    `<fetch top="5">
  <entity name="contact">
    <attribute name="fullname" />
    <attribute name="emailaddress1" />
    <order attribute="createdon" descending="true" />
  </entity>
</fetch>`,
  );
  const [fxRows, setFxRows] = useState<DataverseRow[] | null>(null);
  const [fxError, setFxError] = useState<string | null>(null);
  const [fxBusy, setFxBusy] = useState(false);

  const runFetchXml = async () => {
    setFxBusy(true);
    setFxError(null);
    setFxRows(null);
    try {
      const rows = await listRows(fxEntity.trim(), { fetchXml: fetchXml.trim() });
      setFxRows(rows);
    } catch (err) {
      setFxError((err as Error).message);
    } finally {
      setFxBusy(false);
    }
  };

  // --- List tables (metadata) ---
  const [entities, setEntities] = useState<EntityInfo[] | null>(null);
  const [entError, setEntError] = useState<string | null>(null);
  const [entBusy, setEntBusy] = useState(false);

  const runListEntities = async () => {
    setEntBusy(true);
    setEntError(null);
    setEntities(null);
    try {
      const list = await listEntities();
      setEntities(list);
    } catch (err) {
      setEntError((err as Error).message);
    } finally {
      setEntBusy(false);
    }
  };

  const renderRows = (rows: DataverseRow[]) => {
    if (rows.length === 0) return <p className="api-status">No rows matched.</p>;
    return (
      <pre className="api-response-json">
        <code>{JSON.stringify(rows, null, 2)}</code>
      </pre>
    );
  };

  return (
    <div className="apis-page">
      <div className="apis-intro">
        <p>
          The Dataverse connector's generated <code>MicrosoftDataverseService</code> supports
          advanced querying (<code>$filter</code>, <code>$orderby</code>, <code>fetchXml</code>) and
          metadata operations (<code>GetEntities</code>) directly. All three cards below run live
          against your environment.
        </p>
      </div>

      {/* ── Card 1: OData Query ── */}
      <div className="api-entry">
        <div className="api-entry-meta">
          <span className="api-badge api-badge--function">OData Query</span>
          <h2 className="api-entry-name">ListRecords · $filter / $orderby / $top</h2>
          <p className="api-entry-desc">
            Query any table with OData options via <code>ListRecords</code>. Edit the table and
            filter, then run it live.
          </p>
        </div>
        <div className="api-entry-body">
          <div className="api-section">
            <h4>Query</h4>
            <label className="mini-label">Table (entity set)</label>
            <input className="mini-input" value={odEntity} onChange={(e) => setOdEntity(e.target.value)} />
            <label className="mini-label">$filter</label>
            <input className="mini-input" value={odFilter} onChange={(e) => setOdFilter(e.target.value)} />
            <label className="mini-label">$orderby</label>
            <input className="mini-input" value={odOrderBy} onChange={(e) => setOdOrderBy(e.target.value)} />
            <label className="mini-label">$top</label>
            <input className="mini-input" value={odTop} onChange={(e) => setOdTop(e.target.value)} style={{ width: '80px' }} />
            <button className="btn-primary" onClick={runOData} disabled={odBusy || !odEntity.trim()} style={{ marginTop: '10px' }}>
              {odBusy ? 'Running…' : 'Run query'}
            </button>
          </div>
          <div className="api-section api-section--response">
            <h4>Live results</h4>
            {odError && <p className="api-error">{odError}</p>}
            {odRows && renderRows(odRows)}
            {!odError && !odRows && !odBusy && (
              <pre className="api-response-json api-response-json--void"><code>Run a query to see rows</code></pre>
            )}
          </div>
        </div>
      </div>

      {/* ── Card 2: FetchXML Query ── */}
      <div className="api-entry">
        <div className="api-entry-meta">
          <span className="api-badge api-badge--action">FetchXML Query</span>
          <h2 className="api-entry-name">ListRecords · fetchXml</h2>
          <p className="api-entry-desc">
            Run advanced FetchXML queries via <code>ListRecords</code>'s <code>fetchXml</code>{' '}
            parameter — aggregation, link-entities, and more.
          </p>
        </div>
        <div className="api-entry-body">
          <div className="api-section">
            <h4>FetchXML</h4>
            <label className="mini-label">Table (entity set)</label>
            <input className="mini-input" value={fxEntity} onChange={(e) => setFxEntity(e.target.value)} />
            <textarea
              className="mini-input"
              value={fetchXml}
              onChange={(e) => setFetchXml(e.target.value)}
              rows={8}
              style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
            />
            <button className="btn-primary" onClick={runFetchXml} disabled={fxBusy || !fetchXml.trim()} style={{ marginTop: '10px' }}>
              {fxBusy ? 'Running…' : 'Run FetchXML'}
            </button>
          </div>
          <div className="api-section api-section--response">
            <h4>Live results</h4>
            {fxError && <p className="api-error">{fxError}</p>}
            {fxRows && renderRows(fxRows)}
            {!fxError && !fxRows && !fxBusy && (
              <pre className="api-response-json api-response-json--void"><code>Run FetchXML to see rows</code></pre>
            )}
          </div>
        </div>
      </div>

      {/* ── Card 3: List Tables (metadata) ── */}
      <div className="api-entry">
        <div className="api-entry-meta">
          <span className="api-badge api-badge--bound">Metadata</span>
          <h2 className="api-entry-name">GetEntities · list all tables</h2>
          <p className="api-entry-desc">
            A read-only metadata capability the connector exposes directly via{' '}
            <code>GetEntities</code>. No input needed — click to list every table in your
            environment with its logical and entity-set names.
          </p>
        </div>
        <div className="api-entry-body">
          <div className="api-section">
            <h4>Connector call</h4>
            <pre className="api-code"><code>{`await listEntities();
// MicrosoftDataverseService.GetEntities`}</code></pre>
            <button className="btn-primary" onClick={runListEntities} disabled={entBusy} style={{ marginTop: '10px' }}>
              {entBusy ? 'Loading…' : 'List tables'}
            </button>
          </div>
          <div className="api-section api-section--response">
            <h4>Live results {entities ? `(${entities.length})` : ''}</h4>
            {entError && <p className="api-error">{entError}</p>}
            {entities && entities.length > 0 && (
              <ul className="entity-list">
                {entities.map((e) => (
                  <li key={e.metadataId || e.logicalName} className="entity-row">
                    <span className="entity-display">{e.displayName}</span>
                    <span className="entity-logical">{e.logicalName}</span>
                    <span className="entity-set">{e.entitySetName}</span>
                  </li>
                ))}
              </ul>
            )}
            {!entError && !entities && !entBusy && (
              <pre className="api-response-json api-response-json--void"><code>Click to list tables</code></pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
