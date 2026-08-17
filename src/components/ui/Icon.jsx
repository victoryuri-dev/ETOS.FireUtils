import {
  ArrowLeft, ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Check, Plus, Minus,
  Trash2, Info, AlertTriangle, Save, Settings, LayoutDashboard, Droplet, DoorOpen,
  Flame, Bell, Sun, Moon, File, SprayCan, Signpost, Radar, FireExtinguisher, Layers,
  Building2, Building, Search, X, Upload, Pencil, User, SquareDashed,
} from 'lucide-react'

const ICONS = {
  left: ArrowLeft, right: ArrowRight, chevD: ChevronDown, chevL: ChevronLeft, chevR: ChevronRight,
  check: Check, plus: Plus, minus: Minus, trash: Trash2, info: Info, warn: AlertTriangle,
  save: Save, settings: Settings, dash: LayoutDashboard, drop: Droplet, exit: DoorOpen,
  flame: Flame, bell: Bell, sun: Sun, moon: Moon, file: File, spray: SprayCan, sign: Signpost,
  sensor: Radar, ext: FireExtinguisher, stair: Layers, newbld: Building2, oldbld: Building,
  search: Search, x: X, upload: Upload, edit: Pencil, user: User, area: SquareDashed,
}

export default function Icon({ name, size=16, color, className='' }) {
  const Cmp = ICONS[name]
  if (!Cmp) return null
  return <Cmp size={size} color={color || 'currentColor'} className={`inline-block align-middle shrink-0 ${className}`}/>
}
