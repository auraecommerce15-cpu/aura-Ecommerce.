import { ShoppingCart, ShieldAlert, LogOut, User, Menu, X, Search, ChevronDown } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/UserSlice";
import { useState, useEffect, useRef } from "react";
import AuraLogo from "./AuraLogo";

const Navbar = () => {
  const { user } = useSelector(store => store.user);
  const { cartItems } = useSelector(store => store.cart);
  const accessToken = localStorage.getItem("accessToken");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

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
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-slate-100 shadow-xs transition-all duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 h-18">

        {/* ─── 1. Brand Logo (Exact match with purple ribbon A and bold AURA) ─── */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <AuraLogo iconClassName="w-8 h-8 group-hover:scale-105 transition-transform" textClassName="text-2xl font-black tracking-wider text-slate-900" />
        </Link>

        {/* ─── 2. Desktop Navigation Center ─── */}
        <nav className="hidden md:flex items-center gap-9 text-[15px] font-medium text-slate-700">
          
          {/* Home */}
          <Link
            to="/"
            className={`relative py-1 transition-colors hover:text-purple-600 ${
              location.pathname === "/" ? "text-purple-600 font-bold" : ""
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
            className={`relative py-1 transition-colors hover:text-purple-600 ${
              location.pathname === "/products" && !location.search ? "text-purple-600 font-bold" : ""
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
              className="flex items-center gap-1.5 py-1 transition-colors hover:text-purple-600 cursor-pointer focus:outline-none"
            >
              <span>Categories</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${catDropdownOpen ? "rotate-180 text-purple-600" : "text-slate-500"}`} />
            </button>

            {catDropdownOpen && (
              <div
                onMouseLeave={() => setCatDropdownOpen(false)}
                className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Select Category
                </div>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/products?category=${encodeURIComponent(cat)}`}
                    onClick={() => setCatDropdownOpen(false)}
                    className="block px-3 py-2 text-sm text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors font-medium capitalize"
                  >
                    {cat}
                  </Link>
                ))}
                <div className="my-1 border-t border-slate-100" />
                <Link
                  to="/products"
                  onClick={() => setCatDropdownOpen(false)}
                  className="block px-3 py-2 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                >
                  View All Products →
                </Link>
              </div>
            )}
          </div>

          {/* About */}
          <Link
            to="/about"
            className={`relative py-1 transition-colors hover:text-purple-600 ${
              location.pathname === "/about" ? "text-purple-600 font-bold" : ""
            }`}
          >
            About
          </Link>

          {/* Contact */}
          <Link
            to="/contact"
            className={`relative py-1 transition-colors hover:text-purple-600 ${
              location.pathname === "/contact" ? "text-purple-600 font-bold" : ""
            }`}
          >
            Contact
          </Link>

          {/* Admin Tag */}
          {user && user.role === "admin" && (
            <Link
              to="/admin"
              className="text-purple-600 hover:text-purple-700 flex items-center gap-1 bg-purple-50 px-2.5 py-1 rounded-full text-xs font-bold border border-purple-200"
            >
              <ShieldAlert size={13} /> Admin
            </Link>
          )}
        </nav>

        {/* ─── 3. Right Icons (Search, User, Cart) ─── */}
        <div className="flex items-center gap-4 sm:gap-5 text-slate-800">

          {/* Search Icon */}
          <Link
            to="/products"
            title="Search Products"
            className="p-1.5 hover:text-purple-600 transition-colors"
          >
            <Search size={21} strokeWidth={1.8} />
          </Link>

          {/* User Profile Icon */}
          <Link
            to={user ? "/profile" : "/login"}
            title={user ? `Profile (${user.firstName})` : "Login / Register"}
            className="p-1.5 hover:text-purple-600 transition-colors flex items-center gap-1.5"
          >
            <User size={21} strokeWidth={1.8} />
            {user && (
              <span className="text-xs font-bold text-slate-700 hidden lg:inline max-w-[80px] truncate">
                {user.firstName}
              </span>
            )}
          </Link>

          {/* Cart Icon with Vibrant Purple Badge */}
          <Link
            to="/cart"
            title="Cart"
            className="relative p-1.5 hover:text-purple-600 transition-colors"
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
              className="hover:text-red-600 text-slate-400 hover:bg-red-50 text-xs h-8 px-2 rounded-lg cursor-pointer hidden md:flex"
            >
              <LogOut size={14} />
            </Button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 hover:text-purple-600 text-slate-800 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* ─── Mobile Drawer ─── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-6 py-5 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <ul className="flex flex-col gap-3 font-semibold text-slate-700 text-sm">
            <li>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 hover:text-purple-600 font-bold"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 hover:text-purple-600"
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
                    className="text-xs py-1 text-slate-600 hover:text-purple-600 capitalize"
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
                className="block py-1 hover:text-purple-600"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 hover:text-purple-600"
              >
                Contact
              </Link>
            </li>
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

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
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
