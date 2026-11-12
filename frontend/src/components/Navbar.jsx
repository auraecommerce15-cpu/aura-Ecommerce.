import { ShoppingCart, ShieldAlert, LogOut, User, Menu, X, Search, ChevronDown, Sun, Moon } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/UserSlice";
import { useState, useEffect, useRef } from "react";
import AuraLogo from "./AuraLogo";
import { useTheme } from "@/context/ThemeContext";

const Navbar = () => {
  const { user } = useSelector(store => store.user);
  const { cartItems } = useSelector(store => store.cart);
  const accessToken = localStorage.getItem("accessToken");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [categories, setCategories] = useState(["Laptops", "Smartphones", "Headphones", "Smartwatches"]);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get("/category");
        if (res.data.success && res.data.categories?.length > 0) {
          setCategories(res.data.categories.map(c => c.name));
        }
      } catch (e) {
        // Fallback default categories
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCatDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      dispatch(setUser(null));
      localStorage.removeItem("accessToken");
      navigate('/');
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 h-18">

        {/* ─── 1. Brand Logo (Exact match with purple ribbon A and bold AURA) ─── */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <AuraLogo iconClassName="w-8 h-8 group-hover:scale-105 transition-transform" textClassName="text-2xl font-black tracking-wider text-slate-900 dark:text-white" />
        </Link>

        {/* ─── 2. Desktop Navigation Center ─── */}
        <nav className="hidden md:flex items-center gap-9 text-[15px] font-medium text-slate-700 dark:text-slate-300">
          
          {/* Home */}
          <Link
            to="/"
            className={`relative py-1 transition-colors hover:text-purple-600 dark:hover:text-purple-400 ${
              location.pathname === "/" ? "text-purple-600 dark:text-purple-400 font-bold" : ""
            }`}
          >
            Home
            {location.pathname === "/" && (
              <span className="absolute -bottom-1.5 left-0 w-full h-[2.5px] bg-purple-600 rounded-full" />
            )}
          </Link>

          {/* Shop */}
          <Link
            to="/products"
            className={`relative py-1 transition-colors hover:text-purple-600 dark:hover:text-purple-400 ${
              location.pathname === "/products" && !location.search ? "text-purple-600 dark:text-purple-400 font-bold" : ""
            }`}
          >
            Shop
            {location.pathname === "/products" && !location.search && (
              <span className="absolute -bottom-1.5 left-0 w-full h-[2.5px] bg-purple-600 rounded-full" />
            )}
          </Link>

          {/* Categories with Dropdown ⌵ */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setCatDropdownOpen(!catDropdownOpen)}
              onMouseEnter={() => setCatDropdownOpen(true)}
              className="flex items-center gap-1.5 py-1 transition-colors hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer focus:outline-none"
            >
              <span>Categories</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${catDropdownOpen ? "rotate-180 text-purple-600" : "text-slate-500"}`} />
            </button>

            {catDropdownOpen && (
              <div
                onMouseLeave={() => setCatDropdownOpen(false)}
                className="absolute top-full left-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Select Category
                </div>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/products?category=${encodeURIComponent(cat)}`}
                    onClick={() => setCatDropdownOpen(false)}
                    className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-xl transition-colors font-medium capitalize"
                  >
                    {cat}
                  </Link>
                ))}
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <Link
                  to="/products"
                  onClick={() => setCatDropdownOpen(false)}
                  className="block px-3 py-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  View All Products →
                </Link>
              </div>
            )}
          </div>

          {/* About */}
          <Link
            to="/about"
            className={`relative py-1 transition-colors hover:text-purple-600 dark:hover:text-purple-400 ${
              location.pathname === "/about" ? "text-purple-600 dark:text-purple-400 font-bold" : ""
            }`}
          >
            About
          </Link>

          {/* Contact */}
          <Link
            to="/contact"
            className={`relative py-1 transition-colors hover:text-purple-600 dark:hover:text-purple-400 ${
              location.pathname === "/contact" ? "text-purple-600 dark:text-purple-400 font-bold" : ""
            }`}
          >
            Contact
          </Link>

          {/* Admin Tag */}
          {user && user.role === "admin" && (
            <Link
              to="/admin"
              className="text-purple-600 hover:text-purple-700 flex items-center gap-1 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-full text-xs font-bold border border-purple-200 dark:border-purple-800"
            >
              <ShieldAlert size={13} /> Admin
            </Link>
          )}
        </nav>

        {/* ─── 3. Right Icons (Search, Theme Toggle, User, Cart) ─── */}
        <div className="flex items-center gap-3 sm:gap-4 text-slate-800 dark:text-slate-200">

          {/* Search Icon */}
          <Link
            to="/products"
            title="Search Products"
            className="p-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <Search size={21} strokeWidth={1.8} />
          </Link>

          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200 cursor-pointer flex items-center justify-center"
          >
            {theme === "dark" ? (
              <Sun size={20} strokeWidth={1.9} className="text-amber-400 animate-in spin-in-90 duration-300" />
            ) : (
              <Moon size={20} strokeWidth={1.9} className="text-slate-700 hover:text-purple-600 transition-colors" />
            )}
          </button>

          {/* User Profile Icon */}
          <Link
            to={user ? "/profile" : "/login"}
            title={user ? `Profile (${user.firstName})` : "Login / Register"}
            className="p-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5"
          >
            <User size={21} strokeWidth={1.8} />
            {user && (
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 hidden lg:inline max-w-[80px] truncate">
                {user.firstName}
              </span>
            )}
          </Link>

          {/* Cart Icon with Vibrant Purple Badge */}
          <Link
            to="/cart"
            title="Cart"
            className="relative p-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <ShoppingCart size={21} strokeWidth={1.8} />
            <span className="absolute -top-1 -right-1 bg-purple-600 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-black px-1 shadow-sm">
              {cartCount}
            </span>
          </Link>

          {user && (
            <Button
              onClick={logoutHandler}
              variant="ghost"
              size="sm"
              title="Logout"
              className="hover:text-red-600 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs h-8 px-2 rounded-lg cursor-pointer hidden md:flex"
            >
              <LogOut size={14} />
            </Button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 hover:text-purple-600 text-slate-800 dark:text-slate-200 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* ─── Mobile Drawer ─── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 px-6 py-5 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <ul className="flex flex-col gap-3 font-semibold text-slate-700 dark:text-slate-300 text-sm">
            <li>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 hover:text-purple-600 dark:hover:text-purple-400 font-bold"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 hover:text-purple-600 dark:hover:text-purple-400"
              >
                Shop All
              </Link>
            </li>
            <li className="pt-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">
                Categories
              </span>
              <div className="grid grid-cols-2 gap-2 pl-2">
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/products?category=${encodeURIComponent(cat)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs py-1 text-slate-600 dark:text-slate-400 hover:text-purple-600 capitalize"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </li>
            <li>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 hover:text-purple-600 dark:hover:text-purple-400"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 hover:text-purple-600 dark:hover:text-purple-400"
              >
                Contact
              </Link>
            </li>
            <li className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Appearance Mode:</span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                {theme === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
                <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
              </button>
            </li>
            {user && user.role === "admin" && (
              <li>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 text-purple-600 dark:text-purple-400 font-bold"
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
                className="w-full text-red-600 border-red-200 hover:bg-red-50 text-xs font-bold"
              >
                <LogOut size={14} className="mr-2" /> Log out ({user.firstName})
              </Button>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold">
                  Log In / Sign Up
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
