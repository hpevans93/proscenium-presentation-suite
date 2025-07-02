import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Settings,
  BarChart3,
  Coffee,
  MessageSquare,
  CheckCircle,
  Edit,
  User,
  Shield,
} from "lucide-react";

// Mock data for projects, drinks, questions and users
const mockProjects = [
  {
    id: "proj_1",
    name: "Summer Festival 2025",
    isEnabled: true,
    mode: "quiz",
    branding: {
      logo: "https://via.placeholder.com/150x50/ffffff/3B82F6?text=Summer+Fest",
      backgroundColor: "#3B82F6",
      backgroundGradient:
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      backgroundType: "gradient",
      accentColor: "#FFD700",
      welcomeTitle: "Find Your Perfect Drink!",
      welcomeSubtitle: "Answer a few questions to discover your ideal beverage match.",
      thankYouMessage: "Thanks for your order! Please wait at the bar.",
    },
  },
];

const mockDrinks = [
  {
    id: "drink_1",
    projectId: "proj_1",
    name: "Margarita",
    description: "Perfect balance of tequila, lime and triple sec.",
    imageUrl: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=400&fit=crop",
    category: "Tequila Cocktails",
    isActive: true,
  },
  {
    id: "drink_2",
    projectId: "proj_1",
    name: "Old Fashioned",
    description: "Classic whiskey cocktail with bitters and sugar.",
    imageUrl: "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=400&h=400&fit=crop",
    category: "Whiskey Cocktails",
    isActive: true,
  },
];

const mockQuestions = [
  {
    id: "q1",
    projectId: "proj_1",
    text: "Which type of spirit do you prefer?",
    type: "single",
    answers: [
      { id: "a1", text: "Tequila cocktails", mappedDrinks: ["drink_1"], isAbsolute: true },
      { id: "a2", text: "Whiskey cocktails", mappedDrinks: ["drink_2"], isAbsolute: true },
    ],
    order: 1,
  },
];

const mockUsers = [
  { id: "user_1", email: "admin@summerfest.com", role: "admin", projectId: "proj_1" },
];

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState("guest");
  const [currentProject, setCurrentProject] = useState("proj_1");
  const [guestFlow, setGuestFlow] = useState({ step: "welcome", answers: [], currentQuestion: 0, guestName: "", selectedDrink: null });
  const [orders, setOrders] = useState([]);

  const addOrder = (order) => {
    const newOrder = { id: `order_${Date.now()}`, projectId: currentProject, status: "pending", timestamp: new Date().toISOString(), ...order };
    setOrders((prev) => [newOrder, ...prev]);
  };

  const value = {
    currentView,
    setCurrentView,
    currentProject,
    setCurrentProject,
    guestFlow,
    setGuestFlow,
    projects: mockProjects,
    drinks: mockDrinks,
    questions: mockQuestions,
    users: mockUsers,
    orders,
    addOrder,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

const Welcome = () => {
  const { projects, guestFlow, setGuestFlow } = useApp();
  const project = projects.find((p) => p.id === "proj_1");

  const start = () => setGuestFlow({ ...guestFlow, step: project.mode });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white" style={{ background: project.branding.backgroundGradient }}>
      {project.branding.logo && <img src={project.branding.logo} alt="Logo" className="h-20 mb-6" />}
      <h1 className="text-4xl font-bold mb-2">{project.branding.welcomeTitle}</h1>
      <p className="mb-6 opacity-90">{project.branding.welcomeSubtitle}</p>
      <button onClick={start} className="px-6 py-3 rounded text-white" style={{ backgroundColor: project.branding.accentColor }}>
        Get Started
      </button>
    </div>
  );
};

const Quiz = () => {
  const { questions, guestFlow, setGuestFlow, drinks } = useApp();
  const q = questions[guestFlow.currentQuestion];
  const next = (answer) => {
    const answers = [...guestFlow.answers, answer];
    if (guestFlow.currentQuestion < questions.length - 1) {
      setGuestFlow({ ...guestFlow, answers, currentQuestion: guestFlow.currentQuestion + 1 });
    } else {
      const drink = drinks.find((d) => answer.mappedDrinks.includes(d.id));
      setGuestFlow({ ...guestFlow, answers, step: "result", selectedDrink: drink });
    }
  };
  return (
    <div className="min-h-screen p-6" style={{ background: mockProjects[0].branding.backgroundGradient }}>
      <h2 className="text-xl mb-4 text-white">{q.text}</h2>
      <div className="space-y-3">
        {q.answers.map((a) => (
          <button key={a.id} onClick={() => next(a)} className="w-full p-4 bg-white rounded" >{a.text}</button>
        ))}
      </div>
    </div>
  );
};

const Menu = () => {
  const { drinks, guestFlow, setGuestFlow } = useApp();
  const select = (drink) => setGuestFlow({ ...guestFlow, step: "result", selectedDrink: drink });
  return (
    <div className="min-h-screen p-6" style={{ background: mockProjects[0].branding.backgroundGradient }}>
      {drinks.map((d) => (
        <div key={d.id} className="p-4 bg-white rounded mb-3" onClick={() => select(d)}>
          <h3 className="font-semibold">{d.name}</h3>
          <p className="text-sm text-gray-600">{d.description}</p>
        </div>
      ))}
    </div>
  );
};

