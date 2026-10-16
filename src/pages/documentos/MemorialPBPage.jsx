import { Fragment } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import { buildFormularioPB } from '../../data/memorial/PB/formulario'
import { textoMemorialSaidaEmergencia } from '../../data/memorial/saida_emergencia'
import { textoMemorialHidrantes } from '../../data/memorial/hidrantes'
import { textoMemorialCalculoHidrantes } from '../../data/memorial/hidrantesCalculo'
import { numerarBlocos } from '../../utils/memorialEstilo'
import { BlocoMedida } from '../../components/documentos/BlocosMemorial'
import PreviewPaginado from '../../components/documentos/PreviewPaginado'
import Icon from '../../components/ui/Icon'
import { getSE, getHidrantes, getExtintores } from '../../data/normas/index'

// Memorial Descritivo da Paraíba: o formulário oficial do CBMPB (DSPCI),
// preenchido a partir do projeto (data/memorial/PB/formulario.js), seguido
// dos Anexos A–D pedidos no fim do formulário. Paginação pelo Paged.js, como
// o memorial do MA (PreviewPaginado) — as tabelas das seções quebram entre
// folhas linha a linha, e toda folha leva o quadro de "Rubrica" do modelo.
const CSS_PAGINA = `
@page {
  size: A4 portrait;
  margin: 15mm 15mm 22mm 20mm;
  @bottom-right {
    content: "Rubrica";
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

const Caixa = ({ x }) => <span className="pbf-caixa">{x ? 'X' : ''}</span>

function Item({ item }) {
  const conteudo = (
    <span className="pbf-item-texto">
      <span className={item.negrito ? 'pbf-negrito' : ''}>
        {item.label}
        {item.valor ? <> <span className="pbf-valor">{item.valor}</span></> : null}
      </span>
      {item.detalhe && <span>{item.detalhe}</span>}
    </span>
  )
  return (
    <div className="pbf-item" style={{ flexGrow: item.peso || 1 }}>
      {!item.semCaixa && <Caixa x={item.x}/>}
      {conteudo}
    </div>
  )
}

function Linha({ linha }) {
  switch (linha.tipo) {
    case 'sub':
      return (
        <tr><td className="pbf-sub">
          <div>{linha.titulo}</div>
          {linha.nota && <span className="pbf-nota">{linha.nota}</span>}
        </td></tr>
      )
    case 'exigivel':
      return (
        <tr><td><div className="pbf-linha pbf-negrito">
          <Item item={{ x: linha.exigivel === true, label: linha.rotuloExigivel || 'EXIGÍVEL', negrito: true, peso: 3 }}/>
          <Item item={{ x: linha.exigivel === false, label: linha.rotuloNao || 'NÃO EXIGÍVEL', negrito: true, peso: 2 }}/>
        </div></td></tr>
      )
    case 'campos':
      return (
        <tr><td><div className="pbf-linha">
          {linha.celulas.map((c, i) => (
            <div key={i} className={`pbf-cel ${c.centro ? 'pbf-centro' : ''}`} style={{ flexGrow: c.peso || 1, minHeight: c.alto ? '48pt' : undefined, alignItems: c.alto ? 'flex-start' : undefined }}>
              <span>{c.label}{c.valor ? <> <span className="pbf-valor">{c.valor}</span></> : null}</span>
            </div>
          ))}
        </div></td></tr>
      )
    case 'checks':
      return (
        <tr><td><div className="pbf-linha">
          {linha.itens.map((it, i) => <Item key={i} item={it}/>)}
        </div></td></tr>
      )
    case 'checkValor':
      return (
        <tr><td><div className="pbf-linha">
          <Item item={{ x: linha.x, label: linha.label, peso: 1 }}/>
          <div className="pbf-cel" style={{ flexGrow: 1 }}>{linha.valor}</div>
        </div></td></tr>
      )
    case 'grupo':
      return (
        <tr><td>
          <div className="pbf-grupo">
            <div className="pbf-grupo-nome" style={{ gridColumn: 2, gridRow: `1 / span ${linha.itens.length}` }}>{linha.titulo}</div>
            {linha.itens.map((it, i) => {
              const borda = i < linha.itens.length - 1 ? { borderBottom: '1px solid #000' } : undefined
              return (
                <Fragment key={it.label}>
                  <div className="pbf-grupo-x" style={{ gridColumn: 1, gridRow: i + 1, ...borda }}>{it.x ? 'X' : ''}</div>
                  <div style={{ gridColumn: 3, gridRow: i + 1, ...borda }}>{it.label}</div>
                </Fragment>
              )
            })}
          </div>
        </td></tr>
      )
    case 'texto':
      return (
        <tr><td><div className={`pbf-texto ${linha.negrito ? 'pbf-negrito' : ''} ${linha.centro ? 'pbf-centro text-center' : ''} ${linha.justificado ? 'pbf-justificado' : ''}`}>
          {linha.texto}
        </div></td></tr>
      )
    case 'obs':
      return (
        <tr><td><div className="pbf-obs">
          <span>{linha.label}</span>{linha.valor ? <>{'\n'}<span className="pbf-valor">{linha.valor}</span></> : null}
        </div></td></tr>
      )
    default:
      return null
  }
}

function Secao({ secao }) {
  return (
    <table className="pbf-tabela">
      <tbody>
        {secao.faixa && <tr><th className="pbf-faixa">{secao.faixa}</th></tr>}
        <tr>
          <th className="pbf-secao">
            {secao.titulo}{secao.nota ? <> <span className="pbf-nota">{secao.nota}</span></> : null}
          </th>
        </tr>
        {secao.linhas.map((l, i) => <Linha key={i} linha={l}/>)}
      </tbody>
    </table>
  )
}

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

// Anexo com o texto do memorial do MA reaproveitado (mesmos geradores de
// data/memorial/*) — só quando a medida está ativa; senão fica só o título
// e a orientação do formulário, para o RT anexar à mão.
function Anexo({ letra, titulo, descricao, secoes }) {
  return (
    <div>
      <div className="pbf-anexo">
        <div className="pbf-anexo-titulo">ANEXO {letra}</div>
        <div className="pbf-anexo-desc">{titulo}</div>
        {descricao && <div className="pbf-anexo-desc">{descricao}</div>}
      </div>
      {(secoes || []).map((s, i) => (
        <div key={i} className="mt-3">
          {numerarBlocos(s.blocos || (s.paragrafos || []).map(texto => ({ tipo: 'paragrafo', texto })), letra).map((b, j) => <BlocoMedida key={j} bloco={b}/>)}
        </div>
      ))}
    </div>
  )
}

export default function MemorialPBPage({ onBack }) {
  const { state } = useProjeto()
  const { sistemas, porEstrutura } = useMedidasObrigatorias()
  const formulario = buildFormularioPB(state, sistemas, porEstrutura)

  if (!formulario) return null
  // Só com a norma da medida cadastrada para o estado (base central).
  const anexoA = sistemas.saida_emergencia?.ativo && getSE(state.uf) ? [textoMemorialSaidaEmergencia(state, sistemas, porEstrutura)] : []
  const anexoB = sistemas.hidrantes?.ativo && getHidrantes(state.uf) && getExtintores(state.uf)
    ? [textoMemorialHidrantes(state, sistemas, porEstrutura), textoMemorialCalculoHidrantes(state)].filter(Boolean)
    : []

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="no-print shrink-0 flex items-center justify-between gap-3 py-3 px-8 border-b border-solid border-border">
        <button className="btn-ghost" onClick={onBack}><Icon name="left" size={13}/> Voltar</button>
        <button className="btn-primary" onClick={() => window.print()}><Icon name="file" size={13}/> Imprimir / Salvar PDF</button>
      </div>

      <div className="relative print:static flex-1 min-h-0 flex">
        <div className="flex-1 min-w-0 overflow-auto py-8 flex flex-col">
          {/* Os campos que só a PB pede ficam nos boxes "Campos específicos da
              Paraíba" de cada página de medida e da Configuração
              (components/pb/CamposPB.jsx) — aqui o documento só é exibido. */}
          {!formulario.temTabelaExigencias && (
            <div className="no-print ibox amber mx-auto mb-6 max-w-[760px]">
              <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
              <span>A tabela de exigências da NT 04/2023 CBMPB não foi encontrada (Supabase, normas_dados: uf &apos;PB&apos;, sistema &apos;medidas_seguranca&apos;): só as medidas do mínimo de referência saem como &quot;Exigível&quot;; as demais ficam sem marcação.</span>
            </div>
          )}
          <PreviewPaginado css={CSS_PAGINA}>
            <div className="pbf">
              <Cabecalho norma={formulario.norma}/>
              {formulario.secoes.map((s, i) => <Secao key={i} secao={s}/>)}
              <div className="pbf-anexos">
                <Anexo letra="A" titulo="APRESENTAÇÃO DOS CÁLCULOS DE DIMENSIONAMENTO DAS SAÍDAS DE EMERGÊNCIA E POPULAÇÃO PARA TODAS AS EDIFICAÇÕES" secoes={anexoA}/>
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
    </div>
  )
}
