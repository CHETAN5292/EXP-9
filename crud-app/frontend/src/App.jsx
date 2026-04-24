// src/App.jsx — Student Management System Frontend
import { useState, useEffect, useCallback } from 'react';
import { studentAPI } from './utils/api';

// ── Helper ──────────────────────────────────────────────────────
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// ── Alert Component ─────────────────────────────────────────────
function Alert({ msg, onClose }) {
  if (!msg.text) return null;
  return (
    <div className={`alert alert-${msg.type}`}>
      <span>{msg.type === 'success' ? '✓' : msg.type === 'error' ? '✕' : 'ℹ'}</span>
      <span style={{ flex: 1 }}>{msg.text}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>✕</button>
    </div>
  );
}

// ── Student Form (used in modal) ────────────────────────────────
function StudentForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial || { name: '', email: '', course: '', age: '', phone: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.trim().length < 2) e.name = 'Min 2 characters';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.course.trim()) e.course = 'Course is required';
    if (!form.age) e.age = 'Age is required';
    else if (form.age < 10 || form.age > 100) e.age = 'Age must be 10–100';
    return e;
  };

  const onChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input className={`form-input ${errors.name ? 'error' : ''}`} name="name" value={form.name} onChange={onChange} placeholder="Full name" />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input className={`form-input ${errors.email ? 'error' : ''}`} name="email" type="email" value={form.email} onChange={onChange} placeholder="student@email.com" />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Course *</label>
          <input className={`form-input ${errors.course ? 'error' : ''}`} name="course" value={form.course} onChange={onChange} placeholder="e.g. B.Tech CSE" />
          {errors.course && <span className="form-error">{errors.course}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Age *</label>
          <input className={`form-input ${errors.age ? 'error' : ''}`} name="age" type="number" value={form.age} onChange={onChange} placeholder="18" min="10" max="100" />
          {errors.age && <span className="form-error">{errors.age}</span>}
        </div>
        <div className="form-group full">
          <label className="form-label">Phone (optional)</label>
          <input className="form-input" name="phone" value={form.phone} onChange={onChange} placeholder="+91 99999 00000" />
        </div>
      </div>
      <div className="modal-footer" style={{ padding: '16px 0 0' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <><span className="spinner" /> Saving…</> : (initial ? 'Update Student' : 'Add Student')}
        </button>
      </div>
    </form>
  );
}

