import { useRef } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import { buildFormularioPB } from '../../estados/PB/formulario'
import { textoMemorialSaidaEmergencia } from '../../data/memorial/saida_emergencia'
import { textoMemorialHidrantes } from '../../data/memorial/hidrantes'
import { textoMemorialCalculoHidrantes } from '../../data/memorial/hidrantesCalculo'
import { getSE, getHidrantes, getExtintores } from '../../data/normas/index'
import { numerarBlocos } from '../../utils/memorialEstilo'
import { BlocoMedida } from '../../components/documentos/BlocosMemorial'
import PreviewPaginado from '../../components/documentos/PreviewPaginado'
import Icon from '../../components/ui/Icon'
import { usePerfil } from '../../hooks/usePerfil'
import CampoRubrica from '../../components/perfil/CampoRubrica'
import { useZoomDocumento } from '../../hooks/useZoomDocumento'
import { BarraZoom, JanelaDocumento } from '../../components/documentos/ZoomDocumento'
import { Secao } from '../../estados/PB/SecaoFormulario'

// Memorial Descritivo da Paraíba: o formulário oficial do CBMPB (DSPCI),
// preenchido a partir do projeto (data/memorial/PB/formulario.js), seguido
// dos Anexos A–D pedidos no fim do formulário. Paginação pelo Paged.js, como
// o memorial do MA (PreviewPaginado) — as tabelas das seções quebram entre
// folhas linha a linha, e toda folha leva o quadro de "Rubrica" do modelo.
const CSS_BASE = `
@page {
  size: A4 portrait;
  margin: 15mm 15mm 22mm 20mm;
  @bottom-right {
    content: "Rubrica";
    /* rubrica do perfil: ver cssPagina */
    width: 32mm; height: 10mm;
    border: 1px solid #538135;
    text-align: center; vertical-align: middle;
    font-size: 9pt;
    margin-bottom: 6mm;
  }
}
tr { break-inside: avoid; }
.pbf-anexos { break-before: page; }
`

// Com rubrica no perfil, o quadro de cada folha leva a imagem no lugar do texto.
const cssPagina = rubrica => (rubrica
  ? CSS_BASE.replace('content: "Rubrica";\n    /* rubrica do perfil: ver cssPagina */', `content: "";\n    background: url("${rubrica}") center / contain no-repeat;`)
  : CSS_BASE)

function Cabecalho({ norma }) {
  return (
    <div className="pbf-cabecalho">
      <div>ESTADO DA PARAÍBA</div>
      <div>Secretária de Estado da Segurança e da Defesa Social</div>
      <div>{norma.orgao.replace(' — ', '- ')}</div>
      <div>{norma.diretoria}</div>
      <div>{norma.secao}</div>
      <div className="pbf-titulo-doc" style={{ marginTop: '10pt' }}>MEMORIAL DESCRITIVO DO PROJETO DE SEGURANÇA CONTRA INCÊNDIO</div>
    </div>
  )
}

// Anexo do formulário: blocos do memorial (tabela/parágrafos) quando a
// medida está ativa e há conteúdo; senão fica só o título e a orientação do
// formulário, para o RT anexar à mão.
const blocosDe = s => s.blocos || (s.paragrafos || []).map(texto => ({ tipo: 'paragrafo', texto }))

function Anexo({ letra, titulo, descricao, secoes, numerar = true }) {
  return (
    <div>
      <div className="pbf-anexo">
        <div className="pbf-anexo-titulo">ANEXO {letra}</div>
        <div className="pbf-anexo-desc">{titulo}</div>
        {descricao && <div className="pbf-anexo-desc">{descricao}</div>}
      </div>
      {(secoes || []).map((s, i) => (
        <div key={i} className="mt-3">
          {(numerar ? numerarBlocos(blocosDe(s), letra) : blocosDe(s)).map((b, j) => <BlocoMedida key={j} bloco={b}/>)}
        </div>
      ))}
    </div>
  )
}

