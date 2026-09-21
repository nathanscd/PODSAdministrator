import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  User as UserIcon, Camera, LogOut, Save, 
  ShieldCheck, Briefcase, FileText
} from "lucide-react"; 
import { signOut } from "firebase/auth"; 
import { auth, db } from "../firebase"; 
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; 
import { useLang } from "../contexts/LangContext"; 
import PageTransition from "../components/PageTransition";
import { useTitle } from "../hooks/useTitle";

export default function ProfilePage() {
  const { user, updateUserProfile, loading } = useAuth();
  const navigate = useNavigate(); 
  const { t } = useLang(); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  useTitle(`${t.sidebar.profile} - PODS Administrator`);
  
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setphotoURL] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setRole(user.role || "");
      setBio(user.bio || "");
      setphotoURL(user.photoURL || "");
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const base64String = canvas.toDataURL("image/webp", 0.8);
        setphotoURL(base64String);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      await updateUserProfile({ 
        displayName: name, 
        role, 
        bio
      });

      if (user?.uid) {
        await updateDoc(doc(db, "users", user.uid), {
          photoURL: photoURL
        });
      }

      alert((t as any).successMessage || "Profile updated!");
    } catch (error) {
      console.error(error);
      alert((t as any).errorMessage || "Error updating profile.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[var(--bg-app)]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[var(--accent-color)]"></div>
    </div>
  );

  if (!user) return null;

  return (
    <PageTransition>
      <div className="min-h-screen pt-17 pr-3 pl-3 pb-3 bg-[var(--bg-app)] flex flex-col items-center justify-center p-6 pb-20">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-color)]/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="w-full max-w-2xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Minimal Header */}
          <div className="text-center mb-10">
            <div 
              className="relative inline-block group cursor-pointer mb-6"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
              />
              <div className="h-32 w-32 rounded-md bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl overflow-hidden relative">
                {photoURL ? (
                  <img 
                    src={photoURL} 
                    alt={name} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--accent-color)]/20 to-[var(--accent-color)]/5 flex items-center justify-center text-[var(--accent-color)] text-4xl font-black">
                    {name.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                   <Camera className="text-white" size={24} />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight">
              {name || "User Profile"}
            </h1>
            <p className="text-[var(--text-secondary)] font-bold uppercase text-[10px] tracking-[0.3em] mt-2 opacity-60">
              Personal Identity Hub
            </p>
          </div>

          {/* Simple Main Card */}
          <div className="bg-[var(--app-bg)] p-10 rounded-md border border-[var(--border-color)] shadow-2xl space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] uppercase font-black text-[var(--text-secondary)] tracking-widest ml-1">
                  <UserIcon size={12} className="text-[var(--accent-color)]" /> Full Name
                </label>
                <input 
                  className="w-full bg-[var(--bg-app)]/50 border border-[var(--border-color)] rounded-2xl focus:border-[var(--accent-color)] outline-none px-6 py-4 text-sm text-[var(--text-primary)] transition-all font-bold" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your name" 
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] uppercase font-black text-[var(--text-secondary)] tracking-widest ml-1">
                  <Briefcase size={12} className="text-[var(--accent-color)]" /> Role
                </label>
                <input 
                  className="w-full bg-[var(--bg-app)]/50 border border-[var(--border-color)] rounded-2xl focus:border-[var(--accent-color)] outline-none px-6 py-4 text-sm text-[var(--text-primary)] transition-all font-bold" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  placeholder="Your position" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] uppercase font-black text-[var(--text-secondary)] tracking-widest ml-1">
                <FileText size={12} className="text-[var(--accent-color)]" /> Bio
              </label>
              <textarea 
                className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] focus:border-[var(--accent-color)] rounded-2xl outline-none p-6 text-sm text-[var(--text-primary)] h-32 resize-none transition-all font-medium custom-scrollbar" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                placeholder="A bit about yourself..." 
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button 
                onClick={handleSave} 
                className="flex-1 h-14 bg-[var(--accent-color)] text-white font-black uppercase text-[11px] tracking-widest rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
              >
                <Save size={18} /> Update Profile
              </button>
              <button 
                onClick={handleLogout} 
                className="h-14 px-6 bg-[var(--bg-app)] border border-[var(--border-color)] text-red-500 font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center justify-center gap-2">
              <ShieldCheck size={14} /> Account Status: Verified Root Administrator
            </p>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}