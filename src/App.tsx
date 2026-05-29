import React, {
  useState,
  useMemo,
  createContext,
  useContext,
  useEffect,
} from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Home,
  Wallet,
  PieChart as PieChartIcon,
  Target,
  TrendingUp,
  CheckSquare,
  Plus,
  CreditCard,
  Landmark,
  Coins,
  ArrowRightLeft,
  ArrowDown,
  ArrowUp,
  Moon,
  Sun,
  X,
  Trash2,
  ShoppingCart,
  Coffee,
  Zap,
  Car,
  Heart,
  Copy,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Edit2,
  List,
  Circle,
  CheckCircle2,
} from "lucide-react";

// --- TYPES ---
type AccountType = "BANK" | "CREDIT_CARD" | "CASH_WALLET" | "INVESTMENT";
type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  purpose: string;
  bankLimit?: number;
  selfLimit?: number;
  icon: string;
  color: string;
}

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  sourceId: string;
  destId?: string;
  category: string;
  note: string;
}

interface Budget {
  id: string;
  category: string;
  limit: number;
  color: string;
  icon: string;
  month: string;
}

interface Commitment {
  id: string;
  title: string;
  amount: number;
  date: string;
  sourceId: string;
  destId?: string;
  linkedBudgetId?: string;
  isPaid?: boolean;
}

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  accountId: string;
}

interface Investment {
  id: string;
  name: string;
  type: string;
  monthlyContribution: number;
  frequency?: string; // Monthly, Quarterly, Yearly
  totalInvested: number;
  currentValue: number;
  treatAsExpense: boolean;
}

interface MonthEndTask {
  id: string;
  text: string;
  isCompleted: boolean;
}

interface AppState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  currentMonth: string;
  setCurrentMonth: (m: string) => void;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  commitments: Commitment[];
  goals: Goal[];
  investments: Investment[];

  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  openTxModal: (t?: Transaction) => void;

  addAccount: (a: Omit<Account, "id">) => void;
  updateAccount: (id: string, a: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  openAccountModal: (acc?: Account) => void;

  addBudget: (b: Omit<Budget, "id">) => void;
  updateBudget: (id: string, b: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  copyBudgets: (fromMonth: string, toMonth: string) => void;
  openBudgetModal: (b?: Budget) => void;

  addCommitment: (c: Omit<Commitment, "id">) => void;
  updateCommitment: (id: string, c: Partial<Commitment>) => void;
  deleteCommitment: (id: string) => void;
  openCommitmentModal: (c?: Commitment) => void;
  markCommitmentPaid: (id: string) => void;

  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, g: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  openGoalModal: (g?: Goal) => void;

  addInvestment: (i: Omit<Investment, "id">) => void;
  updateInvestment: (id: string, i: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  openInvestmentModal: (i?: Investment) => void;

  monthEndTasks: MonthEndTask[];
  addMonthEndTask: (t: Omit<MonthEndTask, "id" | "isCompleted">) => void;
  updateMonthEndTask: (id: string, t: Partial<MonthEndTask>) => void;
  deleteMonthEndTask: (id: string) => void;
  toggleMonthEndTask: (id: string) => void;
  openTaskModal: (t?: MonthEndTask) => void;
}

const AppContext = createContext<AppState | null>(null);

// --- SEED DATA ---
const SEED_ACCOUNTS: Account[] = [
  {
    id: "a1",
    name: "HDFC Bank",
    type: "BANK",
    balance: 12000,
    purpose: "Primary spending (Salary)",
    icon: "Landmark",
    color: "#1d4ed8",
  },
  {
    id: "a2",
    name: "HDFC Tata Neu",
    type: "CREDIT_CARD",
    balance: -2500,
    bankLimit: 90000,
    selfLimit: 15000,
    purpose: "Monthly spend",
    icon: "CreditCard",
    color: "#6d28d9",
  },
  {
    id: "a3",
    name: "SBI Bank",
    type: "BANK",
    balance: 85000,
    purpose: "Emergency",
    icon: "Landmark",
    color: "#0369a1",
  },
  {
    id: "a4",
    name: "Canara Bank",
    type: "BANK",
    balance: 25000,
    purpose: "MF linked + Backup",
    icon: "Landmark",
    color: "#b91c1c",
  },
  {
    id: "a5",
    name: "Black Wallet 1",
    type: "CASH_WALLET",
    balance: 1500,
    purpose: "Daily cash",
    icon: "Wallet",
    color: "#334155",
  },
  {
    id: "a6",
    name: "Black Wallet 2",
    type: "CASH_WALLET",
    balance: 2000,
    purpose: "Emergency bag cash",
    icon: "Wallet",
    color: "#0f172a",
  },
];

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    date: "2026-05-01",
    amount: 25000,
    type: "INCOME",
    sourceId: "a1",
    category: "Salary",
    note: "May Salary",
  },
  {
    id: "t2",
    date: "2026-05-02",
    amount: 8000,
    type: "EXPENSE",
    sourceId: "a1",
    category: "Family",
    note: "Home Remittance",
  },
  {
    id: "t3",
    date: "2026-05-03",
    amount: 1500,
    type: "TRANSFER",
    sourceId: "a1",
    destId: "i1",
    category: "Investment",
    note: "MF Transfer",
  },
  {
    id: "t4",
    date: "2026-05-03",
    amount: 500,
    type: "TRANSFER",
    sourceId: "a1",
    destId: "i2",
    category: "Investment",
    note: "PPF Transfer",
  },
  {
    id: "t5",
    date: "2026-05-04",
    amount: 1763,
    type: "TRANSFER",
    sourceId: "a1",
    destId: "i3",
    category: "Sinking Fund",
    note: "LIC Monthly Provision",
  },
  {
    id: "t6",
    date: "2026-05-05",
    amount: 1500,
    type: "TRANSFER",
    sourceId: "a1",
    destId: "a5",
    category: "Withdrawal",
    note: "Daily Transport Cash",
  },
  {
    id: "t7",
    date: "2026-05-06",
    amount: 120,
    type: "EXPENSE",
    sourceId: "a5",
    category: "Transport",
    note: "Bus Ticket",
  },
  {
    id: "t8",
    date: "2026-05-10",
    amount: 850,
    type: "EXPENSE",
    sourceId: "a2",
    category: "Food & Dining",
    note: "Groceries",
  },
  {
    id: "t9",
    date: "2026-05-15",
    amount: 300,
    type: "EXPENSE",
    sourceId: "a2",
    category: "Bills & Utilities",
    note: "Mobile Bill",
  },
];

const SEED_BUDGETS: Budget[] = [
  {
    id: "b1",
    category: "Transport",
    limit: 1500,
    color: "#f59e0b",
    icon: "Car",
    month: "2026-05",
  },
  {
    id: "b2",
    category: "Food & Dining",
    limit: 4000,
    color: "#10b981",
    icon: "Coffee",
    month: "2026-05",
  },
  {
    id: "b3",
    category: "Shopping/Personal",
    limit: 2000,
    color: "#8b5cf6",
    icon: "ShoppingCart",
    month: "2026-05",
  },
  {
    id: "b4",
    category: "Bills & Utilities",
    limit: 1000,
    color: "#3b82f6",
    icon: "Zap",
    month: "2026-05",
  },
  {
    id: "b5",
    category: "Family",
    limit: 10000,
    color: "#f43f5e",
    icon: "Heart",
    month: "2026-05",
  },
];

const SEED_INVESTMENTS: Investment[] = [
  {
    id: "i1",
    name: "Mutual Fund (Equity)",
    type: "MF",
    monthlyContribution: 1500,
    frequency: "Monthly",
    totalInvested: 45000,
    currentValue: 52300,
    treatAsExpense: false,
  },
  {
    id: "i2",
    name: "PPF",
    type: "PPF",
    monthlyContribution: 500,
    frequency: "Monthly",
    totalInvested: 15000,
    currentValue: 16100,
    treatAsExpense: false,
  },
  {
    id: "i3",
    name: "LIC Jeevan Umang (745)",
    type: "LIC",
    monthlyContribution: 5300,
    frequency: "Quarterly",
    totalInvested: 21156,
    currentValue: 9500,
    treatAsExpense: true,
  },
];