export default function MemorialPBPage({ onBack }) {
  const { state } = useProjeto()
  const { sistemas, porEstrutura } = useMedidasObrigatorias()
  const formulario = buildFormularioPB(state, sistemas, porEstrutura)
  const { perfil } = usePerfil()
  const rolagemRef = useRef(null)
  const zoomDoc = useZoomDocumento(rolagemRef)
  const { zoom, maximizado, setMaximizado } = zoomDoc

  if (!formulario) return null
  // A e B: os dimensionamentos das páginas comuns de Saída de Emergência e
  // de Hidrantes, com a norma da PB.
  const anexoA = sistemas.saida_emergencia?.ativo && getSE(state.uf) ? [textoMemorialSaidaEmergencia(state, sistemas, porEstrutura, { soDimensionamento: true })] : []
  const anexoB = sistemas.hidrantes?.ativo && getHidrantes(state.uf) && getExtintores(state.uf)
    ? [textoMemorialHidrantes(state, sistemas, porEstrutura), textoMemorialCalculoHidrantes(state)].filter(Boolean)
    : []

  return (
    <JanelaDocumento maximizado={maximizado} onFechar={() => setMaximizado(false)} className="flex flex-col flex-1 overflow-hidden">
      <div className="no-print shrink-0 flex items-center justify-between gap-3 py-3 px-8 border-b border-solid border-border">
        <button className="btn-ghost" onClick={onBack}><Icon name="left" size={13}/> Voltar</button>
        <BarraZoom {...zoomDoc}/>
        <div className="flex items-center gap-2">
          <CampoRubrica compacto/>
          <button className="btn-primary" onClick={() => window.print()}><Icon name="file" size={13}/> Imprimir / Salvar PDF</button>
        </div>
      </div>

      <div className="relative print:static flex-1 min-h-0 flex">
        <div ref={rolagemRef} className="flex-1 min-w-0 overflow-auto py-8 flex flex-col" style={{ '--memorial-zoom': zoom }}>
          {/* Os campos do formulário são preenchidos nas páginas de medida da
              PB (estados/PB/paginas) — aqui o documento só é exibido. */}
          {!formulario.temTabelaExigencias && (
            <div className="no-print ibox amber mx-auto mb-6 max-w-[760px]">
              <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
              <span>A tabela de exigências da NT 04/2023 CBMPB não foi encontrada (Supabase, normas_dados: uf &apos;PB&apos;, sistema &apos;medidas_seguranca&apos;): só as medidas do mínimo de referência saem como &quot;Exigível&quot;; as demais ficam sem marcação.</span>
            </div>
          )}
          <PreviewPaginado css={cssPagina(perfil?.rubrica)}>
            <div className="pbf">
              <Cabecalho norma={formulario.norma}/>
              {formulario.secoes.map((s, i) => <Secao key={i} secao={s}/>)}
              <div className="pbf-anexos">
                <Anexo letra="A" titulo="APRESENTAÇÃO DOS CÁLCULOS DE DIMENSIONAMENTO DAS SAÍDAS DE EMERGÊNCIA E POPULAÇÃO PARA TODAS AS EDIFICAÇÕES" secoes={anexoA} numerar={false}/>
                <Anexo letra="B" titulo="DIMENSIONAMENTO DO SISTEMA DE HIDRANTES"
                  descricao="Especificar detalhes consideráveis relacionados ao dimensionamento e características do sistema de hidrantes, incluindo pressurização e acionamento de bombas de incêndio, caso sejam necessárias, condições dos abrigos, localização do recalque, entre outros."
                  secoes={anexoB}/>
                <Anexo letra="C" titulo="DIMENSIONAMENTO DO SISTEMA DE CHUVEIROS AUTOMÁTICOS"
                  descricao="Especificar detalhes consideráveis relacionados ao dimensionamento e características do sistema dos chuveiros automáticos, incluindo pressurização e acionamento de bombas de incêndio, caso sejam necessárias, localização das válvulas de governo e alarme, condições do recalque, entre outros."/>
                <Anexo letra="D" titulo="DIMENSIONAMENTO DO SPDA"
                  descricao="Especificar detalhes consideráveis relacionados à necessidade de instalação do SPDA e execução do sistema"/>
                <div className="pbf-assinatura">
                  <div>{state.rtNome || 'Nome do projetista'}</div>
                  <div>{state.rtEspecialidade || 'Graduação'}</div>
                  <div>{state.rtConselho ? `Nº CREA/CAU ${state.rtConselho}` : 'Nº CREA/CAU'}</div>
                </div>
              </div>
            </div>
          </PreviewPaginado>
        </div>
      </div>
    </JanelaDocumento>
  )
}
