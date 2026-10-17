import PaginaPB from './PaginaPB'
import {
  CamposCompartimentacaoPB, CamposSaidasPB, CamposPlanoPB, CamposBrigadaPB, CamposIluminacaoPB,
  CamposAlarmeDeteccaoPB, CamposSinalizacaoPB, CamposExtintoresPB, CamposHidrantesPB, CamposAcessoViaturaPB, ResultadoCmarPB,
} from './campos'

// Página da PB de cada medida (chave = sistema, a mesma das rotas
// /medida/:sistKey e do menu lateral). Ver estados/registro.js.
const compart = (
  <PaginaPB titulo="Compartimentação" secoes={['8.']}
    aviso="A NT 36 (compartimentação) da PB ainda não está cadastrada: a área máxima a compartimentar sai em branco.">
    <CamposCompartimentacaoPB/>
  </PaginaPB>
)
const alarmeDeteccao = (
  <PaginaPB titulo="Alarme e Detecção de Incêndio" secoes={['14.']}
    observacoes={[['alarme', 'Observações complementares — 14.1 Alarme'], ['deteccao', 'Observações complementares — 14.2 Detecção']]}>
    <CamposAlarmeDeteccaoPB alarme deteccao/>
  </PaginaPB>
)
const semSecao = titulo => (
  <PaginaPB titulo={titulo} secoes={['4.']}
    aviso="Esta medida não tem seção própria no formulário do CBMPB: ela só é marcada no item 4 (Medidas de proteção da edificação)."/>
)

export const PAGINAS_PB = {
  acesso_viatura: (
    <PaginaPB titulo="Acesso de Viatura" secoes={['6.']}><CamposAcessoViaturaPB/></PaginaPB>
  ),
  // seg_estrutural: sem página própria — a do MA (SegurancaEstruturalPage) só
  // mostra o resultado do TRRF, com a norma do estado; vale para os dois.
  compart_horizontal: compart,
  compart_vertical: compart,
  controle_acabamento: <PaginaPB titulo="Controle de Materiais de Acabamento (CMAR)" secoes={['9.']} observacoes="controle_acabamento"><ResultadoCmarPB/></PaginaPB>,
  saida_emergencia: <PaginaPB titulo="Saídas de Emergência" secoes={['10.']} observacoes="saida_emergencia"><CamposSaidasPB/></PaginaPB>,
  gerenciamento_risco: <PaginaPB titulo="Gerenciamento de Risco de Incêndio" secoes={['11']} observacoes="gerenciamento_risco"><CamposPlanoPB/></PaginaPB>,
  brigada: <PaginaPB titulo="Brigada de Incêndio" secoes={['12.']} observacoes="brigada"><CamposBrigadaPB/></PaginaPB>,
  iluminacao: <PaginaPB titulo="Iluminação de Emergência" secoes={['13.']} observacoes="iluminacao"><CamposIluminacaoPB/></PaginaPB>,
  alarme: alarmeDeteccao,
  deteccao: alarmeDeteccao,
  sinalizacao: <PaginaPB titulo="Sinalização de Emergência" secoes={['15.']} observacoes="sinalizacao"><CamposSinalizacaoPB/></PaginaPB>,
  extintores: <PaginaPB titulo="Extintores de Incêndio" secoes={['16.']} observacoes="extintores"><CamposExtintoresPB/></PaginaPB>,
  hidrantes: <PaginaPB titulo="Hidrantes e Mangotinhos" secoes={['17.']}><CamposHidrantesPB/></PaginaPB>,
  sprinklers: <PaginaPB titulo="Chuveiros Automáticos" secoes={['18.']}/>,
  spda: <PaginaPB titulo="SPDA" secoes={['19.']}/>,
  controle_fumaca: semSecao('Controle de Fumaça'),
  central_gas: semSecao('Central de Gás'),
}
