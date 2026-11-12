import { ShoppingCart, ShieldAlert, LogOut, User, Menu, X, Search } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/UserSlice";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { user } = useSelector(store => store.user);
  const { cartItems } = useSelector(store => store.cart);
  const accessToken = localStorage.getItem("accessToken");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logoutHandler = async () => {
    try {
      const res = await api.post(`/user/logout`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (res.data.success || res.status === 200) {
        dispatch(setUser(null));
        localStorage.removeItem("accessToken");
        toast.success(res.data.message || "Logged out successfully");
        navigate('/');
      }
    } catch (error) {
      console.log(error.response?.data);
      toast.error(error.response?.data?.message || "Failed to log out");
      dispatch(setUser(null));
      localStorage.removeItem("accessToken");
      navigate('/');
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/products" },
    { name: "Categories", path: "/products" },
    { name: "Deals", path: "/deals" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" }
  ];

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-xs border-b border-slate-100 dark:border-slate-800 py-3" 
          : "bg-white dark:bg-slate-950 border-b border-slate-100/80 dark:border-slate-900 py-3.5"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-8">
        
        {/* Logo - Matching flyer branding */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-950 p-1 border border-purple-500/30 group-hover:border-purple-500/70 shadow-md shadow-purple-500/15 overflow-hidden group-hover:scale-105 transition-all duration-300">
            <img
              src="/favicon.svg"
              alt="AURA"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xl font-black tracking-[0.16em] bg-gradient-to-r from-slate-900 via-purple-900 to-purple-600 dark:from-white dark:via-slate-100 dark:to-purple-400 bg-clip-text text-transparent group-hover:to-indigo-500 transition-all duration-300 leading-none">
              AURA
            </span>
            <span className="text-[8px] font-bold tracking-tight text-slate-400 dark:text-slate-500 mt-0.5">
              Shop Smarter. Live Better.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center">
          <ul className="flex gap-7 items-center text-sm font-semibold text-slate-600 dark:text-slate-300">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path && (link.name !== "Categories" || location.search);
              return (
                <li key={link.name} className="relative py-1">
                  <Link 
                    to={link.path} 
                    className={`hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 text-[13px] ${
                      isActive ? "text-purple-600 dark:text-purple-400 font-bold" : ""
                    }`}
                  >
                    {link.name}
                  </Link>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></span>
                  )}
                </li>
              );
            })}

            {user && user.role === "admin" && (
              <li>
                <Link 
                  to="/admin" 
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors flex items-center gap-1 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-full text-xs font-bold border border-purple-200/60"
                >
                  <ShieldAlert size={13} /> Admin
                </Link>
              </li>
            )}
          </ul>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

          {/* Right Action Icons matching flyer mockup */}
          <div className="flex items-center gap-4">
            {/* Search Icon */}
            <Link 
              to="/products"
              title="Search Products"
              className="text-slate-600 dark:text-slate-400 hover:text-purple-600 transition-colors p-2 hover:bg-purple-50 dark:hover:bg-slate-900 rounded-xl"
            >
              <Search size={18} />
            </Link>

            {/* Profile / Account Icon */}
            <Link 
              to={user ? "/profile" : "/login"}
              title={user ? `Profile (${user.firstName})` : "Login"}
              className="text-slate-600 dark:text-slate-400 hover:text-purple-600 transition-colors p-2 hover:bg-purple-50 dark:hover:bg-slate-900 rounded-xl flex items-center gap-1"
            >
              <User size={18} />
              {user && <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden lg:inline">{user.firstName}</span>}
            </Link>

            {/* Cart Icon with badge */}
            <Link 
              to="/cart" 
              className="relative text-slate-700 dark:text-slate-300 hover:text-purple-600 transition-colors p-2 hover:bg-purple-50 dark:hover:bg-slate-900 rounded-xl"
            >
              <ShoppingCart size={19} />
              {cartCount > 0 && (
                <span className="bg-red-500 text-white rounded-full absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 flex items-center justify-center px-1 text-[10px] font-black border-2 border-white dark:border-slate-950">
                  {cartCount}
                </span>
              )}
            </Link>

            {user && (
              <Button 
                onClick={logoutHandler} 
                variant="ghost"
                size="sm"
                className="hover:text-red-600 text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs h-8 px-2.5 rounded-lg cursor-pointer"
              >
                <LogOut size={13} />
              </Button>
            )}
          </div>
        </nav>

        {/* Mobile menu toggle & Cart */}
        <div className="flex items-center gap-2 md:hidden">
          <Link 
            to="/products"
            className="text-slate-700 dark:text-slate-300 p-2"
          >
            <Search size={19} />
          </Link>

          <Link 
            to="/cart" 
            className="relative text-slate-700 dark:text-slate-300 p-2"
          >
            <ShoppingCart size={19} />
            {cartCount > 0 && (
              <span className="bg-red-500 text-white rounded-full absolute top-1 right-1 min-w-4 h-4 flex items-center justify-center text-[9px] font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-800 dark:text-white p-2 hover:bg-slate-100 rounded-xl outline-none"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 px-6 py-5 space-y-4 shadow-xl">
          <ul className="flex flex-col gap-3 font-semibold text-slate-700 dark:text-slate-200 text-sm">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-purple-600"
                >
                  {link.name}
                </Link>
              </li>
            ))}
            {user && (
              <li>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 text-purple-600 font-bold"
                >
                  My Profile ({user.firstName})
                </Link>
              </li>
            )}
            {user && user.role === "admin" && (
              <li>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 text-purple-600 font-bold"
                >
                  Admin Panel
                </Link>
              </li>
            )}
          </ul>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {user ? (
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logoutHandler();
                }}
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50 text-xs"
              >
                <LogOut size={14} className="mr-2" /> Log out
              </Button>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold">
                  Log in / Register
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
