import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function Dashboard() {
  const { logout } = useAuth()
  const [categoria, setCategoria] = useState('PESSOAL')
  const [transacoes, setTransacoes] = useState([])
  const [saldo, setSaldo] = useState(0)
  const [loading, setLoading] = useState(false)

  // form
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [tipo, setTipo] = useState('ENTRADA')

  const carregar = async () => {
    setLoading(true)
    try {
      const [tRes, sRes] = await Promise.all([
        api.get('/api/transacoes'),
        api.get(`/api/transacoes/saldo/${categoria}`),
      ])
      setTransacoes(tRes.data.filter((t) => t.categoria === categoria))
      setSaldo(sRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [categoria])

  const adicionar = async (e) => {
    e.preventDefault()
    if (!descricao || !valor) return
    await api.post('/api/transacoes', {
      descricao,
      valor: parseFloat(valor),
      tipo,
      categoria,
    })
    setDescricao('')
    setValor('')
    setTipo('ENTRADA')
    carregar()
  }

  const formatar = (v) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">Financeiro</h1>
          <button onClick={logout} className="text-sm text-slate-600 hover:text-slate-900">
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Toggle de categoria */}
        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm w-fit">
          {['PESSOAL', 'PROFISSIONAL'].map((c) => (
            <button
              key={c}
              onClick={() => setCategoria(c)}
              className={`px-5 py-2 rounded-lg font-medium transition ${
                categoria === c
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {c === 'PESSOAL' ? 'Pessoal' : 'Profissional'}
            </button>
          ))}
        </div>

        {/* Card de saldo */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-indigo-200 text-sm font-medium">Saldo atual</p>
          <p className={`text-4xl font-bold mt-2 ${saldo < 0 ? 'text-red-200' : ''}`}>
            {formatar(saldo)}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Form adicionar */}
          <form onSubmit={adicionar} className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-800">Nova transação</h2>

            <input
              type="text"
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

            <input
              type="number"
              step="0.01"
              placeholder="Valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

            <div className="flex gap-2">
              {['ENTRADA', 'SAIDA'].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTipo(t)}
                  className={`flex-1 py-2 rounded-lg border font-medium transition ${
                    tipo === t
                      ? t === 'ENTRADA'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {t === 'ENTRADA' ? 'Entrada' : 'Saída'}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Adicionar
            </button>
          </form>

          {/* Lista de transações */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-4">Histórico</h2>
            {loading ? (
              <p className="text-slate-500 text-sm">Carregando...</p>
            ) : transacoes.length === 0 ? (
              <p className="text-slate-500 text-sm">Nenhuma transação ainda.</p>
            ) : (
              <ul className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {transacoes.map((t) => (
                  <li key={t.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-800">{t.descricao}</p>
                      <p className="text-xs text-slate-500">{t.data}</p>
                    </div>
                    <span
                      className={`font-semibold ${
                        t.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {t.tipo === 'ENTRADA' ? '+' : '-'} {formatar(t.valor)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
