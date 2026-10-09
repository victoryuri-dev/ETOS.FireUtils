import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePerfil, nomeDeUsuario } from '../hooks/usePerfil'
import FormSection from '../components/ui/FormSection'
import Icon from '../components/ui/Icon'
import Loader from '../components/ui/Loader'
import FerramentasDisponiveis from '../components/perfil/FerramentasDisponiveis'
import './PerfilPage.css'


const ESPECIALIDADES = [
  'Engenharia Civil', 'Engenharia Eletrica', 'Arquitetura', 'Engenharia de Seguranca',
]

export default function PerfilPage() {
  const { user } = useAuth()
  const { perfil, erro, salvar } = usePerfil()
  // Copia local pro formulario: o usuario edita a vontade e so o botao grava.
  // `null` ate o perfil chegar — e o que segura o Loader abaixo.
  const [form, setForm] = useState(null)
  const [salvando, setSalvando] = useState(false)
  // Retorno do salvamento, ao lado do botão (toasts ficam reservados ao
  // retorno das importações do Revit).
  const [retorno, setRetorno] = useState(null) // { ok, texto }

  useEffect(() => { if (perfil) setForm(perfil) }, [perfil])

  const setConta = campo => e => {
    const { value } = e.target
    setForm(f => ({ ...f, [campo]: value }))
  }
  const setRT = campo => e => {
    const { value } = e.target
    setForm(f => ({ ...f, responsavelTecnico: { ...f.responsavelTecnico, [campo]: value } }))
  }

  const handleSalvar = async () => {
    setSalvando(true)
    setRetorno(null)
    const r = await salvar(form)
    setSalvando(false)
    setRetorno(r.ok ? { ok: true, texto: 'Perfil salvo.' } : { ok: false, texto: r.erro })
  }

  const rt = form?.responsavelTecnico
  // Mesmo nome de usuário do header — o já salvo, não o que está sendo digitado.
  const nomeSalvo = nomeDeUsuario(perfil, user, 'Usuário')

  return (
    <div className="profile-overview-shell">
      <div className="profile-overview-scroll">
        <main className="profile-overview">
          <header className="profile-overview-header">
            <div>
              <h1>Olá, {nomeSalvo}.</h1>
            </div>
          </header>

          <div className="profile-overview-grid">
            <section className="profile-data-column" aria-label="Seus dados">

          {!form && (
            <div className="flex items-center justify-center py-16"><Loader size={32}/></div>
          )}

          {form && (<>

          {erro && (
            <div className="ibox red mb-5" role="alert">
              <Icon name="warn" size={13} color="var(--color-red)" className="shrink-0"/>
              <span className="text-xs">{erro}</span>
            </div>
          )}

          <FormSection title="Conta">
            <div className="profile-identity" aria-label="Conta atual">
              <span className="profile-identity-icon"><Icon name="user" size={18}/></span>
              <div><strong>{nomeSalvo}</strong><span>{user?.email || '—'}</span></div>
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

          <FormSection title="Responsável técnico">
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
            {retorno && (
              <span className={`flex items-center gap-1.5 text-xs ${retorno.ok ? 'text-green' : 'text-red'}`} role={retorno.ok ? 'status' : 'alert'}>
                <Icon name={retorno.ok ? 'check' : 'warn'} size={13}/>
                {retorno.texto}
              </span>
            )}
          </div>

          </>)}
            </section>

            <section className="profile-tools-column" aria-labelledby="profile-tools-title">
              <div className="profile-section-heading">
                <div><h2 id="profile-tools-title">Ferramentas disponíveis</h2></div>
              </div>
              <FerramentasDisponiveis/>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
