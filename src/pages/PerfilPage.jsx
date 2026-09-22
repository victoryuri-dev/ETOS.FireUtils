import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePerfil } from '../hooks/usePerfil'
import FormSection from '../components/ui/FormSection'
import Icon from '../components/ui/Icon'
import Loader from '../components/ui/Loader'

const ESPECIALIDADES = [
  'Engenharia Civil', 'Engenharia Eletrica', 'Arquitetura', 'Engenharia de Seguranca',
]

export default function PerfilPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { perfil, erro, salvar } = usePerfil()

  // Copia local pro formulario: o usuario edita a vontade e so o botao grava.
  // `null` ate o perfil chegar — e o que segura o Loader abaixo.
  const [form, setForm] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState(null)

  useEffect(() => { if (perfil) setForm(perfil) }, [perfil])

  const setConta = campo => e => {
    const { value } = e.target
    setForm(f => ({ ...f, [campo]: value }))
    setAviso(null)
  }
  const setRT = campo => e => {
    const { value } = e.target
    setForm(f => ({ ...f, responsavelTecnico: { ...f.responsavelTecnico, [campo]: value } }))
    setAviso(null)
  }

  const handleSalvar = async () => {
    setSalvando(true)
    const r = await salvar(form)
    setSalvando(false)
    setAviso(r.ok ? { tipo: 'green', texto: 'Perfil salvo.' } : { tipo: 'red', texto: r.erro })
  }

  if (!form) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader size={32}/>
      </div>
    )
  }

  const rt = form.responsavelTecnico

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-bg">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto pt-8 px-10 pb-[60px]">

          <button className="btn-ghost mb-5" onClick={() => navigate('/projetos')}>
            <Icon name="left" size={13}/> Projetos
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ink mb-1.5">Perfil</h1>
            <p className="text-[13px] text-ink-faint leading-[1.6] m-0 max-w-[560px]">
              Dados da sua conta e do responsável técnico que você assina. O responsável técnico
              é reaproveitado na Etapa 3 de cada projeto novo, em vez de ser redigitado.
            </p>
          </div>

          {erro && (
            <div className="ibox red" role="alert">
              <Icon name="warn" size={14} color="var(--color-red)" className="shrink-0"/>
              <span>{erro}</span>
            </div>
          )}

          <FormSection title="Conta" description="Como identificamos você no sistema.">
            {/* Texto, e nao um input desabilitado: o e-mail vem do Supabase
                Auth e nao se edita por aqui — e o projeto nao tem estilo de
                input desabilitado, entao um campo travado pareceria editavel. */}
            <div className="fg mb-3">
              <label>E-mail</label>
              <div className="text-[13px] text-ink">{user?.email || '—'}</div>
              <span className="text-[11px] text-ink-hint">
                O e-mail de acesso não pode ser alterado por aqui.
              </span>
            </div>
            <div className="g2">
              <div className="fg"><label>Nome</label>
                <input value={form.nome} onChange={setConta('nome')}/>
              </div>
              <div className="fg"><label>Telefone</label>
                <input type="tel" value={form.telefone} onChange={setConta('telefone')}/>
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Responsável técnico"
            description="Usado para preencher a Etapa 3 dos seus projetos. Os dados da ART (número, data, valor da obra) continuam em cada projeto, porque mudam de obra para obra."
          >
            <div className="g2 mb-3">
              <div className="fg"><label>Nome completo</label>
                <input value={rt.rtNome} onChange={setRT('rtNome')}/>
              </div>
              <div className="fg"><label>CREA / CAU</label>
                <input value={rt.rtConselho} onChange={setRT('rtConselho')} placeholder="CREA-MA MA00000000/D"/>
              </div>
            </div>
            <div className="g2 mb-3">
              <div className="fg"><label>CPF</label>
                <input value={rt.rtCpf} onChange={setRT('rtCpf')} placeholder="000.000.000-00"/>
              </div>
              <div className="fg"><label>Especialidade</label>
                <select value={rt.rtEspecialidade} onChange={setRT('rtEspecialidade')}>
                  {ESPECIALIDADES.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
            </div>
            <div className="fg mb-3">
              <label>Empresa / Escritório</label>
              <input value={rt.rtEmpresa} onChange={setRT('rtEmpresa')}/>
            </div>
            <div className="g2">
              <div className="fg"><label>E-mail</label>
                <input type="email" value={rt.rtEmail} onChange={setRT('rtEmail')}/>
              </div>
              <div className="fg"><label>Telefone</label>
                <input type="tel" value={rt.rtTelefone} onChange={setRT('rtTelefone')}/>
              </div>
            </div>
          </FormSection>

          <div className="flex items-center gap-3">
            <button className="btn-primary" onClick={handleSalvar} disabled={salvando}>
              {salvando
                ? <><Icon name="spinner" size={13} className="animate-spin"/> Salvando...</>
                : <><Icon name="save" size={13}/> Salvar perfil</>}
            </button>
            {aviso && (
              <span className={`flex items-center gap-1.5 text-[12px] ${aviso.tipo === 'green' ? 'text-green' : 'text-red'}`}>
                <Icon name={aviso.tipo === 'green' ? 'checkCircle' : 'warn'} size={13}/> {aviso.texto}
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
