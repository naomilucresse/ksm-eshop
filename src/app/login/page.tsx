'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Building2, ArrowRight, Eye, EyeOff, ArrowLeft, Loader2, ShieldCheck, Mail, KeyRound, RotateCcw } from 'lucide-react';

import { useCustomerAuthStore } from '@/store/useCustomerAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Login');
  
  const isRegistered = searchParams.get('registered') === 'true';
  const requiresVerification = searchParams.get('verify') === 'true';
  const registeredUsername = searchParams.get('username') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Double authentification (MFA)
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [savedEmail, setSavedEmail] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setInfo(null);
    
    try {
      if (showMfaInput) {
        // Validation du code OTP reçu par e-mail
        const cleanCode = otpCode.trim();
        if (!cleanCode) {
          setError('Veuillez saisir le code reçu par e-mail.');
          setLoading(false);
          return;
        }

        if (isAdmin) {
          const res = await fetch('/api/admin/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ principal: savedEmail, code: cleanCode, sessionId: mfaToken })
          });
          const data = await res.json();
          
          if (!res.ok || !data.success) {
            setError(data.message || 'Code de vérification incorrect ou expiré.');
            setLoading(false);
            return;
          }

          useAuthStore.getState().login({ name: 'Gérant (Admin)', email: savedEmail });
          const targetRoute = savedEmail.toLowerCase().trim() === 'testk965@yowyob.com' ? '/admin/super-admin' : '/admin/organizations';
          router.push(targetRoute);
        } else {
          // Confirmation MFA pour compte Client
          const res = await fetch('/api/auth/customer-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mfaToken,
              code: cleanCode,
              otp: cleanCode,
              email: savedEmail
            })
          });
          const data = await res.json();

          if (!res.ok || !data.success) {
            setError(data.message || 'Code incorrect ou expiré. Veuillez vérifier le code reçu par e-mail.');
            setLoading(false);
            return;
          }

          if (data.data) {
            useCustomerAuthStore.getState().setAuthenticated(true, data.data);
          }
          const redirectUrl = searchParams.get('redirect') || `/`;
          router.push(redirectUrl);
        }
      } else {
        // Étape 1 : Connexion avec identifiant + mot de passe
        const formData = new FormData(e.currentTarget);
        const email = (formData.get('email') as string || '').trim();
        const code = formData.get('code') as string || '';

        if (!email || !code) {
          setError('Veuillez renseigner votre identifiant et votre mot de passe.');
          setLoading(false);
          return;
        }

        setSavedEmail(email);

        if (isAdmin) {
          const res = await fetch('/api/admin/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ principal: email, password: code })
          });
          const data = await res.json();
          
          if (data.requiresMfa || data.nextStep === 'CONFIRM_MFA') {
            setShowMfaInput(true);
            setMfaToken(data.sessionId || data.mfaToken);
            setInfo(data.message || 'Un code de sécurité (OTP) vous a été envoyé par e-mail.');
            setLoading(false);
            return;
          }

          if (!res.ok || !data.success) {
            setError(data.message || 'Identifiants administrateur incorrects.');
            setLoading(false);
            return;
          }

          useAuthStore.getState().login({ name: 'Gérant (Admin)', email: email });
          const targetRoute = email.toLowerCase().trim() === 'testk965@yowyob.com' ? '/admin/super-admin' : '/admin/organizations';
          router.push(targetRoute);
        } else {
          // Connexion client
          const res = await fetch('/api/auth/customer-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
          });
          const data = await res.json();

          if (data.nextStep === 'CONFIRM_MFA' || data.requiresMfa) {
            setShowMfaInput(true);
            setMfaToken(data.mfaToken);
            setInfo(data.message || 'Un code de sécurité (OTP) vient de vous être envoyé par e-mail. Saisissez-le ci-dessous.');
            setLoading(false);
            return;
          }

          if (!res.ok || !data.success) {
            setError(data.message || 'Identifiant ou mot de passe invalide.');
            setLoading(false);
            return;
          }

          if (data.data) {
            useCustomerAuthStore.getState().setAuthenticated(true, data.data);
          }
          const redirectUrl = searchParams.get('redirect') || `/`;
          router.push(redirectUrl);
        }
      }
    } catch (err: any) {
      setError('Erreur de connexion au serveur.');
      setLoading(false);
    }
  };

  const handleResetMfa = () => {
    setShowMfaInput(false);
    setMfaToken(null);
    setOtpCode('');
    setError(null);
    setInfo(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <Link href="/">
        <Button variant="ghost" className="absolute top-4 left-4 sm:top-8 sm:left-8 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 rounded-full h-12 w-12 p-0 flex items-center justify-center">
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </Link>
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border-2 border-zinc-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
            {showMfaInput ? (
              <ShieldCheck className="h-8 w-8 text-white" />
            ) : (
              <Building2 className="h-8 w-8 text-white" />
            )}
          </div>
          <h2 className="mt-2 text-3xl font-black text-zinc-900 uppercase tracking-tighter italic">
            {showMfaInput ? 'Validation de Sécurité' : t('title')}
          </h2>
          <p className="mt-2 text-sm font-bold text-zinc-500 uppercase tracking-widest">
            {showMfaInput ? 'Code de confirmation par e-mail' : t('subtitle')}
          </p>
        </div>
        
        {!showMfaInput && isRegistered && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-bold text-center border-2 border-green-200">
            {registeredUsername ? (
              <div>
                Compte créé ! Votre identifiant de connexion est : <span className="font-black underline text-base text-green-900 block mt-1">{registeredUsername}</span>
              </div>
            ) : (
              <div>Inscription réussie ! Vous pouvez maintenant vous connecter.</div>
            )}
            {requiresVerification && (
              <p className="mt-1 text-xs text-green-800 font-normal">
                {t('confirmEmailSent')}
              </p>
            )}
          </div>
        )}

        <form className="mt-4 space-y-6" onSubmit={handleLogin}>
          {info && (
            <div className="bg-blue-50 text-blue-900 p-4 rounded-xl text-sm font-bold text-center border-2 border-blue-200">
              {info}
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center border-2 border-red-200">
              {error}
            </div>
          )}

          {showMfaInput ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>Code envoyé à l'adresse e-mail</span>
                </div>
                {savedEmail && (
                  <p className="text-sm font-black text-blue-950 bg-white/80 py-1.5 px-3 rounded-lg border border-blue-100 inline-block">
                    {savedEmail}
                  </p>
                )}
                <p className="text-xs text-zinc-600">
                  Vérifiez votre boîte de réception (et vos courriers indésirables/spams) puis saisissez le code reçu ci-dessous.
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-2 text-center">
                  Code de Sécurité (OTP)
                </label>
                <div className="relative">
                  <KeyRound className="h-5 w-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    autoFocus
                    maxLength={10}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="appearance-none block w-full pl-12 pr-4 py-3.5 border-2 border-zinc-200 placeholder-zinc-400 text-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-black transition-all text-center tracking-widest text-2xl uppercase"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-14 text-base font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-900/10 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" /> Validation...
                    </span>
                  ) : (
                    <>Valider et se connecter <ArrowRight className="ml-2 h-5 w-5" /></>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={handleResetMfa}
                  className="w-full py-2.5 text-center text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Revenir à l'écran de connexion
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-zinc-700 mb-1">
                    {t('emailLabel')}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="text"
                    defaultValue={registeredUsername}
                    autoComplete="username"
                    required
                    className="appearance-none relative block w-full px-4 py-3 border-2 border-zinc-200 placeholder-zinc-400 text-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium transition-all"
                    placeholder={t('emailPlaceholder')}
                  />
                </div>
                <div>
                  <label htmlFor="code" className="block text-sm font-bold text-zinc-700 mb-1">
                    {t('codeLabel')}
                  </label>
                  <div className="relative">
                    <input
                      id="code"
                      name="code"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className="appearance-none relative block w-full px-4 py-3 pr-12 border-2 border-zinc-200 placeholder-zinc-400 text-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm font-bold text-zinc-700">
                    {t('rememberMe')}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="is-admin"
                    type="checkbox"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-zinc-300 rounded"
                  />
                  <label htmlFor="is-admin" className="ml-2 block text-sm font-bold text-amber-700">
                    {t('adminLogin')}
                  </label>
                </div>
              </div>

              <div className="text-right text-sm">
                <a href="#" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                  {t('forgotOtp')}
                </a>
              </div>

              <div>
                <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-black uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl disabled:opacity-50">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" /> {t('loggingIn')}
                    </span>
                  ) : (
                    <>{t('loginButton')} <ArrowRight className="ml-2 h-5 w-5" /></>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>

        {!showMfaInput && (
          <div className="mt-6 text-center">
            <p className="text-sm font-bold text-zinc-600">
              {t('newToPlatform')}{' '}
              <Link href={`/signup`} className="text-blue-600 hover:text-blue-500 transition-colors">
                {t('createAccount')}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