const Result = () => {
  const { guestFlow, setGuestFlow, addOrder } = useApp();
  const [name, setName] = useState("");
  const drink = guestFlow.selectedDrink;
  if (!drink) return null;
  const order = () => {
    addOrder({ guestName: name, drinkId: drink.id, drinkName: drink.name });
    setGuestFlow({ step: "thanks", answers: [], currentQuestion: 0, guestName: name, selectedDrink: drink });
  };
  return (
    <div className="min-h-screen p-6" style={{ background: mockProjects[0].branding.backgroundGradient }}>
      <h2 className="text-2xl font-bold text-white mb-6">Your Perfect Match</h2>
      <div className="bg-white rounded p-4 mb-4">
        <h3 className="font-semibold mb-2">{drink.name}</h3>
        <p>{drink.description}</p>
      </div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="border p-2 rounded w-full mb-4" />
      <button onClick={order} disabled={!name.trim()} className="px-4 py-2 text-white rounded" style={{ backgroundColor: mockProjects[0].branding.accentColor }}>Place Order</button>
    </div>
  );
};

const Thanks = () => {
  const { guestFlow, setGuestFlow } = useApp();
  const project = mockProjects[0];
  const again = () => setGuestFlow({ step: "welcome", answers: [], currentQuestion: 0, guestName: "", selectedDrink: null });
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white" style={{ background: project.branding.backgroundGradient }}>
      <CheckCircle className="w-12 h-12 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
      <p className="mb-4">Thanks, {guestFlow.guestName}! {project.branding.thankYouMessage}</p>
      <button onClick={again} className="px-4 py-2 rounded" style={{ backgroundColor: project.branding.accentColor }}>Place Another Order</button>
    </div>
  );
};

const AdminLogin = () => {
  const { setCurrentView, users, setCurrentProject } = useApp();
  const [email, setEmail] = useState("");
  const login = () => {
    const user = users.find((u) => u.email === email);
    if (user) {
      setCurrentProject(user.projectId);
      setCurrentView("admin");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@summerfest.com" className="border p-2 rounded w-full mb-4" />
        <button onClick={login} className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
      </div>
    </div>
  );
};

const GeneralSettings = () => {
  const { projects, setCurrentView } = useApp();
  const project = projects[0];
  return (
    <div className="p-6 bg-white rounded shadow">
      <h3 className="text-xl font-semibold mb-4">{project.name}</h3>
      <button onClick={() => setCurrentView("guest")} className="text-blue-600 underline">View Guest Experience</button>
    </div>
  );
};

const AdminDashboard = () => {
  const { setCurrentView } = useApp();
  const [tab, setTab] = useState("general");
  const render = () => {
    switch (tab) {
      case "general":
        return <GeneralSettings />;
      default:
        return null;
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow p-4 flex items-center justify-between">
        <h1 className="font-semibold">Admin</h1>
        <button onClick={() => setCurrentView("guest")} className="text-blue-600">View Guest</button>
      </nav>
      <div className="p-6 flex space-x-6">
        <div className="w-64 space-y-2">
          <button onClick={() => setTab("general")} className={`w-full p-2 rounded ${tab === "general" ? "bg-blue-100" : "bg-white"}`}>General</button>
        </div>
        <div className="flex-1">{render()}</div>
      </div>
    </div>
  );
};

const Navigation = () => {
  const { setCurrentView } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-4 right-4 text-xs text-gray-400 underline">settings</button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full space-y-2">
            <button onClick={() => { setCurrentView("guest"); setOpen(false); }} className="w-full flex items-center space-x-2 p-2 rounded bg-gray-100"><User className="w-4 h-4" /><span>Guest Experience</span></button>
            <button onClick={() => { setCurrentView("admin-login"); setOpen(false); }} className="w-full flex items-center space-x-2 p-2 rounded bg-gray-100"><Settings className="w-4 h-4" /><span>Admin Portal</span></button>
            <button onClick={() => { setCurrentView("superadmin-login"); setOpen(false); }} className="w-full flex items-center space-x-2 p-2 rounded bg-gray-100"><Shield className="w-4 h-4" /><span>Super Admin</span></button>
            <button onClick={() => setOpen(false)} className="w-full p-2 text-sm">Close</button>
          </div>
        </div>
      )}
    </>
  );
};

const App = () => {
  const { currentView, guestFlow } = useApp();
  if (currentView === "admin-login") return <AdminLogin />;
  if (currentView === "admin") return <AdminDashboard />;
  switch (guestFlow.step) {
    case "welcome":
      return <Welcome />;
    case "quiz":
      return <Quiz />;
    case "menu":
      return <Menu />;
    case "result":
      return <Result />;
    case "thanks":
      return <Thanks />;
    default:
      return <Welcome />;
  }
};

export default function DrinkOrderingSystem() {
  return (
    <AppProvider>
      <App />
      <Navigation />
    </AppProvider>
  );
}
