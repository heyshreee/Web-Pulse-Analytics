import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Book,
  Calendar, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock, Code,
  Columns, Copy, CornerDownLeft, CreditCard, Database, Download, ExternalLink, File,
  Filter, Flag, Folder, Globe, HelpCircle, Info, KeyRound, LayoutGrid, Link2, List,
  Lock, LogOut, Menu, Minus, Monitor, Moon, MoreHorizontal, MousePointerClick, PanelLeft,
  Percent, Plus, Radio, RefreshCw, Ruler, Search, Shield, SlidersHorizontal, Smartphone,
  Sun, Tablet, Timer, Trash2, TrendingUp, User, Users, Wallet, X, XCircle, Zap,
} from 'lucide-react';

const MAP = {
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
