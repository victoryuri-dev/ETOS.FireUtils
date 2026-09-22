import {
  ArrowLeft, ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Check, Plus, Minus,
  Trash2, Info, AlertTriangle, Save, Settings, LayoutDashboard, Droplet, DoorOpen,
  Flame, Bell, Sun, Moon, File, SprayCan, Signpost, Radar, FireExtinguisher, Layers,
  Building2, Building, Search, X, Upload, Pencil, User, SquareDashed, PanelLeft,
  BrickWallFire, AlarmSmoke, BellElectric, Van, ShieldAlert, Loader2, CircleCheck,
  SeparatorHorizontal, GripVertical, Copy, MoreVertical, SquareArrowRightExit,
} from 'lucide-react'
import hidranteIconSvg from '../../assets/icons/hidrante-icon.svg?raw'
import extintorIconSvg from '../../assets/icons/extintor-icon.svg?raw'
import saidaEmergenciaIconSvg from '../../assets/icons/saidaemergencia-icon.svg?raw'
import detectorIconSvg from '../../assets/icons/detector-icon.svg?raw'
import segEstruturalIconSvg from '../../assets/icons/seg-estrutural-icon.svg?raw'

const ICONS = {
  left: ArrowLeft, right: ArrowRight, chevD: ChevronDown, chevL: ChevronLeft, chevR: ChevronRight,
  check: Check, plus: Plus, minus: Minus, trash: Trash2, info: Info, warn: AlertTriangle,
  save: Save, settings: Settings, dash: LayoutDashboard, drop: Droplet, exit: DoorOpen,
  flame: Flame, bell: Bell, sun: Sun, moon: Moon, file: File, spray: SprayCan, sign: Signpost,
  sensor: Radar, ext: FireExtinguisher, stair: Layers, newbld: Building2, oldbld: Building,
  search: Search, x: X, upload: Upload, edit: Pencil, user: User, area: SquareDashed,
  panelLeft: PanelLeft, wallFire: BrickWallFire, alarmSmoke: AlarmSmoke, bellElectric: BellElectric,
  van: Van, shieldAlert: ShieldAlert, spinner: Loader2, checkCircle: CircleCheck,
  wallCompart: SeparatorHorizontal,
  grip: GripVertical, copy: Copy, moreVert: MoreVertical, exitBox: SquareArrowRightExit,
}

// Ícones próprios (SVG entregue pelo design, path fill="currentColor") em vez
// de um ícone genérico do lucide — usados nas medidas de segurança que já
// têm identidade visual própria (menu lateral + título da página). Renderizados
// inline (não <img>) justamente pra herdar `color` via CSS — é isso que faz o
// ícone mudar de cor sozinho no hover/ativo da sidebar, sem herdar de <img>.
const CUSTOM_ICONS = {
  hidranteMedida: hidranteIconSvg,
  extintorMedida: extintorIconSvg,
  saidaEmergenciaMedida: saidaEmergenciaIconSvg,
  detectorMedida: detectorIconSvg,
  segEstruturalMedida: segEstruturalIconSvg,
}

export default function Icon({ name, size=16, color, strokeWidth, className='' }) {
  const customSvg = CUSTOM_ICONS[name]
  if (customSvg) {
    return (
      <span
        className={`inline-block align-middle shrink-0 ${className}`}
        style={{ width: size, height: size, color: color || 'currentColor' }}
        dangerouslySetInnerHTML={{ __html: customSvg }}
      />
    )
  }
  const Cmp = ICONS[name]
  if (!Cmp) return null
  return <Cmp size={size} color={color || 'currentColor'} strokeWidth={strokeWidth} className={`inline-block align-middle shrink-0 ${className}`}/>
}
