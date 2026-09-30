import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  User,
  UserPlus,
  LogIn,
  Award,
  Building2,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronRight
} from 'lucide-react';
import { authService } from '../services/authService';
import { useToast } from '../components/Toast';

export default function LoginPage({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  // Determine starting process: if path is /register, open register, otherwise open login (Normal Process)
  const startMode = initialMode || (location.pathname === '/register' ? 'register' : 'login');
  const [mode, setMode] = useState(startMode);

  // Sync mode if route changes
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else {
      setMode('login');
    }
  }, [location.pathname]);

  // Login Form States (Normal Process)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form States (Register Process)
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRank, setRegRank] = useState('Lieutenant');
  const [regUnit, setRegUnit] = useState('Joint Logistics Command HQ');
  const [regRole, setRegRole] = useState('Staff');
  const [regServiceId, setRegServiceId] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Registered Success State
  const [registrationSuccessData, setRegistrationSuccessData] = useState(null);

  // Common States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Generate random military Service ID
  const generateNewServiceId = () => {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const prefix = regRank === 'Colonel' || regRank === 'Major' ? 'OFF' : 'MIL';
    setRegServiceId(`${prefix}-${randomDigits}`);
  };

  useEffect(() => {
    generateNewServiceId();
  }, []);

  const demoAccounts = [
    { role: 'Admin', rank: 'Colonel', username: 'col_mitchell', email: 'admin@example.com', pass: 'Admin@123', color: '#ef4444' },
    { role: 'Manager', rank: 'Major', username: 'maj_vance', email: 'manager@example.com', pass: 'Manager@123', color: '#f59e0b' },
    { role: 'Staff', rank: 'Staff Sergeant', username: 'sgt_miller', email: 'staff@example.com', pass: 'Staff@123', color: '#10b981' }
  ];

  const handleQuickFill = (acc) => {
    setLoginIdentifier(acc.username);
    setLoginPassword(acc.pass);
    setErrorMessage('');
  };

  // Normal Process: Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      setErrorMessage('Please enter both your Call-sign / Email and Password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const data = await authService.login(loginIdentifier, loginPassword);
      if (data.success) {
        addToast(`Welcome to Command HQ, ${data.user.rank_title || ''} ${data.user.username}!`, 'success');
        navigate('/dashboard');
      } else {
        setErrorMessage(data.message || 'Access Denied. Check credentials.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Authentication service unreachable.');
    } finally {
      setLoading(false);
    }
  };

  // Register Process: Enlistment Handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regUsername || !regEmail || !regPassword) {
      setErrorMessage('Please complete all required enlistment fields.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Access cipher must contain at least 6 characters.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Password confirmation does not match chosen cipher.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword,
        rank_title: regRank,
        military_unit: regUnit,
        role: regRole,
        service_id: regServiceId
      };

      const data = await authService.register(payload, false);
      if (data.success) {
        addToast(`Officer enlistment record created successfully!`, 'success');
        setRegistrationSuccessData({
          user: data.user,
          token: data.token,
          identifier: regUsername.trim(),
          password: regPassword
        });
      } else {
        setErrorMessage(data.message || 'Registration rejected.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Enlistment server processing error.');
    } finally {
      setLoading(false);
    }
  };

  // Transition from Register Process to Normal Process (Login)
  const proceedToNormalProcess = () => {
    if (registrationSuccessData) {
      setLoginIdentifier(registrationSuccessData.identifier);
      setLoginPassword(registrationSuccessData.password);
    }
    setRegistrationSuccessData(null);
    setErrorMessage('');
    setMode('login');
    navigate('/login', { replace: true });
  };

  // Immediate Direct Command Access from registration
  const proceedDirectToDashboard = () => {
    if (registrationSuccessData?.token && registrationSuccessData?.user) {
      localStorage.setItem('mams_token', registrationSuccessData.token);
      localStorage.setItem('mams_user', JSON.stringify(registrationSuccessData.user));
      addToast(`Direct command clearance granted for ${registrationSuccessData.user.username}!`, 'success');
      navigate('/dashboard');
    } else {
      proceedToNormalProcess();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      position: 'relative'
    }}>
      {/* Top Left Command Branding */}
      <div style={{
        position: 'absolute',
        top: 24,
        left: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #059669, #0284c7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)'
        }}>
          <Shield size={22} />
        </div>
        <div>
          <div className="tactical-title" style={{ fontSize: '1.15rem', color: '#f8fafc', letterSpacing: '0.06em' }}>
            DLAMS COMMAND HQ
          </div>
          <div className="mono" style={{ fontSize: '0.7rem', color: '#38bdf8' }}>
            MILITARY ASSET MANAGEMENT SYSTEM // SECURE PORTAL
          </div>
        </div>
      </div>

      <div style={{
        width: '100%',
        maxWidth: mode === 'register' && !registrationSuccessData ? '580px' : '480px',
        position: 'relative',
        zIndex: 10,
        transition: 'all 0.3s ease'
      }}>
        {/* Process Mode Stepper Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 16,
          background: '#0f172a',
          padding: '6px',
          borderRadius: 10,
          border: '1px solid #334155'
        }}>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
              navigate('/login', { replace: true });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 8,
              border: 'none',
              background: mode === 'login'
                ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(2, 132, 199, 0.4))'
                : 'transparent',
              color: mode === 'login' ? '#38bdf8' : 'var(--text-secondary)',
              fontWeight: mode === 'login' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: mode === 'login' ? 'inset 0 0 0 1px #0284c7' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <LogIn size={16} />
            <span>LOGIN / NORMAL PROCESS</span>
            {mode === 'login' && (
              <span style={{
                background: '#38bdf8',
                color: '#0f172a',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: 4,
                marginLeft: 4
              }}>
                ACTIVE
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage('');
              navigate('/register', { replace: true });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 8,
              border: 'none',
              background: mode === 'register'
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.4))'
                : 'transparent',
              color: mode === 'register' ? '#34d399' : 'var(--text-secondary)',
              fontWeight: mode === 'register' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: mode === 'register' ? 'inset 0 0 0 1px #10b981' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <UserPlus size={16} />
            <span>REGISTER PROCESS</span>
            {mode === 'register' && (
              <span style={{
                background: '#10b981',
                color: '#0f172a',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: 4,
                marginLeft: 4
              }}>
                ENLIST
              </span>
            )}
          </button>
        </div>

        {/* Main Card Container */}
        <div className="card" style={{
          borderColor: mode === 'register' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(56, 189, 248, 0.4)',
          padding: '32px 28px',
          boxShadow: mode === 'register'
            ? '0 12px 32px rgba(16, 185, 129, 0.12)'
            : '0 12px 32px rgba(56, 189, 248, 0.12)'
        }}>
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="hud-corner hud-bl" />
          <div className="hud-corner hud-br" />

          {/* Registration Success Overlay Screen */}
          {registrationSuccessData ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#10b981',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
              }}>
                <CheckCircle2 size={32} />
              </div>

              <div className="mono" style={{ fontSize: '0.75rem', color: '#10b981', letterSpacing: '0.1em', marginBottom: 4 }}>
                [ ENLISTMENT VERIFIED // CREDENTIALS ISSUED ]
              </div>
              <h2 className="tactical-title" style={{ fontSize: '1.4rem', color: '#f8fafc', marginBottom: 8 }}>
                OFFICER REGISTERED SUCCESSFULLY
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                Your military credentials and service identification have been committed to the command ledger.
              </p>

              {/* Personnel Summary Card */}
              <div style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                padding: '16px',
                textAlign: 'left',
                marginBottom: 24
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.825rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem' }}>CALL-SIGN / USERNAME</span>
                    <strong style={{ color: '#f8fafc' }}>{registrationSuccessData.user.username}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem' }}>SERVICE IDENTIFIER</span>
                    <strong className="mono" style={{ color: '#38bdf8' }}>{registrationSuccessData.user.service_id}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem' }}>RANK & CLEARANCE</span>
                    <span style={{ color: '#34d399', fontWeight: 600 }}>
                      {registrationSuccessData.user.rank_title} [{registrationSuccessData.user.role}]
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem' }}>ASSIGNED UNIT</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{registrationSuccessData.user.military_unit}</span>
                  </div>
                </div>
              </div>

              {/* Two Next Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  type="button"
                  onClick={proceedToNormalProcess}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '0.925rem',
                    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  Proceed to Login (Normal Process) <ChevronRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={proceedDirectToDashboard}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: 6,
                    border: '1px solid #10b981',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#34d399',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                >
                  <Shield size={16} /> Instant Direct Access to Dashboard
                </button>
              </div>
            </div>
          ) : mode === 'login' ? (
            /* =========================================================================
               LOGIN / NORMAL PROCESS (Username & Password Authentication)
               ========================================================================= */
            <div>
              <div style={{ textAlign: 'center', marginBottom: 22 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid #0284c7',
                  color: '#38bdf8',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  marginBottom: 8
                }}>
                  <LogIn size={13} />
                  <span>NORMAL PROCESS // SIGN-IN</span>
                </div>
                <h2 className="tactical-title" style={{ fontSize: '1.45rem', color: '#f8fafc', marginBottom: 4 }}>
                  AUTHENTICATE ACCESS
                </h2>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  Enter your Username (or Email) and Access Password to enter Command HQ.
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 6,
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  color: '#f87171',
                  fontSize: '0.825rem',
                  marginBottom: 16
                }}>
                  <AlertCircle size={17} style={{ flexShrink: 0 }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Normal Process: Login Form */}
              <form onSubmit={handleLogin}>
                {/* Username or Military Email */}
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label" style={{ fontSize: '0.825rem' }}>Username or Military Email</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. col_mitchell or admin@example.com"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      style={{ paddingLeft: 38 }}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password / Access Cipher */}
                <div className="form-group" style={{ marginBottom: 18 }}>
                  <label className="form-label" style={{ fontSize: '0.825rem' }}>Access Password / Cipher</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      style={{ paddingLeft: 38, paddingRight: 36 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>Verifying Credentials...</>
                  ) : (
                    <>
                      Login to Dashboard <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Login Selector Section */}
              <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px dashed #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <KeyRound size={14} color="#38bdf8" />
                  <span className="tactical-title" style={{ fontSize: '0.775rem', color: '#38bdf8' }}>
                    DEMO CREDENTIALS (CLICK TO AUTOFILL)
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleQuickFill(acc)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: 6,
                        background: '#1e293b',
                        border: '1px solid #334155',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '0.775rem',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = acc.color}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#334155'}
                    >
                      <div>
                        <span style={{ fontWeight: 700, color: acc.color, marginRight: 6 }}>
                          [{acc.role}]
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>{acc.username}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginLeft: 6 }}>({acc.rank})</span>
                      </div>
                      <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {acc.pass}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Switcher to Register Process */}
              <div style={{
                textAlign: 'center',
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px dashed #334155',
                fontSize: '0.825rem',
                color: 'var(--text-secondary)'
              }}>
                Need new personnel account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage('');
                    navigate('/register', { replace: true });
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#34d399',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Switch to Register Process (Enlistment) →
                </button>
              </div>
            </div>
          ) : (
            /* =========================================================================
               REGISTER PROCESS (Personnel Enlistment Protocol)
               ========================================================================= */
            <div>
              <div style={{ textAlign: 'center', marginBottom: 22 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid #10b981',
                  color: '#34d399',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  marginBottom: 8
                }}>
                  <UserPlus size={13} />
                  <span>REGISTRATION PROCESS // ENLISTMENT</span>
                </div>
                <h2 className="tactical-title" style={{ fontSize: '1.45rem', color: '#f8fafc', marginBottom: 4 }}>
                  OFFICER ENLISTMENT
                </h2>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  Register new defense credentials into the Joint Logistics Command Ledger.
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 6,
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  color: '#f87171',
                  fontSize: '0.825rem',
                  marginBottom: 16
                }}>
                  <AlertCircle size={17} style={{ flexShrink: 0 }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Register Form */}
              <form onSubmit={handleRegister}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* Call-sign / Username */}
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Call-sign / Username *</label>
                    <div style={{ position: 'relative' }}>
                      <User size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. capt_conner"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        style={{ paddingLeft: 34, fontSize: '0.85rem' }}
                        required
                      />
                    </div>
                  </div>

                  {/* Official Military Email */}
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Official Military Email *</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="email"
                        className="form-input"
                        placeholder="officer@mams.internal"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        style={{ paddingLeft: 34, fontSize: '0.85rem' }}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* Military Rank */}
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Military Rank</label>
                    <div style={{ position: 'relative' }}>
                      <Award size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <select
                        className="form-input"
                        value={regRank}
                        onChange={(e) => {
                          setRegRank(e.target.value);
                          if (e.target.value === 'Colonel') setRegRole('Admin');
                          else if (e.target.value === 'Major' || e.target.value === 'Captain') setRegRole('Manager');
                          else setRegRole('Staff');
                        }}
                        style={{ paddingLeft: 34, fontSize: '0.85rem' }}
                      >
                        <option value="Specialist">Specialist (E-4)</option>
                        <option value="Corporal">Corporal (E-4)</option>
                        <option value="Sergeant">Sergeant (E-5)</option>
                        <option value="Staff Sergeant">Staff Sergeant (E-6)</option>
                        <option value="Lieutenant">Lieutenant (O-2)</option>
                        <option value="Captain">Captain (O-3)</option>
                        <option value="Major">Major (O-4)</option>
                        <option value="Colonel">Colonel (O-6)</option>
                        <option value="Chief Warrant Officer">Chief Warrant Officer (CW-3)</option>
                      </select>
                    </div>
                  </div>

                  {/* Assigned Unit */}
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Assigned Unit / Branch</label>
                    <div style={{ position: 'relative' }}>
                      <Building2 size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <select
                        className="form-input"
                        value={regUnit}
                        onChange={(e) => setRegUnit(e.target.value)}
                        style={{ paddingLeft: 34, fontSize: '0.85rem' }}
                      >
                        <option value="Joint Logistics Command HQ">Joint Logistics Command HQ</option>
                        <option value="4th Armored Battalion Depot">4th Armored Battalion Depot</option>
                        <option value="Armory Operations Sec-9">Armory Operations Sec-9</option>
                        <option value="Signals & Cyber Operations">Signals & Cyber Operations</option>
                        <option value="Forward Depot Delta">Forward Depot Delta</option>
                        <option value="Depot Bravo Maintenance">Depot Bravo Maintenance</option>
                        <option value="Airbase Sierra Logistics">Airbase Sierra Logistics</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* Role / Clearance Level */}
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Role / Clearance</label>
                    <select
                      className="form-input"
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    >
                      <option value="Staff">Staff (Standard Inventory & Logging)</option>
                      <option value="Manager">Manager (Transfers, Approvals & Fleet)</option>
                      <option value="Admin">Admin (Full HQ Command & Audits)</option>
                    </select>
                  </div>

                  {/* Service ID (Auto-Generated) */}
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: 4 }}>Service ID / Tag</label>
                      <button
                        type="button"
                        onClick={generateNewServiceId}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#38bdf8',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <RefreshCw size={11} /> Generate
                      </button>
                    </div>
                    <input
                      type="text"
                      className="form-input mono"
                      value={regServiceId}
                      onChange={(e) => setRegServiceId(e.target.value.toUpperCase())}
                      style={{ fontSize: '0.85rem', color: '#38bdf8', letterSpacing: '0.05em' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* Access Cipher */}
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Access Cipher *</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Min 6 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        style={{ paddingLeft: 34, paddingRight: 32, fontSize: '0.85rem' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Cipher */}
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Confirm Cipher *</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Re-enter cipher"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        style={{ paddingLeft: 34, fontSize: '0.85rem' }}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '0.925rem',
                    background: 'linear-gradient(135deg, #059669, #10b981)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>Registering Officer Credentials...</>
                  ) : (
                    <>
                      <UserPlus size={18} /> Complete Registration & Enlist
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Switcher to Normal Process */}
              <div style={{
                textAlign: 'center',
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px dashed #334155',
                fontSize: '0.825rem',
                color: 'var(--text-secondary)'
              }}>
                Already have active credentials?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                    navigate('/login', { replace: true });
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#38bdf8',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Switch to Login / Normal Process →
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 14, fontSize: '0.725rem', color: '#64748b' }}>
          Educational Defense Demonstration System • All Personnel Data strictly fictional
        </div>
      </div>
    </div>
  );
}