const SEED_COMMITMENTS: Commitment[] = [
  {
    id: "c1",
    title: "Home Remittance",
    amount: 8000,
    date: "2026-05-02",
    sourceId: "a1",
    isPaid: false,
  },
  {
    id: "c2",
    title: "Mutual Fund SIPs",
    amount: 1500,
    date: "2026-05-05",
    sourceId: "a4",
    destId: "i1",
    isPaid: false,
  },
  {
    id: "c3",
    title: "PPF Investment",
    amount: 500,
    date: "2026-05-05",
    sourceId: "a3",
    destId: "i2",
    isPaid: false,
  },
  {
    id: "c4",
    title: "LIC Premium (QTR)",
    amount: 5300,
    date: "2026-05-28",
    sourceId: "a4",
    destId: "i3",
    isPaid: false,
  },
  {
    id: "c5",
    title: "Train Pass",
    amount: 500,
    date: "2026-05-01",
    sourceId: "a5",
    isPaid: false,
  },
  {
    id: "c6",
    title: "Daily Transport Cash",
    amount: 1500,
    date: "2026-05-01",
    sourceId: "a1",
    destId: "a5",
    isPaid: false,
  },
];

const SEED_GOALS: Goal[] = [
  {
    id: "g1",
    name: "1BHK Flat Downpayment",
    target: 500000,
    current: 85000,
    deadline: "2030-12-31",
    accountId: "a3",
  },
  {
    id: "g2",
    name: "Emergency Fund (6 Months)",
    target: 120000,
    current: 85000,
    deadline: "2027-06-30",
    accountId: "a3",
  },
];

const SEED_TASKS: MonthEndTask[] = [
  {
    id: "tk1",
    text: "Reconcile physical cash in Black & Brown wallets",
    isCompleted: false,
  },
  {
    id: "tk2",
    text: "Pay HDFC Tata Neu CC bill in full from Salary account",
    isCompleted: false,
  },
  {
    id: "tk3",
    text: "Move provisions for next month (LIC, Train) to Canara Bank",
    isCompleted: false,
  },
  {
    id: "tk4",
    text: "Sweep all remaining HDFC buffer into SBI Emergency Fund",
    isCompleted: false,
  },
  {
    id: "tk5",
    text: "Withdraw cash for next month's daily transport",
    isCompleted: false,
  },
];

const TODAY_DATE_FORMATTED = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

