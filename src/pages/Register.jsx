import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { RiUserLine, RiMailLine, RiLockPasswordLine, RiArrowRightLine, RiShieldCheckLine } from 'react-icons/ri'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/login')
    } catch {
      setError('Erro ao registrar. Tente outro e-mail.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      {/* Painel esquerdo — decorativo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-violet-950 via-[#09090b] to-[#09090b] items-center justify-center p-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.2),transparent_60%)]" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl" />

        <div className="relative z-10 space-y-8 max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center" style={{ boxShadow: '0 0 30px rgba(139,92,246,0.3)' }}>
            <RiShieldCheckLine className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Comece a organizar sua vida financeira
            </h1>
            <p className="mt-4 text-zinc-400 leading-relaxed">
              Crie sua conta gratuita e tenha visibilidade completa sobre onde seu dinheiro está indo.
            </p>
          </div>
          <div className="space-y-3">
            {['Conta gratuita, sem limite de transações', 'Separe despesas pessoais e profissionais', 'Acesse de qualquer dispositivo'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-zinc-400">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Criar conta</h2>
            <p className="text-sm text-zinc-500">Preencha os dados para começar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-950/60 border border-red-900 text-red-400 text-sm px-4 py-3 rounded-xl animate-fade-in">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Nome</label>
              <div className="relative">
                <RiUserLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-base" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 text-white placeholder-zinc-600 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">E-mail</label>
              <div className="relative">
                <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-base" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 text-white placeholder-zinc-600 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Senha</label>
              <div className="relative">
                <RiLockPasswordLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-base" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 text-white placeholder-zinc-600 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all duration-150 mt-2"
              style={{ boxShadow: '0 0 25px rgba(139,92,246,0.2)' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Criando conta...
                </span>
              ) : (
                <>Criar conta <RiArrowRightLine /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-600">
            Já tem conta?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
