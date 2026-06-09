import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  RiArrowUpLine,
  RiArrowDownLine,
  RiDeleteBin6Line,
  RiLogoutBoxLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiDownload2Line,
  RiWalletLine,
  RiAddLine,
  RiUserLine,
  RiBriefcaseLine,
  RiBarChartBoxLine,
  RiCalendarLine,
} from 'react-icons/ri'
import api from '../api'

const PAGE_SIZE = 6

export default function Dashboard() {
  const { logout } = useAuth()
  const [categoria, setCategoria] = useState('PESSOAL')
  const [transacoes, setTransacoes] = useState([])
  const [saldo, setSaldo] = useState(0)
  const [entradas, setEntradas] = useState(0)
  const [saidas, setSaidas] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [descricao, setDescricao] = useState('')
  const [valorCentavos, setValorCentavos] = useState(0)
  const [tipo, setTipo] = useState('ENTRADA')

  const valorDisplay = (valorCentavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const handleValorKeyDown = (e) => {
    if (e.key === 'Backspace') {
      setValorCentavos((v) => Math.floor(v / 10))
      return
    }
    if (!/^\d$/.test(e.key)) return
    setValorCentavos((v) => {
      const novo = v * 10 + parseInt(e.key)
      return novo > 9999999 ? v : novo
    })
  }

  const carregar = async (p = 0) => {
    setLoading(true)
    try {
      const [tRes, sRes] = await Promise.all([
        api.get(`/api/transacoes/listar?page=${p}&categoria=${categoria}`),
        api.get(`/api/transacoes/saldo/${categoria}`),
      ])
      setTransacoes(tRes.data.content)
      setTotalPages(tRes.data.totalPages)
      const totalEnt = tRes.data.content.filter(t => t.tipo === 'ENTRADA').reduce((a, t) => a + t.valor, 0)
      const totalSai = tRes.data.content.filter(t => t.tipo === 'SAIDA').reduce((a, t) => a + t.valor, 0)
      setEntradas(totalEnt)
      setSaidas(totalSai)
      setSaldo(sRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
    carregar(0)
  }, [categoria])

  const adicionar = async (e) => {
    e.preventDefault()
    if (!descricao || valorCentavos === 0) return
    await api.post('/api/transacoes', {
      descricao,
      valor: valorCentavos / 100,
      tipo,
      categoria,
    })
    setDescricao('')
    setValorCentavos(0)
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

  const mudarPagina = async (novaPagina) => {
    setPage(novaPagina)
    await carregar(novaPagina)
  }

  const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const progressoSaidas = entradas > 0 ? Math.min((saidas / entradas) * 100, 100) : 0

  const totalFiltrado = totalPages * PAGE_SIZE

  return (
    <div className="min-h-screen bg-[#09090b]">

      {/* Header */}
      <header className="border-b border-white/5 bg-[#09090b]/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <RiWalletLine className="text-white text-sm" />
            </div>
            <span className="font-semibold text-white tracking-tight">Financeiro</span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-900/80 border border-white/5 p-1 rounded-xl">
            {[
              { key: 'PESSOAL', label: 'Pessoal', Icon: RiUserLine },
              { key: 'PROFISSIONAL', label: 'Profissional', Icon: RiBriefcaseLine },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setCategoria(key)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${categoria === key
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                  }`}
              >
                <Icon className="text-base" />
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <RiLogoutBoxLine />
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Saldo */}
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-950/60 to-zinc-900/60 p-6">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium uppercase tracking-widest mb-3">
                <RiBarChartBoxLine />
                Saldo atual
              </div>
              <p className={`text-4xl font-bold tracking-tight ${saldo < 0 ? 'text-red-400' : 'text-white'}`}>
                {fmt(saldo)}
              </p>
              <p className="mt-2 text-xs text-zinc-600">{totalFiltrado} {totalFiltrado !== 1 ? 'transações' : 'transação'} no total</p>
            </div>
          </div>
        </div>

        {/* Grid principal */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Formulário */}
          <div className="lg:col-span-2">
            <form
              onSubmit={adicionar}
              className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 space-y-5"
            >
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Nova Transação</h2>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-500">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Salário, Aluguel, Netflix..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full bg-zinc-800/80 border border-zinc-700/60 hover:border-zinc-600 focus:border-indigo-500 text-white placeholder-zinc-600 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-500">Valor</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium select-none">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={valorDisplay}
                    onKeyDown={handleValorKeyDown}
                    onChange={() => { }}
                    className="w-full bg-zinc-800/80 border border-zinc-700/60 hover:border-zinc-600 focus:border-indigo-500 text-white pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-500">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipo('ENTRADA')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition-all ${tipo === 'ENTRADA'
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                      : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:border-emerald-800 hover:text-emerald-400'
                      }`}
                  >
                    <RiArrowUpLine className="text-base" />
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('SAIDA')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition-all ${tipo === 'SAIDA'
                      ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/30'
                      : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:border-red-800 hover:text-red-400'
                      }`}
                  >
                    <RiArrowDownLine className="text-base" />
                    Saída
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all duration-150 shadow-lg shadow-indigo-900/30"
              >
                <RiAddLine className="text-lg" />
                Adicionar transação
              </button>
            </form>
          </div>

          {/* Lista */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Histórico</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => exportar('ENTRADA')}
                    className="flex items-center gap-1.5 text-xs border border-zinc-700/60 text-zinc-400 px-3 py-1.5 rounded-lg hover:bg-zinc-800 hover:text-white transition-all"
                  >
                    <RiDownload2Line />
                    Entradas
                  </button>
                  <button
                    onClick={() => exportar('SAIDA')}
                    className="flex items-center gap-1.5 text-xs border border-zinc-700/60 text-zinc-400 px-3 py-1.5 rounded-lg hover:bg-zinc-800 hover:text-white transition-all"
                  >
                    <RiDownload2Line />
                    Saídas
                  </button>
                </div>
              </div>

              {transacoes.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-zinc-700 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 flex items-center justify-center">
                    <RiWalletLine className="text-3xl text-zinc-600" />
                  </div>
                  <p className="text-sm font-medium text-zinc-600">Nenhuma transação ainda</p>
                  <p className="text-xs text-zinc-700">Adicione sua primeira transação ao lado</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between">
                  <ul className="space-y-2 animate-fade-in">
                    {transacoes.map((t) => (
                      <li
                        key={t.id}
                        className="group flex items-center gap-4 p-4 rounded-xl border border-transparent hover:bg-white/[0.03] hover:border-white/5 transition-all"
                      >
                        {/* Ícone de tipo */}
                        <div
                          className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${t.tipo === 'ENTRADA'
                            ? 'bg-emerald-950/80 border border-emerald-900/50'
                            : 'bg-red-950/80 border border-red-900/50'
                            }`}
                        >
                          {t.tipo === 'ENTRADA'
                            ? <RiArrowUpLine className="text-emerald-400 text-sm" />
                            : <RiArrowDownLine className="text-red-400 text-sm" />
                          }
                        </div>

                        {/* Descrição e data */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-200 truncate">{t.descricao}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <RiCalendarLine className="text-zinc-600 text-xs" />
                            <p className="text-xs text-zinc-600">{t.data}</p>
                          </div>
                        </div>

                        {/* Valor */}
                        <span
                          className={`text-sm font-semibold shrink-0 tabular-nums ${t.tipo === 'ENTRADA' ? 'text-emerald-400' : 'text-red-400'
                            }`}
                        >
                          {t.tipo === 'ENTRADA' ? '+' : '-'}{fmt(t.valor)}
                        </span>

                        {/* Deletar */}
                        <button
                          onClick={() => deletar(t.id)}
                          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-950/60 opacity-0 group-hover:opacity-100 transition-all"
                          title="Excluir"
                        >
                          <RiDeleteBin6Line className="text-sm" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                      <button
                        onClick={() => mudarPagina(page - 1)}
                        disabled={page === 0}
                        className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-zinc-700/60 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <RiArrowLeftSLine className="text-base" />
                        Anterior
                      </button>
                      <span className="text-xs text-zinc-600 tabular-nums">
                        Página {page + 1} de {totalPages}
                      </span>
                      <button
                        onClick={() => mudarPagina(page + 1)}
                        disabled={page + 1 >= totalPages}
                        className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-zinc-700/60 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        Próxima
                        <RiArrowRightSLine className="text-base" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