// ── Delete Confirm Modal ────────────────────────────────────────
function DeleteModal({ student, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <span className="modal-title">⚠ CONFIRM DELETE</span>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center', padding: '28px 20px' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🗑</div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
            Delete <strong style={{ color: 'var(--text)' }}>{student.name}</strong>?<br />
            <span style={{ color: 'var(--red)', fontSize: 12 }}>This action cannot be undone.</span>
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <><span className="spinner" style={{ borderTopColor: 'currentColor' }} /> Deleting…</> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 8 });
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const notify = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  // ── Fetch students ───────────────────────────────────────────
  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await studentAPI.getAll({
        search, page, limit: pagination.limit,
        sort: sortField, order: sortOrder,
      });
      setStudents(res.data.data);
      setPagination(p => ({ ...p, ...res.data.pagination, page }));
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to load students.');
    } finally { setLoading(false); }
  }, [search, sortField, sortOrder, pagination.limit]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await studentAPI.getStats();
      setStats(res.data.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchStudents(1); }, [search, sortField, sortOrder]);
  useEffect(() => { fetchStats(); }, [students]);

  // ── Create ──────────────────────────────────────────────────
  const handleCreate = async (form) => {
    setActionLoading(true);
    try {
      await studentAPI.create({ ...form, age: Number(form.age) });
      notify('success', `Student "${form.name}" added successfully!`);
      setShowAdd(false);
      fetchStudents(1);
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to create student.');
    } finally { setActionLoading(false); }
  };

  // ── Update ──────────────────────────────────────────────────
  const handleUpdate = async (form) => {
    setActionLoading(true);
    try {
      await studentAPI.update(editStudent._id, { ...form, age: Number(form.age) });
      notify('success', `Student "${form.name}" updated!`);
      setEditStudent(null);
      fetchStudents(pagination.page);
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to update student.');
    } finally { setActionLoading(false); }
  };

  // ── Delete ──────────────────────────────────────────────────
  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await studentAPI.delete(deleteTarget._id);
      notify('success', `Student "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchStudents(pagination.page);
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to delete.');
    } finally { setActionLoading(false); }
  };

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="header">
        <div className="header-inner">
          <div className="header-logo">
            <span>STUDENT_MGMT</span>
            <span className="tag">CRUD v1.0</span>
          </div>
          <div className="header-stats">
            <span>TOTAL <span className="header-stat-val">{stats.totalStudents ?? '—'}</span></span>
            <span>ACTIVE <span className="header-stat-val">{stats.activeStudents ?? '—'}</span></span>
            <span>DB <span className="header-stat-val" style={{ color: '#4ade80' }}>CONNECTED</span></span>
          </div>
        </div>
      </header>

      <main className="app">
        <Alert msg={msg} onClose={() => setMsg({ type: '', text: '' })} />

        {/* ── Stats Row ─────────────────────────────────────────── */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total Students</div>
            <div className="stat-value">{stats.totalStudents ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active</div>
            <div className="stat-value green">{stats.activeStudents ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Inactive</div>
            <div className="stat-value red">{stats.inactiveStudents ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Age</div>
            <div className="stat-value blue">{stats.ageStats?.avgAge?.toFixed(1) ?? '—'}</div>
          </div>
        </div>

        {/* ── Main Table Card ───────────────────────────────────── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">// STUDENT RECORDS</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
              + ADD STUDENT
            </button>
          </div>
          <div className="card-body">
            {/* Toolbar */}
            <div className="toolbar">
              <div className="search-box">
                <span className="search-icon">⌕</span>
                <input
                  className="form-input"
                  placeholder="Search by name, email, or course…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select className="select-input" value={sortField} onChange={e => setSortField(e.target.value)}>
                <option value="createdAt">Sort: Date Added</option>
                <option value="name">Sort: Name</option>
                <option value="age">Sort: Age</option>
                <option value="course">Sort: Course</option>
              </select>
              <select className="select-input" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="desc">↓ Desc</option>
                <option value="asc">↑ Asc</option>
              </select>
            </div>

            {/* Table */}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Age</th>
                    <th>Status</th>
                    <th>Added</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32 }}>
                      <span className="spinner spinner-dark" style={{ margin: '0 auto' }} />
                    </td></tr>
                  ) : students.length === 0 ? (
                    <tr><td colSpan={8}>
                      <div className="empty">
                        <div className="empty-icon">📭</div>
                        <div className="empty-title">No students found</div>
                        <div className="empty-sub">{search ? 'Try a different search term.' : 'Click + ADD STUDENT to get started.'}</div>
                      </div>
                    </td></tr>
                  ) : students.map((s, i) => (
                    <tr key={s._id}>
                      <td className="td-id">{(pagination.page - 1) * pagination.limit + i + 1}</td>
                      <td className="td-name">{s.name}</td>
                      <td className="td-email">{s.email}</td>
                      <td><span className="badge badge-course">{s.course}</span></td>
                      <td className="td-age">{s.age}</td>
                      <td>
                        <span className={`badge ${s.isActive ? 'badge-active' : 'badge-inactive'}`}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                        {fmtDate(s.createdAt)}
                      </td>
                      <td className="td-actions">
                        <button className="btn btn-edit btn-sm" onClick={() => setEditStudent(s)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(s)}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <span>
                  Showing {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </span>
                <div className="page-btns">
                  <button className="page-btn" onClick={() => fetchStudents(pagination.page - 1)} disabled={!pagination.hasPrevPage}>← Prev</button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(n => Math.abs(n - pagination.page) <= 2)
                    .map(n => (
                      <button key={n} className={`page-btn ${n === pagination.page ? 'active' : ''}`} onClick={() => fetchStudents(n)}>{n}</button>
                    ))}
                  <button className="page-btn" onClick={() => fetchStudents(pagination.page + 1)} disabled={!pagination.hasNextPage}>Next →</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Course breakdown */}
        {stats.courseBreakdown?.length > 0 && (
          <div className="card">
            <div className="card-header"><span className="card-title">// COURSE BREAKDOWN</span></div>
            <div className="card-body" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {stats.courseBreakdown.map(c => (
                <div key={c._id} style={{ background: 'var(--bg-input)', border: '1.5px solid var(--border-dk)', borderRadius: 'var(--radius)', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600 }}>{c._id}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Reference */}
        <div className="card">
          <div className="card-header"><span className="card-title">// API REFERENCE (for Postman)</span></div>
          <div className="card-body">
            {[
              ['POST',   'POST /api/students',       '201', 'Create student'],
              ['GET',    'GET /api/students',         '200', 'Get all + search + pagination'],
              ['GET',    'GET /api/students/stats',   '200', 'Platform statistics'],
              ['GET',    'GET /api/students/:id',     '200', 'Get by ID'],
              ['PUT',    'PUT /api/students/:id',     '200', 'Update student'],
              ['DELETE', 'DELETE /api/students/:id',  '200', 'Delete student'],
            ].map(([method, url, code, desc]) => {
              const colors = { POST:'#1a5f3c', GET:'#1e40af', PUT:'#92400e', DELETE:'#b91c1c' };
              return (
                <div key={url} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)', fontFamily:'var(--font-mono)', fontSize:12 }}>
                  <span style={{ background: colors[method], color:'#fff', padding:'2px 8px', borderRadius:2, fontSize:10, fontWeight:700, minWidth:54, textAlign:'center' }}>{method}</span>
                  <span style={{ flex:1, color:'var(--text)' }}>{url}</span>
                  <span style={{ background:'var(--accent-lt)', color:'var(--accent)', padding:'1px 8px', borderRadius:2, fontSize:10 }}>{code}</span>
                  <span style={{ color:'var(--text-3)' }}>{desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ── Add Modal ─────────────────────────────────────────── */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">+ ADD NEW STUDENT</span>
              <button className="close-btn" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <StudentForm onSubmit={handleCreate} onCancel={() => setShowAdd(false)} loading={actionLoading} />
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ─────────────────────────────────────────── */}
      {editStudent && (
        <div className="modal-overlay" onClick={() => setEditStudent(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">EDIT // {editStudent.name}</span>
              <button className="close-btn" onClick={() => setEditStudent(null)}>✕</button>
            </div>
            <div className="modal-body">
              <StudentForm
                initial={{ name: editStudent.name, email: editStudent.email, course: editStudent.course, age: editStudent.age, phone: editStudent.phone || '' }}
                onSubmit={handleUpdate}
                onCancel={() => setEditStudent(null)}
                loading={actionLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ───────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteModal student={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={actionLoading} />
      )}
    </>
  );
}
