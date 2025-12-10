import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API } from '../App';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        username,
        password,
      });

      setToken(response.data.token);
      toast.success('Welcome to OneFam!');
      navigate('/');
    } catch (error) {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 paper-texture" style={{ background: '#F5F2EB' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8 fade-in">
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight leading-[0.9] mb-4" style={{ fontFamily: 'Playfair Display', color: '#2C4F42' }}>
            OneFam
          </h1>
          <p className="text-base md:text-lg font-sans leading-relaxed" style={{ color: '#78716C' }}>
            The Modern Heirloom
          </p>
        </div>

        <div
          data-testid="login-form"
          className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-8 slide-in"
          style={{
            boxShadow: '0 4px 6px -1px rgba(44, 79, 66, 0.05), 0 2px 4px -1px rgba(44, 79, 66, 0.03)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-mono uppercase tracking-widest mb-2"
                style={{ color: '#78716C' }}
              >
                Username
              </label>
              <input
                id="username"
                data-testid="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/40 border-b-2 border-primary/10 focus:border-primary/50 rounded-t-md px-4 py-3 outline-none font-serif text-lg"
                style={{
                  borderColor: '#2C4F42',
                  borderWidth: '0 0 2px 0',
                  transition: 'border-color 0.3s ease',
                }}
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-mono uppercase tracking-widest mb-2"
                style={{ color: '#78716C' }}
              >
                Password
              </label>
              <input
                id="password"
                data-testid="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/40 border-b-2 border-primary/10 focus:border-primary/50 rounded-t-md px-4 py-3 outline-none font-serif text-lg"
                style={{
                  borderColor: '#2C4F42',
                  borderWidth: '0 0 2px 0',
                  transition: 'border-color 0.3s ease',
                }}
                placeholder="Enter password"
                required
              />
            </div>

            <button
              data-testid="login-button"
              type="submit"
              disabled={loading}
              className="w-full text-white rounded-full px-8 py-3 font-serif italic flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#2C4F42',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {loading ? (
                'Logging in...'
              ) : (
                <>
                  <LogIn size={20} />
                  Login
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