// --- HELPER COMPONENTS ---
const Card = ({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 ${onClick ? "cursor-pointer hover:border-indigo-500/50 transition-colors" : ""} ${className}`}
  >
    {children}
  </div>
);

const ProgressBar = ({
  current,
  max,
  color,
}: {
  current: number;
  max: number;
  color: string;
}) => {
  const percent = Math.min((current / max) * 100, 100);
  return (
    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mt-2">
      <div
        className="h-2.5 rounded-full transition-all duration-500"
        style={{ width: `${percent}%`, backgroundColor: color }}
      ></div>
    </div>
  );
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

const renderAppIcon = (name: string, size: number = 20) => {
  switch (name) {
    case "Landmark":
      return <Landmark size={size} />;
    case "CreditCard":
      return <CreditCard size={size} />;
    case "Wallet":
      return <Wallet size={size} />;
    case "Coins":
      return <Coins size={size} />;
    case "Car":
      return <Car size={size} />;
    case "Coffee":
      return <Coffee size={size} />;
    case "ShoppingCart":
      return <ShoppingCart size={size} />;
    case "Zap":
      return <Zap size={size} />;
    case "Heart":
      return <Heart size={size} />;
    default:
      return <Wallet size={size} />;
  }
};

// --- VIEWS ---

function DashboardView() {
  const {
    accounts,
    investments,
    transactions,
    openTxModal,
    commitments,
    openCommitmentModal,
    budgets,
    currentMonth,
    setActiveTab,
    markCommitmentPaid,
  } = useContext(AppContext)!;
  const [graphFilter, setGraphFilter] = useState<"both" | "spent" | "saved">(
    "both",
  );

  const [showAllCommitments, setShowAllCommitments] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const currentMonthExpenses = transactions
    .filter((t) => t.type === "EXPENSE" && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthIncome = transactions
    .filter((t) => t.type === "INCOME" && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseByCategory = useMemo(() => {
    const expenses = transactions.filter(
      (t) => t.type === "EXPENSE" && t.date.startsWith(currentMonth),
    );
    const grouped = expenses.reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    const colors = ["#f43f5e", "#8b5cf6", "#0ea5e9", "#10b981", "#f59e0b"];
    return Object.keys(grouped).map((key, index) => ({
      name: key,
      value: grouped[key],
      color: colors[index % colors.length],
    }));
  }, [transactions, currentMonth]);

  const savingsData = [
    { name: "Jan", spent: 18000, saved: 7000 },
    { name: "Feb", spent: 17500, saved: 7500 },
    { name: "Mar", spent: 19000, saved: 6000 },
    { name: "Apr", spent: 16000, saved: 9000 },
    {
      name: "Current",
      spent: currentMonthExpenses,
      saved: currentMonthIncome - currentMonthExpenses,
    },
  ];

  // Sorting logics
  const activeCommitments = useMemo(() => {
    return [...commitments]
      .filter((c) => !c.isPaid)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [commitments]);

  const displayedCommitments = showAllCommitments
    ? activeCommitments
    : activeCommitments.slice(0, 3);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [transactions]);

  const displayedTransactions = showAllTransactions
    ? sortedTransactions
    : sortedTransactions.slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {TODAY_DATE_FORMATTED}
          </p>
        </div>
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm font-medium">
                Total Net Worth
              </p>
              <h2 className="text-3xl font-bold mt-1">
                ₹{totalBalance.toLocaleString()}
              </h2>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <Landmark size={24} className="text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-indigo-100">
            <TrendingUp size={16} className="mr-1" /> All accounts combined
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Income (This Month)
              </p>
              <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                ₹{currentMonthIncome.toLocaleString()}
              </h2>
            </div>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <ArrowDown
                size={20}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Expenses (This Month)
              </p>
              <h2 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                ₹{currentMonthExpenses.toLocaleString()}
              </h2>
            </div>
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
              <ArrowUp size={20} className="text-rose-600 dark:text-rose-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              Savings vs Spending Trend
            </h3>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setGraphFilter("spent")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${graphFilter === "spent" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Spent
              </button>
              <button
                onClick={() => setGraphFilter("saved")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${graphFilter === "saved" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Saved
              </button>
              <button
                onClick={() => setGraphFilter("both")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${graphFilter === "both" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Both
              </button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={savingsData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#334155"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b" }}
                />
                <RechartsTooltip
                  cursor={{
                    stroke: "#64748b",
                    strokeWidth: 1,
                    strokeDasharray: "3 3",
                  }}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend iconType="circle" />
                {(graphFilter === "both" || graphFilter === "spent") && (
                  <Line
                    type="monotone"
                    dataKey="spent"
                    name="Spent"
                    stroke="#f43f5e"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                )}
                {(graphFilter === "both" || graphFilter === "saved") && (
                  <Line
                    type="monotone"
                    dataKey="saved"
                    name="Saved"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            Expense Breakdown
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {expenseByCategory.length === 0 ? (
              <p className="text-sm text-slate-500 text-center">
                No expenses yet.
              </p>
            ) : (
              expenseByCategory.map((item) => (
                <div
                  key={item.name}
                  className="flex justify-between items-center text-sm"
                >
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-slate-600 dark:text-slate-300">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white">
                    ₹{item.value.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Lists Section (Stacked vertically) */}
      <div className="space-y-6">
        {/* Upcoming Commitments (Upper Section) */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              Upcoming Commitments
            </h3>
            <button
              onClick={() => openCommitmentModal()}
              className="text-sm text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:underline"
            >
              <Plus size={16} /> New Commitment
            </button>
          </div>
          <div className="space-y-3">
            {displayedCommitments.map((c) => {
              const linkedBudget = budgets.find(
                (b) => b.id === c.linkedBudgetId,
              );
              const sourceAcc = accounts.find((a) => a.id === c.sourceId);
              const destAcc = accounts.find((a) => a.id === c.destId);
              const destInv = investments.find((i) => i.id === c.destId);

              const destName = destAcc?.name || destInv?.name;
              const fallbackSourceStr = (c as any).source;

              return (
                <div
                  key={c.id}
                  onClick={() => openCommitmentModal(c)}
                  className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-indigo-500/50 transition-colors group"
                >
                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markCommitmentPaid(c.id);
                      }}
                      className="p-1.5 mr-3 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-transparent hover:text-emerald-500 hover:border-emerald-500 transition-colors"
                      title="Mark as Paid"
                    >
                      <CheckCircle2
                        size={18}
                        className="fill-current bg-white dark:bg-slate-800 rounded-full"
                      />
                    </button>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {c.title}
                        {linkedBudget && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold border border-slate-300 dark:border-slate-700">
                            Linked to {linkedBudget.category}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Due: {new Date(c.date).toLocaleDateString()} • From:{" "}
                        <span className="font-medium">
                          {sourceAcc?.name || fallbackSourceStr || "Unknown"}
                        </span>
                        {destName && (
                          <span className="font-medium text-indigo-500">
                            {" "}
                            → To: {destName}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                      ₹{c.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}

            {activeCommitments.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                No upcoming commitments right now.
              </p>
            )}

            {activeCommitments.length > 3 && (
              <button
                onClick={() => setActiveTab("all_commitments")}
                className="w-full mt-2 py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <List size={16} /> View All {activeCommitments.length}{" "}
                Commitments
              </button>
            )}
          </div>
        </Card>

        {/* Recent Transactions (Lower Section) */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              Recent Transactions
            </h3>
            <span className="text-xs text-slate-500">Click to edit</span>
          </div>
          <div className="space-y-3">
            {displayedTransactions.map((t) => (
              <div
                key={t.id}
                onClick={() => openTxModal(t)}
                className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 cursor-pointer transition-all group"
              >
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full mr-3 ${
                      t.type === "INCOME"
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : t.type === "EXPENSE"
                          ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                          : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {t.type === "INCOME" ? (
                      <ArrowDown size={14} />
                    ) : t.type === "EXPENSE" ? (
                      <ArrowUp size={14} />
                    ) : (
                      <ArrowRightLeft size={14} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {t.note}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t.category} • {new Date(t.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-semibold text-sm ${
                      t.type === "INCOME"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : t.type === "EXPENSE"
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-500"
                    }`}
                  >
                    {t.type === "INCOME"
                      ? "+"
                      : t.type === "EXPENSE"
                        ? "-"
                        : ""}
                    ₹{t.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}

            {transactions.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                No transactions recorded.
              </p>
            )}

            {transactions.length > 5 && (
              <button
                onClick={() => setActiveTab("all_transactions")}
                className="w-full mt-2 py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <List size={16} /> View All {transactions.length} Transactions
              </button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function AccountsView() {
  const { accounts, openAccountModal } = useContext(AppContext)!;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Accounts & Wallets
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {TODAY_DATE_FORMATTED}
          </p>
        </div>
        <button
          onClick={() => openAccountModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors mt-4 sm:mt-0"
        >
          <Plus size={18} /> Add Account
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <Card
            key={acc.id}
            onClick={() => openAccountModal(acc)}
            className="relative overflow-hidden group"
          >
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: acc.color }}
            ></div>
            <div className="flex justify-between items-start mb-4 pl-2">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-xl"
                  style={{
                    backgroundColor: `${acc.color}20`,
                    color: acc.color,
                  }}
                >
                  {renderAppIcon(acc.icon)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {acc.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {acc.type.replace("_", " ")}
                  </p>
                </div>
              </div>
            </div>

            <div className="pl-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {acc.balance < 0 ? "-" : ""}₹
                {Math.abs(acc.balance).toLocaleString()}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                {acc.purpose}
              </p>

              {acc.type === "CREDIT_CARD" && acc.selfLimit && acc.bankLimit && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Self Limit Usage</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      ₹{Math.abs(acc.balance).toLocaleString()} / ₹
                      {acc.selfLimit.toLocaleString()}
                    </span>
                  </div>
                  <ProgressBar
                    current={Math.abs(acc.balance)}
                    max={acc.selfLimit}
                    color={acc.color}
                  />
                  <p className="text-[10px] text-slate-400 mt-2 text-right">
                    Bank Limit: ₹{acc.bankLimit.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BudgetView() {
  const {
    budgets,
    transactions,
    commitments,
    openBudgetModal,
    currentMonth,
    setCurrentMonth,
    copyBudgets,
  } = useContext(AppContext)!;

  const currentMonthIncome = transactions
    .filter((t) => t.type === "INCOME" && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  // Math perfectly preserves True Available even if a commitment is marked as "Paid"!
  const fixedDeductions = commitments
    .filter((c) => c.date.startsWith(currentMonth))
    .reduce((sum, c) => sum + c.amount, 0);

  const trueSpendable = currentMonthIncome - fixedDeductions;

  const currentBudgets = budgets.filter((b) => b.month === currentMonth);

  const totalBudgeted = currentBudgets.reduce((sum, b) => sum + b.limit, 0);

  const calculateSpent = (category: string) => {
    return transactions
      .filter(
        (t) =>
          t.type === "EXPENSE" &&
          t.category === category &&
          t.date.startsWith(currentMonth),
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const totalSpentInBudgets = currentBudgets.reduce(
    (sum, b) => sum + calculateSpent(b.category),
    0,
  );
  const unallocated = trueSpendable - totalBudgeted;

  const handlePrevMonth = () => {
    const [y, m] = currentMonth.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    setCurrentMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  };

  const handleNextMonth = () => {
    const [y, m] = currentMonth.split("-").map(Number);
    const d = new Date(y, m, 1);
    setCurrentMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  };

  const formatMonth = (yyyyMm: string) => {
    const [y, m] = yyyyMm.split("-");
    const date = new Date(Number(y), Number(m) - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const handleCopyPrevMonth = () => {
    const [y, m] = currentMonth.split("-").map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
    copyBudgets(prevMonth, currentMonth);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Planner ({formatMonth(currentMonth)})
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {TODAY_DATE_FORMATTED}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 mr-2">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium px-2">
              {formatMonth(currentMonth)}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <button
            onClick={handleCopyPrevMonth}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors text-sm"
          >
            <Copy size={16} />{" "}
            <span className="hidden sm:inline">Copy Prev Month</span>
          </button>
          <button
            onClick={() => openBudgetModal()}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            <Plus size={16} />{" "}
            <span className="hidden sm:inline">Add Budget</span>
          </button>
        </div>
      </header>

      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-none text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <PieChartIcon size={200} />
        </div>
        <div className="relative z-10">
          <h3 className="text-indigo-400 font-medium text-sm mb-1">
            True Spendable Calculator ({formatMonth(currentMonth)})
          </h3>
          <div className="flex flex-wrap items-end gap-4 mt-2">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                Income
              </p>
              <p className="text-xl font-bold text-emerald-400">
                ₹{currentMonthIncome.toLocaleString()}
              </p>
            </div>
            <div className="text-slate-500 mb-1">-</div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                Fixed Deductions
              </p>
              <p className="text-xl font-bold text-rose-400">
                ₹{fixedDeductions.toLocaleString()}
              </p>
            </div>
            <div className="text-slate-500 mb-1">=</div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                True Available
              </p>
              <p className="text-3xl font-bold text-white">
                ₹{trueSpendable.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 max-w-lg">
            Fixed deductions continuously match the sum of ALL your Commitments
            for this month (paid & unpaid). Income tracks your recorded Income
            transactions.
          </p>
        </div>
      </Card>

      {/* Budget Summary Engine */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 flex flex-col justify-center bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Total Budgeted
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            ₹{totalBudgeted.toLocaleString()}
          </span>
        </Card>
        <Card className="p-4 flex flex-col justify-center bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Total Spent
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            ₹{totalSpentInBudgets.toLocaleString()}
          </span>
        </Card>
        <Card className="p-4 flex flex-col justify-center bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 col-span-2 md:col-span-1">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            Left to Assign
          </span>
          <span
            className={`text-2xl font-bold ${unallocated < 0 ? "text-rose-600 dark:text-rose-400" : "text-indigo-700 dark:text-indigo-300"}`}
          >
            ₹{unallocated.toLocaleString()}
          </span>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
          Category Envelopes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentBudgets.length === 0 ? (
            <div className="col-span-full text-center p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
              <p className="text-slate-500 mb-4">
                No budgets set for {formatMonth(currentMonth)}.
              </p>
              <button
                onClick={handleCopyPrevMonth}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium"
              >
                Copy from previous month
              </button>
            </div>
          ) : (
            currentBudgets.map((b) => {
              const spent = calculateSpent(b.category);
              const remaining = b.limit - spent;
              return (
                <Card
                  key={b.id}
                  onClick={() => openBudgetModal(b)}
                  className="p-4 cursor-pointer hover:border-indigo-500/50 transition-colors group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-xl"
                        style={{
                          backgroundColor: `${b.color}20`,
                          color: b.color,
                        }}
                      >
                        {renderAppIcon(b.icon, 18)}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {b.category}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      ₹{remaining.toLocaleString()}{" "}
                      <span className="font-normal text-slate-500 text-xs">
                        left
                      </span>
                    </span>
                  </div>
                  <ProgressBar current={spent} max={b.limit} color={b.color} />
                  <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>Spent: ₹{spent.toLocaleString()}</span>
                    <span>Limit: ₹{b.limit.toLocaleString()}</span>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function InvestmentsView() {
  const { investments, goals, openGoalModal, openInvestmentModal } =
    useContext(AppContext)!;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Investments & Goals
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {TODAY_DATE_FORMATTED}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              Goals Progress
            </h3>
            <button
              onClick={() => openGoalModal()}
              className="text-sm text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:underline"
            >
              <Plus size={16} /> New Goal
            </button>
          </div>
          <div className="space-y-4">
            {goals.map((g) => (
              <Card
                key={g.id}
                onClick={() => openGoalModal(g)}
                className="cursor-pointer hover:border-indigo-500/50 transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {g.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Target: {new Date(g.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {((g.current / g.target) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <ProgressBar
                  current={g.current}
                  max={g.target}
                  color="#6366f1"
                />
                <div className="flex justify-between mt-2 text-xs font-medium">
                  <span className="text-slate-900 dark:text-white">
                    ₹{g.current.toLocaleString()}
                  </span>
                  <span className="text-slate-500">
                    ₹{g.target.toLocaleString()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              Portfolio
            </h3>
            <button
              onClick={() => openInvestmentModal()}
              className="text-sm text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:underline"
            >
              <Plus size={16} /> New Investment
            </button>
          </div>
          <div className="space-y-4">
            {investments.map((inv) => {
              const freqText =
                inv.frequency === "Quarterly"
                  ? "/qtr"
                  : inv.frequency === "Yearly"
                    ? "/yr"
                    : "/mo";

              return (
                <Card
                  key={inv.id}
                  onClick={() => openInvestmentModal(inv)}
                  className="relative overflow-hidden group cursor-pointer hover:border-indigo-500/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {inv.name}
                        {inv.treatAsExpense && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 uppercase tracking-wider font-semibold border border-rose-200 dark:border-rose-800">
                            Expense Logged
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Contribution: ₹
                        {inv.monthlyContribution.toLocaleString()}
                        {freqText}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-slate-900 dark:text-white">
                        ₹{inv.currentValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    Total Invested: ₹{inv.totalInvested.toLocaleString()}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthEndView() {
  const { monthEndTasks, toggleMonthEndTask, openTaskModal } =
    useContext(AppContext)!;

  const completedCount = monthEndTasks.filter((t) => t.isCompleted).length;
  const progress =
    monthEndTasks.length === 0
      ? 0
      : (completedCount / monthEndTasks.length) * 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Month-End Closure
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {TODAY_DATE_FORMATTED}
          </p>
        </div>
        <button
          onClick={() => openTaskModal()}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm mt-4 sm:mt-0"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Add Task</span>
        </button>
      </header>

      <Card className="bg-gradient-to-r from-indigo-900 to-slate-900 border-none text-white text-center py-8">
        <CheckSquare
          size={48}
          className="mx-auto text-indigo-400 mb-4 opacity-80"
        />
        <h2 className="text-3xl font-bold mb-2">
          {progress === 100 && monthEndTasks.length > 0
            ? "Month Closed!"
            : `${Math.round(progress)}% Complete`}
        </h2>
        <p className="text-indigo-200 text-sm max-w-md mx-auto">
          Completing these steps ensures every single rupee has a job and your
          budget starts fresh at zero.
        </p>
      </Card>

      <Card>
        <div className="space-y-1">
          {monthEndTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start justify-between p-4 rounded-xl transition-all group ${
                task.isCompleted
                  ? "bg-emerald-50 dark:bg-emerald-900/10 opacity-75"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <div
                onClick={() => toggleMonthEndTask(task.id)}
                className="flex items-start gap-4 flex-1 cursor-pointer"
              >
                <div
                  className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center border-2 transition-colors ${
                    task.isCompleted
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  }`}
                >
                  {task.isCompleted && (
                    <CheckSquare size={16} className="text-white absolute" />
                  )}
                </div>
                <span
                  className={`text-slate-700 dark:text-slate-300 ${task.isCompleted ? "line-through text-slate-500 dark:text-slate-500" : ""}`}
                >
                  {task.text}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openTaskModal(task);
                }}
                className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Edit2 size={16} />
              </button>
            </div>
          ))}
          {monthEndTasks.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">
              No tasks defined. Add one above!
            </p>
          )}
        </div>
      </Card>

      {progress === 100 && monthEndTasks.length > 0 && (
        <div className="text-center p-4 bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl font-medium flex items-center justify-center gap-2">
          <CheckSquare size={20} /> Ready for next month!
        </div>
      )}
    </div>
  );
}

function AllCommitmentsView() {
  const {
    accounts,
    investments,
    commitments,
    budgets,
    openCommitmentModal,
    setActiveTab,
    markCommitmentPaid,
  } = useContext(AppContext)!;

  const activeCommitments = useMemo(() => {
    return [...commitments]
      .filter((c) => !c.isPaid)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [commitments]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("dashboard")}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              All Commitments
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage all your upcoming bills.
            </p>
          </div>
        </div>
        <button
          onClick={() => openCommitmentModal()}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm"
        >
          <Plus size={16} />{" "}
          <span className="hidden sm:inline">New Commitment</span>
        </button>
      </header>

      <Card>
        <div className="space-y-3">
          {activeCommitments.map((c) => {
            const linkedBudget = budgets.find((b) => b.id === c.linkedBudgetId);
            const sourceAcc = accounts.find((a) => a.id === c.sourceId);
            const destAcc = accounts.find((a) => a.id === c.destId);
            const destInv = investments.find((i) => i.id === c.destId);

            const destName = destAcc?.name || destInv?.name;
            const fallbackSourceStr = (c as any).source;

            return (
              <div
                key={c.id}
                onClick={() => openCommitmentModal(c)}
                className="flex justify-between items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-indigo-500/50 transition-colors group"
              >
                <div className="flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markCommitmentPaid(c.id);
                    }}
                    className="p-2 mr-4 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-transparent hover:text-emerald-500 hover:border-emerald-500 transition-colors"
                    title="Mark as Paid"
                  >
                    <CheckCircle2
                      size={20}
                      className="fill-current bg-white dark:bg-slate-800 rounded-full"
                    />
                  </button>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {c.title}
                      {linkedBudget && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold border border-slate-300 dark:border-slate-700">
                          Linked to {linkedBudget.category}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Due: {new Date(c.date).toLocaleDateString()} • From:{" "}
                      <span className="font-medium">
                        {sourceAcc?.name || fallbackSourceStr || "Unknown"}
                      </span>
                      {destName && (
                        <span className="font-medium text-indigo-500">
                          {" "}
                          → To: {destName}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white text-lg">
                    ₹{c.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}

          {activeCommitments.length === 0 && (
            <div className="text-center p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
              <p className="text-slate-500 mb-4">
                No unpaid commitments found.
              </p>
              <button
                onClick={() => openCommitmentModal()}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium"
              >
                Add a new one
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function AllTransactionsView() {
  const { transactions, openTxModal, setActiveTab } = useContext(AppContext)!;

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [transactions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("dashboard")}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              All Transactions
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your complete financial history.
            </p>
          </div>
        </div>
        <button
          onClick={() => openTxModal()}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm"
        >
          <Plus size={16} />{" "}
          <span className="hidden sm:inline">New Transaction</span>
        </button>
      </header>

      <Card>
        <div className="space-y-3">
          {sortedTransactions.map((t) => (
            <div
              key={t.id}
              onClick={() => openTxModal(t)}
              className="flex justify-between items-center p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-slate-100 dark:border-slate-800 cursor-pointer transition-all group"
            >
              <div className="flex items-center">
                <div
                  className={`p-3 rounded-full mr-4 ${
                    t.type === "INCOME"
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : t.type === "EXPENSE"
                        ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                        : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  }`}
                >
                  {t.type === "INCOME" ? (
                    <ArrowDown size={18} />
                  ) : t.type === "EXPENSE" ? (
                    <ArrowUp size={18} />
                  ) : (
                    <ArrowRightLeft size={18} />
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {t.note}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {t.category} • {new Date(t.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`font-bold text-lg ${
                    t.type === "INCOME"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : t.type === "EXPENSE"
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-500"
                  }`}
                >
                  {t.type === "INCOME" ? "+" : t.type === "EXPENSE" ? "-" : ""}₹
                  {t.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}

          {transactions.length === 0 && (
            <div className="text-center p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
              <p className="text-slate-500 mb-4">No transactions recorded.</p>
              <button
                onClick={() => openTxModal()}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium"
              >
                Log a transaction
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// --- MAIN LAYOUT & APP ---

export default function App() {
  // Global View State
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentMonth, setCurrentMonth] = useState("2026-05");

  // --- Persistent State using LocalStorage ---
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem("paisa-accounts");
    return saved ? JSON.parse(saved) : SEED_ACCOUNTS;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("paisa-transactions");
    return saved ? JSON.parse(saved) : SEED_TRANSACTIONS;
  });
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem("paisa-budgets");
    return saved ? JSON.parse(saved) : SEED_BUDGETS;
  });
  const [commitments, setCommitments] = useState<Commitment[]>(() => {
    const saved = localStorage.getItem("paisa-commitments");
    return saved ? JSON.parse(saved) : SEED_COMMITMENTS;
  });
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("paisa-goals");
    return saved ? JSON.parse(saved) : SEED_GOALS;
  });
  const [investments, setInvestments] = useState<Investment[]>(() => {
    const saved = localStorage.getItem("paisa-investments");
    return saved ? JSON.parse(saved) : SEED_INVESTMENTS;
  });
  const [monthEndTasks, setMonthEndTasks] = useState<MonthEndTask[]>(() => {
    const saved = localStorage.getItem("paisa-tasks");
    return saved ? JSON.parse(saved) : SEED_TASKS;
  });

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("paisa-accounts", JSON.stringify(accounts));
    localStorage.setItem("paisa-transactions", JSON.stringify(transactions));
    localStorage.setItem("paisa-budgets", JSON.stringify(budgets));
    localStorage.setItem("paisa-commitments", JSON.stringify(commitments));
    localStorage.setItem("paisa-goals", JSON.stringify(goals));
    localStorage.setItem("paisa-investments", JSON.stringify(investments));
    localStorage.setItem("paisa-tasks", JSON.stringify(monthEndTasks));
  }, [
    accounts,
    transactions,
    budgets,
    commitments,
    goals,
    investments,
    monthEndTasks,
  ]);

  // Modals State
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCommitmentModalOpen, setIsCommitmentModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isInvModalOpen, setIsInvModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const [editingTx, setEditingTx] = useState<Transaction | undefined>(
    undefined,
  );
  const [editingAcc, setEditingAcc] = useState<Account | undefined>(undefined);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>(
    undefined,
  );
  const [editingCommitment, setEditingCommitment] = useState<
    Commitment | undefined
  >(undefined);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [editingInv, setEditingInv] = useState<Investment | undefined>(
    undefined,
  );
  const [editingTask, setEditingTask] = useState<MonthEndTask | undefined>(
    undefined,
  );

  // Forms State
  const [txForm, setTxForm] = useState<Partial<Transaction>>({
    type: "EXPENSE",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
  });
  const [accForm, setAccForm] = useState<Partial<Account>>({
    type: "BANK",
    color: "#1d4ed8",
    icon: "Landmark",
  });
  const [budgetForm, setBudgetForm] = useState<Partial<Budget>>({
    color: "#3b82f6",
    icon: "Wallet",
    month: currentMonth,
  });
  const [commitmentForm, setCommitmentForm] = useState<Partial<Commitment>>({
    date: new Date().toISOString().split("T")[0],
    sourceId: "",
  });
  const [goalForm, setGoalForm] = useState<Partial<Goal>>({});
  const [invForm, setInvForm] = useState<Partial<Investment>>({
    treatAsExpense: false,
    type: "MF",
    frequency: "Monthly",
  });
  const [taskForm, setTaskForm] = useState<Partial<MonthEndTask>>({ text: "" });

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  // --- Core Accounting Engine ---
  const applyTransactionToAccounts = (
    t: Partial<Transaction>,
    revert = false,
  ) => {
    const multiplier = revert ? -1 : 1;
    setAccounts((prev) =>
      prev.map((a) => {
        let newBalance = a.balance;
        if (t.type === "INCOME" && a.id === t.sourceId)
          newBalance += (t.amount || 0) * multiplier;
        if (t.type === "EXPENSE" && a.id === t.sourceId)
          newBalance -= (t.amount || 0) * multiplier;
        if (t.type === "TRANSFER") {
          if (a.id === t.sourceId) newBalance -= (t.amount || 0) * multiplier;
          if (a.id === t.destId) newBalance += (t.amount || 0) * multiplier;
        }
        return { ...a, balance: newBalance };
      }),
    );
  };

  const applyTransactionToInvestments = (
    t: Partial<Transaction>,
    revert = false,
  ) => {
    if (t.type === "TRANSFER" && t.destId) {
      const multiplier = revert ? -1 : 1;
      setInvestments((prev) =>
        prev.map((inv) => {
          if (inv.id === t.destId) {
            return {
              ...inv,
              totalInvested:
                (inv.totalInvested || 0) + (t.amount || 0) * multiplier,
              currentValue:
                (inv.currentValue || 0) + (t.amount || 0) * multiplier,
            };
          }
          return inv;
        }),
      );
    }
  };

  // Actions
  const addTransaction = (t: Omit<Transaction, "id">) => {
    const newTx = { ...t, id: Date.now().toString() };
    setTransactions((prev) => [newTx, ...prev]);
    applyTransactionToAccounts(newTx);
    applyTransactionToInvestments(newTx);
  };

  const updateTransaction = (id: string, newTx: Partial<Transaction>) => {
    const oldTx = transactions.find((t) => t.id === id);
    if (oldTx) {
      applyTransactionToAccounts(oldTx, true); // Revert old from balances
      applyTransactionToInvestments(oldTx, true); // Revert old from investments
    }

    const fullNewTx = { ...oldTx, ...newTx } as Transaction;
    setTransactions((prev) => prev.map((t) => (t.id === id ? fullNewTx : t)));

    applyTransactionToAccounts(fullNewTx); // Apply new to balances
    applyTransactionToInvestments(fullNewTx); // Apply new to investments
  };

  const deleteTransaction = (id: string) => {
    const oldTx = transactions.find((t) => t.id === id);
    if (oldTx) {
      applyTransactionToAccounts(oldTx, true); // Revert from balances
      applyTransactionToInvestments(oldTx, true); // Revert from investments
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const openTxModal = (tx?: Transaction) => {
    if (tx) {
      setEditingTx(tx);
      setTxForm(tx);
    } else {
      setEditingTx(undefined);
      setTxForm({
        type: "EXPENSE",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        sourceId: accounts[0]?.id,
      });
    }
    setIsTxModalOpen(true);
  };

  const handleSaveTx = () => {
    if (editingTx) {
      updateTransaction(editingTx.id, txForm as Partial<Transaction>);
    } else {
      if (txForm.amount && txForm.sourceId) {
        addTransaction(txForm as Omit<Transaction, "id">);
      }
    }
    setIsTxModalOpen(false);
  };

  const handleDeleteTx = () => {
    if (editingTx) {
      deleteTransaction(editingTx.id);
      setIsTxModalOpen(false);
    }
  };

  // --- Account Handlers ---
  const handleSaveAccount = () => {
    if (editingAcc) {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === editingAcc.id ? ({ ...a, ...accForm } as Account) : a,
        ),
      );
    } else {
      setAccounts((prev) => [
        ...prev,
        { ...accForm, id: Date.now().toString() } as Account,
      ]);
    }
    setIsAccModalOpen(false);
  };

  const handleDeleteAccount = () => {
    if (editingAcc) {
      setAccounts((prev) => prev.filter((a) => a.id !== editingAcc.id));
      setIsAccModalOpen(false);
    }
  };

  const openAccountModal = (acc?: Account) => {
    if (acc) {
      setEditingAcc(acc);
      setAccForm(acc);
    } else {
      setEditingAcc(undefined);
      setAccForm({
        name: "",
        type: "BANK",
        balance: 0,
        purpose: "",
        color: "#3b82f6",
        icon: "Landmark",
      });
    }
    setIsAccModalOpen(true);
  };

  // --- Budget Handlers ---
  const handleSaveBudget = () => {
    if (editingBudget) {
      setBudgets((prev) =>
        prev.map((b) =>
          b.id === editingBudget.id ? ({ ...b, ...budgetForm } as Budget) : b,
        ),
      );
    } else {
      setBudgets((prev) => [
        ...prev,
        { ...budgetForm, id: Date.now().toString() } as Budget,
      ]);
    }
    setIsBudgetModalOpen(false);
  };

  const handleDeleteBudget = () => {
    if (editingBudget) {
      setBudgets((prev) => prev.filter((b) => b.id !== editingBudget.id));
      setIsBudgetModalOpen(false);
    }
  };

  const openBudgetModal = (b?: Budget) => {
    if (b) {
      setEditingBudget(b);
      setBudgetForm(b);
    } else {
      setEditingBudget(undefined);
      setBudgetForm({
        category: "",
        limit: 0,
        color: "#10b981",
        icon: "Wallet",
        month: currentMonth,
      });
    }
    setIsBudgetModalOpen(true);
  };

  const copyBudgets = (fromMonth: string, toMonth: string) => {
    const prevBudgets = budgets.filter((b) => b.month === fromMonth);
    if (prevBudgets.length === 0) {
      alert(`No budgets found in ${fromMonth} to copy.`);
      return;
    }

    const newBudgets = prevBudgets.map((b) => ({
      ...b,
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      month: toMonth,
    }));

    setBudgets((prev) => [
      ...prev.filter((b) => b.month !== toMonth),
      ...newBudgets,
    ]);
  };

  // --- Commitment Handlers ---
  const handleSaveCommitment = () => {
    if (editingCommitment) {
      setCommitments((prev) =>
        prev.map((c) =>
          c.id === editingCommitment.id
            ? ({ ...c, ...commitmentForm } as Commitment)
            : c,
        ),
      );
    } else {
      setCommitments((prev) => [
        ...prev,
        {
          ...commitmentForm,
          id: Date.now().toString(),
          isPaid: false,
        } as Commitment,
      ]);
    }
    setIsCommitmentModalOpen(false);
  };

  const handleDeleteCommitment = () => {
    if (editingCommitment) {
      setCommitments((prev) =>
        prev.filter((c) => c.id !== editingCommitment.id),
      );
      setIsCommitmentModalOpen(false);
    }
  };

  const openCommitmentModal = (c?: Commitment) => {
    if (c) {
      setEditingCommitment(c);

      // Auto-fix for any old saved commitments that used string text instead of IDs
      let safeSourceId = c.sourceId;
      if (!safeSourceId && (c as any).source) {
        const matched = accounts.find((a) =>
          (c as any).source.toLowerCase().includes(a.name.toLowerCase()),
        );
        if (matched) safeSourceId = matched.id;
      }

      setCommitmentForm({ ...c, sourceId: safeSourceId });
    } else {
      setEditingCommitment(undefined);
      setCommitmentForm({
        title: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        sourceId: accounts[0]?.id,
        destId: "",
        linkedBudgetId: "",
      });
    }
    setIsCommitmentModalOpen(true);
  };

  const markCommitmentPaid = (id: string) => {
    const c = commitments.find((x) => x.id === id);
    if (!c) return;

    // 1. Mark as paid
    setCommitments((prev) =>
      prev.map((x) => (x.id === id ? { ...x, isPaid: true } : x)),
    );

    // 2. Determine best source account mapping (handles older text-based sources smoothly)
    let sourceId = c.sourceId;
    if (!sourceId && (c as any).source) {
      const matchedAcc = accounts.find((a) =>
        (c as any).source.toLowerCase().includes(a.name.toLowerCase()),
      );
      sourceId = matchedAcc ? matchedAcc.id : accounts[0]?.id || "";
    } else if (!sourceId) {
      sourceId = accounts[0]?.id || "";
    }

    // 3. Auto-generate Transaction (The engine will handle deducting the account balance automatically)
    const linkedBudget = budgets.find((b) => b.id === c.linkedBudgetId);

    // Evaluate if destId maps to an investment or an account
    const isDestAccount = accounts.some((a) => a.id === c.destId);
    const isDestInvestment = investments.some((i) => i.id === c.destId);
    const isTransfer = isDestAccount || isDestInvestment;

    const category = linkedBudget
      ? linkedBudget.category
      : isTransfer
        ? "Investment / Transfer"
        : "Commitment";

    addTransaction({
      date: c.date,
      amount: c.amount,
      type: isTransfer ? "TRANSFER" : "EXPENSE",
      sourceId,
      destId: c.destId,
      category,
      note: c.title,
    });
  };

  // --- Goal Handlers ---
  const handleSaveGoal = () => {
    if (editingGoal) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === editingGoal.id ? ({ ...g, ...goalForm } as Goal) : g,
        ),
      );
    } else {
      setGoals((prev) => [
        ...prev,
        { ...goalForm, id: Date.now().toString() } as Goal,
      ]);
    }
    setIsGoalModalOpen(false);
  };

  const handleDeleteGoal = () => {
    if (editingGoal) {
      setGoals((prev) => prev.filter((g) => g.id !== editingGoal.id));
      setIsGoalModalOpen(false);
    }
  };

  const openGoalModal = (g?: Goal) => {
    if (g) {
      setEditingGoal(g);
      setGoalForm(g);
    } else {
      setEditingGoal(undefined);
      setGoalForm({
        name: "",
        target: 0,
        current: 0,
        deadline: new Date().toISOString().split("T")[0],
        accountId: accounts[0]?.id,
      });
    }
    setIsGoalModalOpen(true);
  };

  // --- Investment Handlers ---
  const handleSaveInvestment = () => {
    if (editingInv) {
      setInvestments((prev) =>
        prev.map((i) =>
          i.id === editingInv.id ? ({ ...i, ...invForm } as Investment) : i,
        ),
      );
    } else {
      setInvestments((prev) => [
        ...prev,
        { ...invForm, id: Date.now().toString() } as Investment,
      ]);
    }
    setIsInvModalOpen(false);
  };

  const handleDeleteInvestment = () => {
    if (editingInv) {
      setInvestments((prev) => prev.filter((i) => i.id !== editingInv.id));
      setIsInvModalOpen(false);
    }
  };

  const openInvestmentModal = (i?: Investment) => {
    if (i) {
      setEditingInv(i);
      setInvForm({ ...i, frequency: i.frequency || "Monthly" });
    } else {
      setEditingInv(undefined);
      setInvForm({
        name: "",
        type: "MF",
        monthlyContribution: 0,
        frequency: "Monthly",
        totalInvested: 0,
        currentValue: 0,
        treatAsExpense: false,
      });
    }
    setIsInvModalOpen(true);
  };

  // --- Task Handlers ---
  const handleSaveTask = () => {
    if (editingTask) {
      setMonthEndTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id ? ({ ...t, ...taskForm } as MonthEndTask) : t,
        ),
      );
    } else {
      setMonthEndTasks((prev) => [
        ...prev,
        {
          ...taskForm,
          id: Date.now().toString(),
          isCompleted: false,
        } as MonthEndTask,
      ]);
    }
    setIsTaskModalOpen(false);
  };

  const handleDeleteTask = () => {
    if (editingTask) {
      setMonthEndTasks((prev) => prev.filter((t) => t.id !== editingTask.id));
      setIsTaskModalOpen(false);
    }
  };

  const toggleMonthEndTask = (id: string) => {
    setMonthEndTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, isCompleted: !t.isCompleted } : t,
      ),
    );
  };

  const openTaskModal = (t?: MonthEndTask) => {
    if (t) {
      setEditingTask(t);
      setTaskForm({ text: t.text });
    } else {
      setEditingTask(undefined);
      setTaskForm({ text: "" });
    }
    setIsTaskModalOpen(true);
  };

  const appState: AppState = {
    isDarkMode,
    toggleTheme: () => setIsDarkMode(!isDarkMode),
    activeTab,
    setActiveTab,
    currentMonth,
    setCurrentMonth,
    accounts,
    transactions,
    budgets,
    commitments,
    goals,
    investments,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    openTxModal,
    addAccount: (a) =>
      setAccounts((prev) => [...prev, { ...a, id: Date.now().toString() }]),
    updateAccount: (id, a) =>
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === id ? { ...acc, ...a } : acc)),
      ),
    deleteAccount: (id) =>
      setAccounts((prev) => prev.filter((a) => a.id !== id)),
    openAccountModal,
    addBudget: (b) =>
      setBudgets((prev) => [...prev, { ...b, id: Date.now().toString() }]),
    updateBudget: (id, b) =>
      setBudgets((prev) => prev.map((x) => (x.id === id ? { ...x, ...b } : x))),
    deleteBudget: (id) => setBudgets((prev) => prev.filter((x) => x.id !== id)),
    copyBudgets,
    openBudgetModal,
    addCommitment: (c) =>
      setCommitments((prev) => [...prev, { ...c, id: Date.now().toString() }]),
    updateCommitment: (id, c) =>
      setCommitments((prev) =>
        prev.map((x) => (x.id === id ? { ...x, ...c } : x)),
      ),
    deleteCommitment: (id) =>
      setCommitments((prev) => prev.filter((x) => x.id !== id)),
    openCommitmentModal,
    markCommitmentPaid,
    addGoal: (g) =>
      setGoals((prev) => [...prev, { ...g, id: Date.now().toString() }]),
    updateGoal: (id, g) =>
      setGoals((prev) => prev.map((x) => (x.id === id ? { ...x, ...g } : x))),
    deleteGoal: (id) => setGoals((prev) => prev.filter((x) => x.id !== id)),
    openGoalModal,
    addInvestment: (i) =>
      setInvestments((prev) => [...prev, { ...i, id: Date.now().toString() }]),
    updateInvestment: (id, i) =>
      setInvestments((prev) =>
        prev.map((x) => (x.id === id ? { ...x, ...i } : x)),
      ),
    deleteInvestment: (id) =>
      setInvestments((prev) => prev.filter((x) => x.id !== id)),
    openInvestmentModal,
    monthEndTasks,
    addMonthEndTask: (t) =>
      setMonthEndTasks((prev) => [
        ...prev,
        { ...t, id: Date.now().toString(), isCompleted: false },
      ]),
    updateMonthEndTask: (id, t) =>
      setMonthEndTasks((prev) =>
        prev.map((x) => (x.id === id ? { ...x, ...t } : x)),
      ),
    deleteMonthEndTask: (id) =>
      setMonthEndTasks((prev) => prev.filter((x) => x.id !== id)),
    toggleMonthEndTask,
    openTaskModal,
  };

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "accounts", icon: Wallet, label: "Accounts" },
    { id: "budget", icon: PieChartIcon, label: "Budget" },
    { id: "investments", icon: Target, label: "Wealth" },
    { id: "monthend", icon: CheckSquare, label: "Month End" },
  ];

  return (
    <AppContext.Provider value={appState}>
      <div
        className={`min-h-screen ${isDarkMode ? "dark" : ""} bg-slate-50 dark:bg-[#0B1120] font-sans selection:bg-indigo-500/30 text-slate-900 dark:text-slate-100 transition-colors duration-300`}
      >
        {/* Sidebar Nav */}
        <nav className="fixed bottom-0 w-full md:w-64 md:h-screen bg-white dark:bg-slate-900 border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-800 z-50 flex md:flex-col justify-around md:justify-start px-2 py-3 md:p-6 transition-colors duration-300">
          <div className="hidden md:flex items-center gap-3 mb-10 text-indigo-600 dark:text-indigo-400">
            <Landmark size={28} className="shrink-0" />
            <h1 className="text-xl font-bold tracking-tight">PaisaWeb</h1>
          </div>

          <div className="flex md:flex-col w-full gap-2 md:gap-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-xl transition-all duration-200 flex-1 md:flex-none ${
                  activeTab === item.id
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <item.icon
                  size={20}
                  className={
                    activeTab === item.id ? "opacity-100" : "opacity-70"
                  }
                />
                <span className="text-[10px] md:text-sm">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="hidden md:block mt-auto pb-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span className="text-sm">
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile Header */}
        <header className="md:hidden flex justify-between items-center p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Landmark size={24} />
            <h1 className="font-bold">PaisaWeb</h1>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-slate-500 rounded-full bg-slate-100 dark:bg-slate-800"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        {/* Main Content Area */}
        <main className="md:ml-64 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto min-h-screen">
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "accounts" && <AccountsView />}
          {activeTab === "budget" && <BudgetView />}
          {activeTab === "investments" && <InvestmentsView />}
          {activeTab === "monthend" && <MonthEndView />}
          {activeTab === "all_commitments" && <AllCommitmentsView />}
          {activeTab === "all_transactions" && <AllTransactionsView />}
        </main>

        {/* Floating Action Button (FAB) */}
        <button
          onClick={() => openTxModal()}
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-transform hover:scale-105 z-50"
        >
          <Plus size={24} />
        </button>

        {/* Transaction Modal */}
        <Modal
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          title={editingTx ? "Edit Transaction" : "New Transaction"}
        >
          <div className="space-y-4">
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              {(["EXPENSE", "INCOME", "TRANSFER"] as TransactionType[]).map(
                (t) => (
                  <button
                    key={t}
                    onClick={() => setTxForm((prev) => ({ ...prev, type: t }))}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      txForm.type === t
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </button>
                ),
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                value={txForm.amount || ""}
                onChange={(e) =>
                  setTxForm((prev) => ({
                    ...prev,
                    amount: Number(e.target.value),
                  }))
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  From Account
                </label>
                <select
                  value={txForm.sourceId || ""}
                  onChange={(e) =>
                    setTxForm((prev) => ({ ...prev, sourceId: e.target.value }))
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                >
                  <option value="" disabled>
                    Select...
                  </option>
                  <optgroup label="Accounts">
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {txForm.type === "TRANSFER" ? (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    To Destination
                  </label>
                  <select
                    value={txForm.destId || ""}
                    onChange={(e) =>
                      setTxForm((prev) => ({ ...prev, destId: e.target.value }))
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  >
                    <option value="" disabled>
                      Select...
                    </option>
                    <optgroup label="Accounts">
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Investments & Portfolios">
                      {investments.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Category
                  </label>
                  <select
                    value={txForm.category || ""}
                    onChange={(e) =>
                      setTxForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  >
                    <option value="" disabled>
                      Select...
                    </option>
                    {budgets.map((b) => (
                      <option key={b.category} value={b.category}>
                        {b.category}
                      </option>
                    ))}
                    <option value="Salary">Salary</option>
                    <option value="Commitment">Commitment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Date
              </label>
              <input
                type="date"
                value={txForm.date || ""}
                onChange={(e) =>
                  setTxForm((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Note / Merchant
              </label>
              <input
                type="text"
                value={txForm.note || ""}
                onChange={(e) =>
                  setTxForm((prev) => ({ ...prev, note: e.target.value }))
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                placeholder="What was this for?"
              />
            </div>

            <div className="flex gap-3 pt-2">
              {editingTx && (
                <button
                  onClick={handleDeleteTx}
                  className="px-4 py-2 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg font-medium hover:bg-rose-200 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={16} />{" "}
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}
              <button
                onClick={handleSaveTx}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Transaction
              </button>
            </div>
          </div>
        </Modal>

        {/* Commitment Modal */}
        <Modal
          isOpen={isCommitmentModalOpen}
          onClose={() => setIsCommitmentModalOpen(false)}
          title={editingCommitment ? "Edit Commitment" : "New Commitment"}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Commitment Title
              </label>
              <input
                type="text"
                value={commitmentForm.title || ""}
                onChange={(e) =>
                  setCommitmentForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                placeholder="e.g. LIC Premium (QTR)"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={commitmentForm.amount || ""}
                  onChange={(e) =>
                    setCommitmentForm((prev) => ({
                      ...prev,
                      amount: Number(e.target.value),
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={commitmentForm.date || ""}
                  onChange={(e) =>
                    setCommitmentForm((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Source Account
              </label>
              <select
                value={commitmentForm.sourceId || ""}
                onChange={(e) =>
                  setCommitmentForm((prev) => ({
                    ...prev,
                    sourceId: e.target.value,
                  }))
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              >
                <option value="" disabled>
                  Select Source...
                </option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Destination (If Transfer/Investment)
              </label>
              <select
                value={commitmentForm.destId || ""}
                onChange={(e) =>
                  setCommitmentForm((prev) => ({
                    ...prev,
                    destId: e.target.value,
                  }))
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              >
                <option value="">-- None (Treat as Expense) --</option>
                <optgroup label="Accounts">
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Investments & Portfolios">
                  {investments.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Link to Budget Category (Optional)
              </label>
              <select
                value={commitmentForm.linkedBudgetId || ""}
                onChange={(e) =>
                  setCommitmentForm((prev) => ({
                    ...prev,
                    linkedBudgetId: e.target.value,
                  }))
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              >
                <option value="">-- No link --</option>
                {budgets
                  .filter((b) => b.month === currentMonth)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.category}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              {editingCommitment && (
                <button
                  onClick={handleDeleteCommitment}
                  className="px-4 py-2 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg font-medium hover:bg-rose-200 transition-colors"
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleSaveCommitment}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Commitment
              </button>
            </div>
          </div>
        </Modal>

        {/* Account Modal */}
        <Modal
          isOpen={isAccModalOpen}
          onClose={() => setIsAccModalOpen(false)}
          title={editingAcc ? "Edit Account" : "Add Account"}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Account Name
              </label>
              <input
                type="text"
                value={accForm.name || ""}
                onChange={(e) =>
                  setAccForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                placeholder="e.g. Secret Stash"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Type
                </label>
                <select
                  value={accForm.type || "BANK"}
                  onChange={(e) =>
                    setAccForm((prev) => ({
                      ...prev,
                      type: e.target.value as AccountType,
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                >
                  <option value="BANK">Bank Account</option>
                  <option value="CASH_WALLET">Physical Wallet</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Current Balance
                </label>
                <input
                  type="number"
                  value={accForm.balance || ""}
                  onChange={(e) =>
                    setAccForm((prev) => ({
                      ...prev,
                      balance: Number(e.target.value),
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {accForm.type === "CREDIT_CARD" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Bank Limit
                  </label>
                  <input
                    type="number"
                    value={accForm.bankLimit || ""}
                    onChange={(e) =>
                      setAccForm((prev) => ({
                        ...prev,
                        bankLimit: Number(e.target.value),
                      }))
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Self Limit
                  </label>
                  <input
                    type="number"
                    value={accForm.selfLimit || ""}
                    onChange={(e) =>
                      setAccForm((prev) => ({
                        ...prev,
                        selfLimit: Number(e.target.value),
                      }))
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Purpose / Note
              </label>
              <input
                type="text"
                value={accForm.purpose || ""}
                onChange={(e) =>
                  setAccForm((prev) => ({ ...prev, purpose: e.target.value }))
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                placeholder="What is this money for?"
              />
            </div>

            <div className="flex gap-3 pt-2">
              {editingAcc && (
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg font-medium hover:bg-rose-200 transition-colors"
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleSaveAccount}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Account
              </button>
            </div>
          </div>
        </Modal>

        {/* Budget Modal */}
        <Modal
          isOpen={isBudgetModalOpen}
          onClose={() => setIsBudgetModalOpen(false)}
          title={editingBudget ? "Edit Budget" : "New Budget"}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Target Month
                </label>
                <input
                  type="month"
                  value={budgetForm.month || ""}
                  onChange={(e) =>
                    setBudgetForm((prev) => ({
                      ...prev,
                      month: e.target.value,
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Monthly Limit (₹)
                </label>
                <input
                  type="number"
                  value={budgetForm.limit || ""}
                  onChange={(e) =>
                    setBudgetForm((prev) => ({
                      ...prev,
                      limit: Number(e.target.value),
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={budgetForm.category || ""}
                onChange={(e) =>
                  setBudgetForm((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                placeholder="e.g. Dining Out"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={budgetForm.color || "#3b82f6"}
                  onChange={(e) =>
                    setBudgetForm((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }))
                  }
                  className="w-full h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Icon
                </label>
                <select
                  value={budgetForm.icon || "Wallet"}
                  onChange={(e) =>
                    setBudgetForm((prev) => ({ ...prev, icon: e.target.value }))
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                >
                  <option value="Wallet">Wallet</option>
                  <option value="Car">Car</option>
                  <option value="Coffee">Coffee</option>
                  <option value="ShoppingCart">Shopping Cart</option>
                  <option value="Zap">Zap / Utility</option>
                  <option value="Heart">Heart / Family</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              {editingBudget && (
                <button
                  onClick={handleDeleteBudget}
                  className="px-4 py-2 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg font-medium hover:bg-rose-200 transition-colors"
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleSaveBudget}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Budget
              </button>
            </div>
          </div>
        </Modal>

        {/* Goal Modal */}
        <Modal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          title={editingGoal ? "Edit Goal" : "New Goal"}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Goal Name
              </label>
              <input
                type="text"
                value={goalForm.name || ""}
                onChange={(e) =>
                  setGoalForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                placeholder="e.g. Vacation"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Target Amount (₹)
                </label>
                <input
                  type="number"
                  value={goalForm.target || ""}
                  onChange={(e) =>
                    setGoalForm((prev) => ({
                      ...prev,
                      target: Number(e.target.value),
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Current Saved (₹)
                </label>
                <input
                  type="number"
                  value={goalForm.current || ""}
                  onChange={(e) =>
                    setGoalForm((prev) => ({
                      ...prev,
                      current: Number(e.target.value),
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={goalForm.deadline || ""}
                onChange={(e) =>
                  setGoalForm((prev) => ({ ...prev, deadline: e.target.value }))
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Linked Account
              </label>
              <select
                value={goalForm.accountId || ""}
                onChange={(e) =>
                  setGoalForm((prev) => ({
                    ...prev,
                    accountId: e.target.value,
                  }))
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              >
                <option value="" disabled>
                  Select...
                </option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              {editingGoal && (
                <button
                  onClick={handleDeleteGoal}
                  className="px-4 py-2 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg font-medium hover:bg-rose-200 transition-colors"
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleSaveGoal}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Goal
              </button>
            </div>
          </div>
        </Modal>

        {/* Investment Modal */}
        <Modal
          isOpen={isInvModalOpen}
          onClose={() => setIsInvModalOpen(false)}
          title={editingInv ? "Edit Investment" : "New Investment"}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Investment Name
              </label>
              <input
                type="text"
                value={invForm.name || ""}
                onChange={(e) =>
                  setInvForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                placeholder="e.g. Parag Parikh Flexi Cap"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Type
                </label>
                <select
                  value={invForm.type || "MF"}
                  onChange={(e) =>
                    setInvForm((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                >
                  <option value="MF">Mutual Fund</option>
                  <option value="PPF">PPF</option>
                  <option value="LIC">LIC / Insurance</option>
                  <option value="FD">Fixed Deposit</option>
                  <option value="STOCK">Stocks</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Contribution Frequency
                </label>
                <select
                  value={invForm.frequency || "Monthly"}
                  onChange={(e) =>
                    setInvForm((prev) => ({
                      ...prev,
                      frequency: e.target.value,
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Contribution Amount (₹)
                </label>
                <input
                  type="number"
                  value={invForm.monthlyContribution || ""}
                  onChange={(e) =>
                    setInvForm((prev) => ({
                      ...prev,
                      monthlyContribution: Number(e.target.value),
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Total Invested (₹)
                </label>
                <input
                  type="number"
                  value={invForm.totalInvested || ""}
                  onChange={(e) =>
                    setInvForm((prev) => ({
                      ...prev,
                      totalInvested: Number(e.target.value),
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Current Value (₹)
              </label>
              <input
                type="number"
                value={invForm.currentValue || ""}
                onChange={(e) =>
                  setInvForm((prev) => ({
                    ...prev,
                    currentValue: Number(e.target.value),
                  }))
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="treatAsExpense"
                checked={invForm.treatAsExpense || false}
                onChange={(e) =>
                  setInvForm((prev) => ({
                    ...prev,
                    treatAsExpense: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <label
                htmlFor="treatAsExpense"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Treat contribution as an Expense in Budgets
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              {editingInv && (
                <button
                  onClick={handleDeleteInvestment}
                  className="px-4 py-2 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg font-medium hover:bg-rose-200 transition-colors"
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleSaveInvestment}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Investment
              </button>
            </div>
          </div>
        </Modal>

        {/* Task Modal */}
        <Modal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          title={editingTask ? "Edit Task" : "New Task"}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Task Description
              </label>
              <textarea
                rows={3}
                value={taskForm.text || ""}
                onChange={(e) =>
                  setTaskForm((prev) => ({ ...prev, text: e.target.value }))
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500 resize-none"
                placeholder="e.g. Move remaining balance to SBI"
              />
            </div>

            <div className="flex gap-3 pt-2">
              {editingTask && (
                <button
                  onClick={handleDeleteTask}
                  className="px-4 py-2 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg font-medium hover:bg-rose-200 transition-colors"
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleSaveTask}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Task
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppContext.Provider>
  );
}
