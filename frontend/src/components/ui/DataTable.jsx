import { useMemo, useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import Icon from './Icon';
import { Button } from './Button';
import { Popover, MenuItem, MenuLabel } from './Overlay';
import { EmptyState } from './State';

/**
 * Data table engine.
 *
 * `columns`: [{ key, label, align: 'right', sortable, hidden, render(row) }]
 * Reproduces the exported behaviour: free-text search across `searchKeys`,
 * numeric-aware sorting, ellipsis pager, per-table column visibility, and a
 * result count footer.
 */
export default function DataTable({
  rows = [],
  columns = [],
  searchKeys = [],
  searchPlaceholder = 'Search',
  numericKeys = [],
  defaultSort = null,
  defaultDir = 'desc',
  pageSize = 8,
  filters,
  toolbarRight,
  emptyIcon = 'search',
  emptyTitle = 'Nothing to show yet',
  emptyText = 'Data will appear here once your project starts reporting.',
  emptyAction,
  rowKey = (r) => r.id,
  onRowClick,
  loading = false,
  toolbarLabel,
  className,
}) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState(defaultSort);
  const [dir, setDir] = useState(defaultDir);
  const [page, setPage] = useState(1);
  const [hidden, setHidden] = useState(() =>
    columns.reduce((acc, c) => ({ ...acc, [c.key]: c.hidden === true }), {}),
  );
  const [colsOpen, setColsOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    setPage(1);
  }, [q, rows.length]);

  const visibleRows = useMemo(() => {
    let out = rows;
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      out = out.filter((row) =>
        searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(needle)),
      );
    }
    if (sort) {
      const numeric = numericKeys.includes(sort);
      const mul = dir === 'asc' ? 1 : -1;
      out = out.slice().sort((a, b) => {
        let av = a[sort];
        let bv = b[sort];
        if (numeric) {
          av = Number(av);
          bv = Number(bv);
          if (Number.isNaN(av)) av = -Infinity;
          if (Number.isNaN(bv)) bv = -Infinity;
        }
        if (av < bv) return -1 * mul;
        if (av > bv) return 1 * mul;
        return 0;
      });
    }
    return out;
  }, [rows, q, sort, dir, searchKeys, numericKeys]);

  const pages = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const current = Math.min(page, pages);
  const slice = visibleRows.slice((current - 1) * pageSize, current * pageSize);

  const cols = columns.filter((c) => !hidden[c.key]);

  const toggleSort = (key) => {
    if (sort === key) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSort(key);
      setDir('desc');
    }
  };

  const pagerNumbers = [];
  for (let p = 1; p <= pages; p += 1) {
    if (pages > 7 && p > 2 && p < pages - 1 && Math.abs(p - current) > 1) {
      if (pagerNumbers[pagerNumbers.length - 1] !== '…') pagerNumbers.push('…');
      continue;
    }
    pagerNumbers.push(p);
  }

  if (!loading && !visibleRows.length) {
    return (
      <div className={cn('card-body', className)}>
        <EmptyState
          icon={emptyIcon}
          title={q.trim() ? 'No results' : emptyTitle}
          text={
            q.trim()
              ? `No rows match “${q.trim()}”. Try a different search term.`
              : emptyText
          }
          actions={
            q.trim() ? (
              <Button variant="outline" size="sm" icon="close" onClick={() => setQ('')}>
                Clear search
              </Button>
            ) : (
              emptyAction
            )
          }
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="dt-toolbar">
        <div className="search-wrap dt-search">
          <Icon name="search" size={14} />
          <input
            ref={searchRef}
            className="input"
            type="search"
            value={q}
            placeholder={searchPlaceholder}
            aria-label={toolbarLabel || searchPlaceholder}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {filters}
        <div className="spacer" />
        {toolbarRight}
        <Popover
          open={colsOpen}
          onClose={() => setColsOpen(false)}
          width={210}
          trigger={
            <Button
              variant="outline"
              size="sm"
              icon="columns"
              aria-haspopup="menu"
              aria-expanded={colsOpen}
              onClick={() => setColsOpen((o) => !o)}
            >
              Columns
            </Button>
          }
        >
          <div className="menu">
            <MenuLabel>Visible columns</MenuLabel>
            {columns.map((c) => (
              <MenuItem
                key={c.key}
                icon={hidden[c.key] ? 'close' : 'check'}
                aria-checked={!hidden[c.key]}
                onClick={() => setHidden((h) => ({ ...h, [c.key]: !h[c.key] }))}
              >
                {c.label}
              </MenuItem>
            ))}
          </div>
        </Popover>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {cols.map((c) => {
                const on = sort === c.key;
                return (
                  <th
                    key={c.key}
                    className={cn(c.align === 'right' && 'num', c.sortable !== false && 'sortable')}
                    aria-sort={on ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    onClick={c.sortable !== false ? () => toggleSort(c.key) : undefined}
                  >
                    <span className="th-inner">
                      {c.label}
                      {on ? <Icon name={dir === 'asc' ? 'upRight' : 'downRight'} size={12} /> : null}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: Math.min(pageSize || 6, 8) }).map((_, r) => (
                <tr key={r} className="animate-pulse">
                  {cols.map((c) => (
                    <td key={c.key} className={cn(c.align === 'right' && 'num')}>
                      <div className={cn("skeleton skeleton--text h-3.5 my-1", c.align === 'right' ? 'w-16 ml-auto' : 'w-3/4')} />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              slice.map((row, i) => (
                <tr
                  key={rowKey(row) ?? i}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={onRowClick ? 'cursor-pointer' : undefined}
                >
                  {cols.map((c) => (
                    <td key={c.key} className={cn(c.align === 'right' && 'num')}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {visibleRows.length > 0 ? (
        <div className="dt-foot">
          <span className="dt-count">
            Showing {(current - 1) * pageSize + 1}–{Math.min(visibleRows.length, current * pageSize)} of{' '}
            {visibleRows.length}
          </span>
          {pages > 1 ? (
            <div className="dt-pager">
              <button
                type="button"
                className="page-btn"
                onClick={() => setPage(current - 1)}
                disabled={current <= 1}
                aria-label="Previous page"
              >
                <Icon name="chevronLeft" size={14} />
              </button>
              {pagerNumbers.map((p, i) =>
                p === '…' ? (
                  <span key={`gap-${i}`} className="dt-count">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className="page-btn"
                    aria-current={p === current}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                type="button"
                className="page-btn"
                onClick={() => setPage(current + 1)}
                disabled={current >= pages}
                aria-label="Next page"
              >
                <Icon name="chevronRight" size={14} />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}