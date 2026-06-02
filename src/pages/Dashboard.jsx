import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function Dashboard() {
  const { logout } = useAuth()
  const [categoria, setCategoria] = useState('PESSOAL')
  const [transacoes, setTransacoes] = useState([])
  const [saldo, setSaldo] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // form
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [tipo, setTipo] = useState('ENTRADA')

  const carregar = async (p = page) => {
    setLoading(true)
    try {
      const [tRes, sRes] = await Promise.all([
        api.get(`/api/transacoes/listar?page=${p}&categoria=${categoria}`),
        api.get(`/api/transacoes/saldo/${categoria}`),
      ])
      setTransacoes(tRes.data.content)
      setTotalPages(tRes.data.totalPages)
      setSaldo(sRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { setPage(0); carregar(0) }, [categoria])

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
    setPage(0)
    carregar(0)
  }

  const deletar = async (id) => {
    await api.delete(`/api/transacoes/delete/${id}`)
    setPage(0)
    carregar(0)
  }

  const exportar = async (tipo) => {
    const params = tipo ? `?tipo=${tipo}` : ''
    const res = await api.get(`/api/transacoes/download/relatorio/${categoria}${params}`, {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = tipo
      ? `${tipo.toLowerCase()}s-${categoria.toLowerCase()}.xlsx`
      : `relatorio-${categoria.toLowerCase()}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatar = (v) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-zinc-900 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 relative flex items-center justify-center">
          <h1 className="text-xl font-bold text-white">Controle Financeiro</h1>
          <div className="absolute right-4 flex items-center gap-4">
            <button onClick={logout} className="text-sm text-zinc-400 hover:text-white">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Toggle de categoria */}
        <div className="flex gap-2 bg-zinc-900 p-1 rounded-xl shadow-sm w-fit">
          {['PESSOAL', 'PROFISSIONAL'].map((c) => (
            <button
              key={c}
              onClick={() => setCategoria(c)}
              className={`px-5 py-2 rounded-lg font-medium transition ${
                categoria === c
                  ? 'bg-zinc-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              {c === 'PESSOAL' ? 'Pessoal' : 'Profissional'}
            </button>
          ))}
        </div>

        {/* Card de saldo */}
        <div className="bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-zinc-300 text-sm font-medium">Saldo atual</p>
          <p className={`text-4xl font-bold mt-2 ${saldo < 0 ? 'text-red-200' : ''}`}>
            {formatar(saldo)}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Form adicionar */}
          <form onSubmit={adicionar} className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
            <input
              type="text"
              placeholder="Descrição do ítem"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

            <input
              type="number"
              step="0.01"
              placeholder="Valor do ítem"
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
                      : t === 'SAIDA'
                        ? 'bg-red-100 text-red-600 border-red-300 hover:bg-red-200'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {t === 'ENTRADA' ? 'Entrada' : 'Saída'}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-zinc-600 text-white font-semibold py-2 rounded-lg hover:bg-zinc-500 transition"
            >
              Adicionar
            </button>
          </form>

          {/* Lista de transações */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-slate-800">Histórico</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => exportar('ENTRADA')}
                  className="text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition"
                >
                  ↓ Entradas
                </button>
                <button
                  onClick={() => exportar('SAIDA')}
                  className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition"
                >
                  ↓ Saídas
                </button>
              </div>
            </div>
            {loading ? (
              <p className="text-slate-500 text-sm">Carregando...</p>
            ) : transacoes.length === 0 ? (
              <p className="text-slate-500 text-sm">Nenhuma transação ainda.</p>
            ) : (
              <>
              <ul className="divide-y divide-slate-100">
                {transacoes.map((t) => (
                  <li key={t.id} className="py-3 flex justify-between items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{t.descricao}</p>
                      <p className="text-xs text-slate-500">{t.data}</p>
                    </div>
                    <span
                      className={`font-semibold shrink-0 ${
                        t.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {t.tipo === 'ENTRADA' ? '+' : '-'} {formatar(t.valor)}
                    </span>
                    <button
                      onClick={() => deletar(t.id)}
                      className="text-slate-400 hover:text-red-600 transition shrink-0"
                      title="Excluir"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => { setPage(page - 1); carregar(page - 1) }}
                    disabled={page === 0}
                    className="text-sm px-3 py-1.5 rounded-lg bg-zinc-600 text-white border border-zinc-600 hover:bg-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    ← Anterior
                  </button>
                  <span className="text-sm text-slate-500">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => { setPage(page + 1); carregar(page + 1) }}
                    disabled={page + 1 >= totalPages}
                    className="text-sm px-3 py-1.5 rounded-lg bg-zinc-600 text-white border border-zinc-600 hover:bg-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Próxima →
                  </button>
                </div>
              )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
