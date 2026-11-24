import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Book,
  Calendar, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock, Code,
  Columns, Copy, CornerDownLeft, CreditCard, Database, Download, ExternalLink, File,
  Filter, Flag, Folder, Globe, HelpCircle, Info, KeyRound, LayoutGrid, Link2, List,
  Lock, LogOut, Menu, Minus, Monitor, Moon, MoreHorizontal, MousePointerClick, PanelLeft,
  Percent, Plus, Radio, RefreshCw, Ruler, Search, Shield, SlidersHorizontal, Smartphone,
  Sun, Tablet, Timer, Trash2, TrendingUp, User, Users, Wallet, X, XCircle, Zap,
} from 'lucide-react';

function LogoIcon({ size = 16, width, height, className = '', ...props }) {
  const w = width || size;
  const h = height || size;
  return (
    <svg
      viewBox="0 0 706 204"
      width={w}
      height={h}
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M 43 102 L 43 147 L 89 147 L 90 145 L 89 102 Z" />
      <path d="M 1 61 L 1 98 L 39 98 L 39 61 Z" />
      <path d="M 705 121 L 705 93 L 609 92 L 581 127 L 526 2 L 496 2 L 415 128 L 347 52 L 298 52 L 214 138 L 114 21 L 46 21 L 200 203 L 231 202 L 325 111 L 406 203 L 426 203 L 510 66 L 564 191 L 582 191 L 621 122 Z" />
    </svg>
  );
}

const MAP = {
  brand: LogoIcon,
  logo: LogoIcon,
  dashboard: LayoutGrid,
  users: Users,
  activity: Activity,
  eye: Activity,
  percent: Percent,
  timer: Timer,
  zap: Zap,
  globe: Globe,
  monitor: Monitor,
  smartphone: Smartphone,
  tablet: Tablet,
  click: MousePointerClick,
  radio: Radio,
  bell: Bell,
  folder: Folder,
  key: KeyRound,
  link: Link2,
  card: CreditCard,
  sliders: SlidersHorizontal,
  help: HelpCircle,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  menu: Menu,
  search: Search,
  plus: Plus,
  download: Download,
  upRight: ArrowUpRight,
  downRight: ArrowDownRight,
  arrowRight: ArrowRight,
  minus: Minus,
  close: X,
  check: Check,
  copy: Copy,
  trash: Trash2,
  more: MoreHorizontal,
  external: ExternalLink,
  filter: Filter,
  calendar: Calendar,
  refresh: RefreshCw,
  warn: AlertTriangle,
  info: Info,
  checkCircle: CheckCircle2,
  xCircle: XCircle,
  file: File,
  code: Code,
  sun: Sun,
  moon: Moon,
  logout: LogOut,
  user: User,
  cornerDown: CornerDownLeft,
  database: Database,
  trend: TrendingUp,
  panelLeft: PanelLeft,
  list: List,
  flag: Flag,
  lock: Lock,
  shield: Shield,
  book: Book,
  clock: Clock,
  columns: Columns,
  wallet: Wallet,
  ruler: Ruler,
};

/**
 * One coherent stroke family across the product: 24px grid, 1.75 stroke,
 * round caps — matching the design export.
 */
export default function Icon({ name, size = 16, strokeWidth = 1.75, className = '', ...rest }) {
  const Cmp = MAP[name];
  if (!Cmp) return null;
  return (
    <Cmp
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    />
  );
}
