import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SystemAdmin() {
  const [publishers, setPublishers] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchPublishers();
  }, []);

  const fetchPublishers = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/publishers', { headers });
      setPublishers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/publishers', { name, domain, email, password }, { headers });
      fetchPublishers();
      setName(''); setDomain(''); setEmail(''); setPassword('');
    } catch (err) {
      alert('Failed to create publisher');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/publishers/${id}`, { headers });
      fetchPublishers();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="system-admin">
      <h2>System Dashboard</h2>
      
      <div className="panel">
        <h3>Add Publisher</h3>
        <form onSubmit={handleCreate} className="admin-form">
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
          <input placeholder="Domain" value={domain} onChange={e => setDomain(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="btn primary-btn">Create</button>
        </form>
      </div>

      <div className="panel mt-4">
        <h3>Publishers</h3>
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Domain</th><th>Email</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {publishers.map(pub => (
              <tr key={pub.id}>
                <td>{pub.name}</td>
                <td>{pub.domain}</td>
                <td>{pub.email}</td>
                <td>{pub.role}</td>
                <td>
                  {pub.role !== 'admin' && (
                    <button onClick={() => handleDelete(pub.id)} className="btn danger-btn">Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
