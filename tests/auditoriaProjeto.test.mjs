import assert from 'node:assert/strict'
import { test, after } from 'node:test'
import { createServer } from 'vite'

const server = await createServer({ server:{ middlewareMode:true }, appType:'custom' })
after(() => server.close())
const { camposObrigatorios, camposOpcionais, etapaExibida } = await server.ssrLoadModule('/src/data/auditoriaProjeto.js')

function projeto() {
  return { uf:'MA', tipoProjeto:'completo', nome:'Projeto', endereco:'Rua A', cidade:'São Luís', respCNPJ:'123', respRazaoSocial:'Empresa', propNome:'Proprietário', propDocumento:'123', rtNome:'Responsável', rtConselho:'CREA 123', rtEspecialidade:'Engenharia', usaArt:false, areaConstruidaTotal:'100',
    caracteristicasEstrutura:'Concreto armado', cobertura:'Telha metálica', fachada:'Alvenaria',
    estruturas:[{ id:'e1', nome:'Indústria', areaTotal:'100', altura:'5', nPavimentos:1, nSubsolos:0, estrutura:['Concreto armado'] }],
    pavimentos:[{ id:'p1', estruturaId:'e1', label:'Térreo', grupo:'J', divisao:'J-1', area:'100', ambientes:[], acess:[] }],
    cargaState:{ e1:{ 'J-1':{ metodo:'levantamento', valorManual:'100' } } }, sistemasPorEstrutura:{}, hidrantes:{}, extintores:[], iluminacao:[], sinalizacao:[], acabamentos:[], acabamentoAmbientes:[] }
}
function medidas(s, keys) { return s.estruturas.map(estrutura => ({ estrutura, sistemas:Object.fromEntries(keys.map(k => [k,{ ativo:estrutura.id === 'e1', obrigatorio:true }])) })) }
const campo = (campos,id) => campos.find(c => c.id === id)

