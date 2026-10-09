import { createContext, useContext } from 'react'

// Módulos licenciáveis — os mesmos da página de preços. A ordem é a de
// exibição. O PRO inclui os outros três e o FireUtils BIM.
export const MODULOS = [
  {
    key: 'pro',
    nome: 'FireUtils PRO',
    icon: 'flame',
    descricao: 'Plano completo: Memorial, Hidrantes e Saídas em uma única licença, mais o FireUtils BIM exclusivo.',
  },
  {
    key: 'memorial',
    nome: 'Memorial',
    icon: 'documentosMedida',
    descricao: 'Cadastro e classificação da edificação, medidas de segurança e geração do Memorial Descritivo na plataforma Web, sem depender do Revit.',
  },
  {
    key: 'hidrantes',
    nome: 'Hidrantes',
    icon: 'hidranteMedida',
    descricao: 'Dimensionamento hidráulico da rede no Revit: percurso por conectores MEP, perdas de carga, pressão e vazão do hidrante crítico.',
  },
  {
    key: 'saidas',
    nome: 'Saídas',
    icon: 'saidaEmergenciaMedida',
    descricao: 'Dimensionamento das saídas de emergência no Revit: população por pavimento e ambiente, larguras e distâncias de percurso.',
  },
]

// Interruptor do bloqueio na tela. Desligado (padrão), a licença é só
// informativa e ninguém é barrado — é o que permite publicar o código antes
// de as licenças estarem concedidas. Liga com VITE_EXIGIR_LICENCA=true.
export const EXIGIR_LICENCA = import.meta.env.VITE_EXIGIR_LICENCA === 'true'

// Faltando este tanto (ou menos) pra vencer, a licença ativa já avisa.
const DIAS_AVISO = 15

// 'AAAA-MM-DD' (coluna date) -> Date à meia-noite LOCAL. `new Date(texto)`
// leria como UTC e, no Brasil, cairia no dia anterior.
function dataLocal(texto) {
  if (!texto) return null
  const [a, m, d] = texto.split('-').map(Number)
  return new Date(a, m - 1, d)
}

export function formatarData(texto) {
  const d = dataLocal(texto)
  return d ? d.toLocaleDateString('pt-BR') : ''
}

/**
 * Situação exibida de uma licença (linha da tabela `licencas`, ou undefined
 * quando a conta não tem o módulo).
 * @returns {{ status, rotulo, tom, valida, detalhe }}
 *   tom: 'green' | 'blue' | 'amber' | 'red' | 'neutro'
 */
export function situacaoLicenca(licenca, hoje = new Date()) {
  if (!licenca) {
    return { status: 'sem_licenca', rotulo: 'Sem licença', tom: 'neutro', valida: false, detalhe: 'Esta conta não tem licença deste módulo.' }
  }
  if (licenca.situacao === 'suspensa') {
    return { status: 'suspensa', rotulo: 'Suspensa', tom: 'red', valida: false, detalhe: 'O acesso está suspenso.' }
  }
  if (licenca.situacao === 'cancelada') {
    return { status: 'cancelada', rotulo: 'Cancelada', tom: 'neutro', valida: false, detalhe: 'A licença foi cancelada.' }
  }

  const expira = dataLocal(licenca.expira_em)
  const inicioDoDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const dias = expira ? Math.round((expira - inicioDoDia) / 86400000) : null

  if (dias != null && dias < 0) {
    return { status: 'expirada', rotulo: 'Expirada', tom: 'red', valida: false, detalhe: `Venceu em ${formatarData(licenca.expira_em)}.` }
  }

  const teste = licenca.situacao === 'teste'
  const prazo = dias == null ? 'Sem data de término.'
    : dias === 0 ? 'Vence hoje.'
    : dias === 1 ? 'Vence amanhã.'
    : `Válida até ${formatarData(licenca.expira_em)} (${dias} dias).`
  const vencendo = dias != null && dias <= DIAS_AVISO

  return {
    status: teste ? 'teste' : 'ativa',
    rotulo: vencendo ? 'Vencendo' : teste ? 'Em teste' : 'Ativa',
    tom: vencendo ? 'amber' : teste ? 'blue' : 'green',
    valida: true,
    detalhe: prazo,
  }
}

/**
 * A conta tem acesso ao módulo? Vale a licença do próprio módulo ou a do PRO.
 * Sem `modulo`, responde "tem alguma licença válida?".
 * @param {object} licencas  — { [modulo]: linha } (ver LicencaProvider)
 */
export function temAcesso(licencas, modulo, hoje = new Date()) {
  const valida = key => situacaoLicenca(licencas?.[key], hoje).valida
  if (!modulo) return MODULOS.some(m => valida(m.key))
  return valida(modulo) || valida('pro')
}

// Estado das licenças da conta logada, carregado uma vez pelo LicencaProvider
// (src/context/LicencaContext.jsx): { licencas, erro }. `licencas` é null
// enquanto carrega.
export const LicencaContext = createContext({ licencas: {}, erro: null })

export function useLicencas() {
  return useContext(LicencaContext)
}

/**
 * Acesso já considerando o interruptor: com o bloqueio desligado, todo mundo
 * passa. `carregando` só é verdadeiro com o bloqueio ligado — é quando a tela
 * precisa esperar a resposta antes de decidir.
 */
export function useAcesso(modulo) {
  const { licencas } = useLicencas()
  if (!EXIGIR_LICENCA) return { carregando: false, liberado: true }
  if (!licencas) return { carregando: true, liberado: false }
  return { carregando: false, liberado: temAcesso(licencas, modulo) }
}
