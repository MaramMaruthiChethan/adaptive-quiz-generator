import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BrainCircuit, Home, LogOut, Shield, Upload } from "lucide-react";
import { clearSession, getStoredUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();
  const latestContentId = localStorage.getItem("aqg_latest_content_id");

  const navLinks = user
    ? [
        { to: "/dashboard", label: "Dashboard", icon: Home },
        { to: "/upload", label: "Upload", icon: Upload },
        ...(latestContentId ? [{ to: `/quiz/${latestContentId}`, label: "Quiz", icon: BrainCircuit }] : []),
      ]
    : [];

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          {location.pathname !== "/" && (
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
          )}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary p-2 text-white shadow-glow">
              <BrainCircuit size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-primary/70">ADAPTIVE QUIZ</p>
              <p className="text-lg font-semibold">Question Generator</p>
            </div>
          </Link>
          {user && (
            <nav className="hidden items-center gap-2 md:flex">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}>
                  <Button variant={location.pathname === to ? "default" : "ghost"} size="sm">
                    <Icon size={15} className="mr-2" />
                    {label}
                  </Button>
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/profile" className="text-sm font-medium text-slate-600">
                {user.name}
              </Link>
              {user.role === "admin" && (
                <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                  <Shield size={16} />
                  Admin
                </Link>
              )}
              <Button
                variant="ghost"
                onClick={() => {
                  clearSession();
                  navigate("/login");
                }}
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