test('projeto base preenchido não cobra opcionais ou CNAE inexistente',() => {
  const campos = camposObrigatorios(projeto())
  assert.deepEqual(campos.filter(c => c.pendente),[])
  assert.equal(campo(campos,'p1.cnae'),undefined)
  assert.equal(campo(campos,'rtEmail'),undefined)
})
test('características construtivas são obrigatórias e pertencem à etapa de edificação',() => {
  const s = projeto()
  for (const id of ['caracteristicasEstrutura','cobertura','fachada']) s[id] = '  '
  const c = camposObrigatorios(s)
  for (const id of ['caracteristicasEstrutura','cobertura','fachada']) {
    assert.equal(campo(c,id).pendente,true)
    assert.equal(campo(c,id).etapa,2)
  }
})
test('ignora espaços e rejeita dimensões zero, negativas e não numéricas',() => {
  const s = projeto(); s.nome='  '; s.estruturas[0].areaTotal='0'; s.estruturas[0].altura='-2'; s.pavimentos[0].area='abc'
  const c = camposObrigatorios(s)
  for (const id of ['nome','e1.areaTotal','e1.altura']) assert.equal(campo(c,id).pendente,true)
})
test('áreas das ocupações são opcionais e não bloqueiam a auditoria obrigatória',() => {
  const s = projeto(); s.pavimentos[0].area=''
  s.pavimentos[0].acess=[{ divisao:'J-1', grupo:'J', area:'' }]
  assert.equal(campo(camposObrigatorios(s),'p1.area'),undefined)
  assert.equal(campo(camposObrigatorios(s),'p1.acess.0.area'),undefined)
  for (const id of ['p1.area','p1.acess.0.area']) {
    const c = campo(camposOpcionais(s),id)
    assert.equal(c.obrigatorio,false)
    assert.equal(c.pendente,true)
    assert.equal(c.etapa,4)
  }
  s.pavimentos[0].area='50'
  assert.equal(campo(camposOpcionais(s),'p1.area').pendente,false)
})
test('ART e dimensões condicionais só entram quando aplicáveis',() => {
  const s = projeto(); s.usaArt=true; s.estruturas[0].nPavimentos=2; s.estruturas[0].nSubsolos=1
  const c = camposObrigatorios(s)
  for (const id of ['artNumero','e1.alturaEdificacao','e1.profundidadeSubsolo']) assert.equal(campo(c,id).pendente,true)
  s.usaArt=false; s.estruturas[0].nPavimentos=1; s.estruturas[0].nSubsolos=0
  for (const id of ['artNumero','e1.alturaEdificacao','e1.profundidadeSubsolo']) assert.equal(campo(camposObrigatorios(s),id),undefined)
})
test('dimensionamento não cobra identificação completa ou responsável técnico',() => {
  const s=projeto();s.tipoProjeto='dimensionamento';s.rtNome='';s.endereco='';s.usaArt=true
  const c=camposObrigatorios(s)
  for(const id of ['rtNome','endereco','artNumero'])assert.equal(campo(c,id),undefined)
  assert.equal(etapaExibida(2,true),1);assert.equal(etapaExibida(3,false),2)
})
test('medida desativada não audita seus dados nem os da outra estrutura',() => {
  const s=projeto();s.estruturas.push({ ...s.estruturas[0],id:'e2',nome:'Administrativo' })
  const c=camposObrigatorios(s,medidas(s,['alarme']))
  assert.equal(campo(c,'e1.alarme.central').pendente,true)
  assert.equal(campo(c,'e2.alarme.central'),undefined)
  assert.equal(campo(c,'e1.deteccao.tiposDetector'),undefined)
})
test('detecção permite pavimento sem detector e exige total do tipo selecionado',() => {
  const s=projeto();s.estruturas[0].deteccao={ tiposDetector:['fumaca_pontual'] };s.pavimentos[0].deteccao={ tipos:{ fumaca_pontual:'2' } }
  s.pavimentos.push({ ...s.pavimentos[0],id:'p2',label:'Superior',deteccao:{ tipos:{} } })
  let c=camposObrigatorios(s,medidas(s,['deteccao']))
  assert.equal(campo(c,'e1.deteccao.fumaca_pontual').pendente,false)
  assert.equal(campo(c,'p2.deteccao.fumaca_pontual'),undefined)
  s.pavimentos[0].deteccao.tipos.fumaca_pontual='0'
  c=camposObrigatorios(s,medidas(s,['deteccao']));assert.equal(campo(c,'e1.deteccao.fumaca_pontual').pendente,true)
})
test('alarme não cobra quantidades com mínimos automáticos; circuito é condicional',() => {
  const s=projeto();s.estruturas[0].alarme={ central:'convencional',centralLocal:'Portaria',fonteAuxiliar:'bateria',fonteAuxiliarLocal:'Portaria',avisadores:['sonoro'] }
  const c=camposObrigatorios(s,medidas(s,['alarme']))
  assert.equal(c.some(c=>c.rota==='medida/alarme' && c.pendente),false)
  assert.equal(campo(c,'e1.alarme.circuito'),undefined)
  s.estruturas[0].alarme.central='enderecavel';assert.equal(campo(camposObrigatorios(s,medidas(s,['alarme'])),'e1.alarme.circuito').pendente,true)
})
test('saída com assentos fixos não exige área do ambiente',() => {
  const s=projeto();s.pavimentos[0].ambientes=[{ id:'a1',nome:'Auditório',divisao:'F-5',popTipo:'fixo',assentos:64,area:'' }]
  const c=camposObrigatorios(s,medidas(s,['saida_emergencia']))
  assert.equal(campo(c,'a1.assentos').pendente,false);assert.equal(campo(c,'a1.area'),undefined)
})
test('CMAR cobre linhas ainda não criadas e laudo condicional',() => {
  const s=projeto();s.acabamentoAmbientes=[{ id:'a1',estruturaId:'e1',nome:'Sala' }]
  s.acabamentos=[{ estruturaId:'e1',chave:'a1|piso',origem:'manual',materialNome:'Piso',classeAdotada:'I',fabricante:'',laudoNumero:'' }]
  const c=camposObrigatorios(s,medidas(s,['controle_acabamento']))
  assert.equal(campo(c,'e1.a1|piso.fabricante').pendente,true)
  assert.equal(campo(c,'e1.a1|parede.origem').pendente,true)
  assert.equal(campo(c,'e1.a1|parede.laudoNumero'),undefined)
})
test('iluminação compartilhada é auditada uma vez e fonte depende do sistema',() => {
  const s=projeto();s.estruturas.push({ ...s.estruturas[0],id:'e2' });s.iluminacaoMesmoSistema=true;s.iluminacaoSistema={tipo:'central',localizacaoFonte:''}
  const pe=s.estruturas.map(estrutura=>({ estrutura,sistemas:{ iluminacao:{ ativo:true } } }))
  let c=camposObrigatorios(s,pe)
  assert.equal(c.filter(c=>c.id==='iluminacao.sistema.tipo').length,1)
  assert.equal(campo(c,'iluminacao.sistema.localizacaoFonte').pendente,true)
  assert.equal(campo(c,'iluminacao.sistema.localizacaoFonte').estruturaId,undefined)
  s.iluminacaoSistema.tipo='bloco_autonomo';c=camposObrigatorios(s,pe);assert.equal(campo(c,'iluminacao.sistema.localizacaoFonte'),undefined)
})
test('hidrantes exige só bombas ativas, após liberar sua etapa',() => {
  const s=projeto();s.hidrantes={ bombaExiste:true,bombaJockey:true,bombaReserva:false }
  assert.equal(campo(camposObrigatorios(s,medidas(s,['hidrantes'])),'hidrantes.bombaJockeyPotencia'),undefined)
  s.hidrantes.dimensionamento={ succao:'positiva' }
  const c=camposObrigatorios(s,medidas(s,['hidrantes']))
  assert.equal(campo(c,'hidrantes.bombaJockeyPotencia').pendente,true)
  assert.equal(campo(c,'hidrantes.bombaReservaAcionamento'),undefined)
})
test('acesso de viatura cobra retorno apenas acima do gatilho',() => {
  const s=projeto();s.acessoViatura={ afastamentoMeioFio:30,extensaoVia:50,tipoRetorno:'outro',tipoRetornoOutroDesc:'' }
  const c=camposObrigatorios(s,medidas(s,['acesso_viatura']))
  assert.equal(campo(c,'acessoViatura.tipoRetornoOutroDesc').pendente,true)
  s.acessoViatura.extensaoVia=40;assert.equal(campo(camposObrigatorios(s,medidas(s,['acesso_viatura'])),'acessoViatura.tipoRetorno'),undefined)
})
