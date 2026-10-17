import { Fragment } from 'react'
import { BlocoMedida } from '../../components/documentos/BlocosMemorial'

// Renderização das seções do formulário do Memorial Descritivo do CBMPB
// (linhas tipadas de estados/PB/formulario.js, classes .pbf-* do index.css).
// Usada no documento (MemorialPBPage) e na prévia de cada página da PB.

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
          {linha.blocos?.length > 0 && (
            <div className="pbf-obs-blocos">
              {linha.blocos.map((b, i) => <BlocoMedida key={i} bloco={b}/>)}
            </div>
          )}
        </div></td></tr>
      )
    default:
      return null
  }
}

export function Secao({ secao }) {
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
