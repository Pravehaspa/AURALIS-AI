import { useState } from "react";
import { Eye, EyeOff, Mic, Sparkles, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth, mapSupabaseUser } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logoImg from "@/assets/logo.png";
import heroBg from "@/assets/hero-bg.svg";

type AuthStep = "login" | "register-email" | "register-otp" | "register-password";

// Google SVG Icon
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export function AuthPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // GOOGLE OAUTH
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: "offline", prompt: "consent" },
        skipBrowserRedirect: false,
      },
    });
    if (error) {
      toast.error(error.message);
      setGoogleLoading(false);
    }
    // On success, browser redirects automatically
  };

  // LOGIN
  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    login(mapSupabaseUser(data.user));
    navigate("/");
  };

  // REGISTER: send OTP
  const handleSendOtp = async () => {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success("Verification code sent to your email");
    setStep("register-otp");
    setLoading(false);
  };

  // REGISTER: verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success("Email verified!");
    setStep("register-password");
    setLoading(false);
  };

  // REGISTER: set password
  const handleSetPassword = async () => {
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      password,
      data: { username: username || email.split("@")[0] },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    login(mapSupabaseUser(data.user));
    toast.success("Account created! Welcome to Auralis AI");
    navigate("/");
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") action();
  };

  // Shared divider + Google button block
  const GoogleAuthSection = () => (
    <>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-muted-foreground">or continue with</span>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full h-11 border-border bg-secondary hover:bg-secondary/80 text-foreground gap-3 font-medium"
      >
        {googleLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </Button>
    </>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <img src={heroBg} alt="Auralis AI" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/80 via-indigo-900/60 to-black/70" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              <img src={logoImg} alt="Auralis" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-xl text-white">Auralis AI</span>
          </div>

          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs text-white/80 mb-6">
              <Sparkles size={12} className="text-violet-300" />
              Powered by Auralis AI + Gemini 3
            </div>
            <h2 className="font-display font-bold text-4xl text-white leading-tight mb-4">
              Voice agents that<br />
              <span className="gradient-text">think and speak</span><br />
              naturally
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Build intelligent AI voice assistants with real-time conversations, advanced language understanding, and expressive voice synthesis.
            </p>

            <div className="grid grid-cols-3 gap-4 mt-10">
              {[
                { label: "Voice Profiles", value: "10+" },
                { label: "AI Responses", value: "Real" },
                { label: "Languages", value: "5+" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-display font-bold text-2xl text-white">{s.value}</p>
                  <p className="text-xs text-white/50 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/40">
            <Mic size={12} />
            <span>Speech-to-speech · Auto Mode · Agent Builder · Analytics</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md py-4">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl overflow-hidden">
              <img src={logoImg} alt="Auralis" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">Auralis AI</span>
          </div>

          {/* LOGIN */}
          {step === "login" && (
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground mb-1">Welcome back</h1>
              <p className="text-muted-foreground text-sm mb-8">Sign in to your Auralis AI account</p>

              {/* Google first */}
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full h-11 border-border bg-secondary hover:bg-secondary/80 text-foreground gap-3 font-medium mb-4"
              >
                {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
                Continue with Google
              </Button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs text-muted-foreground">or sign in with email</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Email address</Label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                      placeholder="you@example.com"
                      className="pl-9 bg-secondary border-border"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Password</Label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                      placeholder="••••••••"
                      className="pl-9 pr-10 bg-secondary border-border"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleLogin}
                  disabled={!email || !password || loading}
                  className="w-full brand-gradient text-white hover:opacity-90 h-11"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : (
                    <><span>Sign In</span><ArrowRight size={16} className="ml-2" /></>
                  )}
                </Button>
              </div>

              <div className="mt-6 text-center">
                <span className="text-sm text-muted-foreground">New to Auralis?{" "}</span>
                <button
                  onClick={() => setStep("register-email")}
                  className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors"
                >
                  Create an account
                </button>
              </div>
            </div>
          )}

          {/* REGISTER step 1 — email */}
          {step === "register-email" && (
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground mb-1">Create account</h1>
              <p className="text-muted-foreground text-sm mb-8">Join Auralis AI in seconds</p>

              {/* Google first */}
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full h-11 border-border bg-secondary hover:bg-secondary/80 text-foreground gap-3 font-medium mb-4"
              >
                {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
                Sign up with Google
              </Button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs text-muted-foreground">or sign up with email</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Username (optional)</Label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your display name"
                      className="pl-9 bg-secondary border-border"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Email address</Label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, handleSendOtp)}
                      placeholder="you@example.com"
                      className="pl-9 bg-secondary border-border"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSendOtp}
                  disabled={!email || loading}
                  className="w-full brand-gradient text-white hover:opacity-90 h-11"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : (
                    <><span>Send Verification Code</span><ArrowRight size={16} className="ml-2" /></>
                  )}
                </Button>
              </div>

              <div className="mt-6 text-center">
                <span className="text-sm text-muted-foreground">Already have an account?{" "}</span>
                <button
                  onClick={() => setStep("login")}
                  className="text-sm text-brand-400 hover:text-brand-300 font-medium"
                >
                  Sign in
                </button>
              </div>
            </div>
          )}

          {/* REGISTER step 2 — OTP */}
          {step === "register-otp" && (
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground mb-1">Check your email</h1>
              <p className="text-muted-foreground text-sm mb-2">We sent a 4-digit code to</p>
              <p className="text-brand-400 text-sm font-medium mb-8">{email}</p>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Verification code</Label>
                  <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    onKeyDown={(e) => handleKeyDown(e, handleVerifyOtp)}
                    placeholder="0000"
                    maxLength={4}
                    className="bg-secondary border-border text-center text-2xl tracking-widest font-mono h-14"
                  />
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  disabled={otp.length < 4 || loading}
                  className="w-full brand-gradient text-white hover:opacity-90 h-11"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Verify Code"}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => { setStep("register-email"); setOtp(""); }}
                  className="w-full text-muted-foreground text-sm"
                >
                  ← Change email
                </Button>
              </div>
            </div>
          )}

          {/* REGISTER step 3 — password */}
          {step === "register-password" && (
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground mb-1">Set your password</h1>
              <p className="text-muted-foreground text-sm mb-8">Choose a secure password for your account</p>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Password (min. 6 characters)</Label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, handleSetPassword)}
                      placeholder="Create a strong password"
                      className="pl-9 pr-10 bg-secondary border-border"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {password && (
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            password.length >= i * 3
                              ? i <= 1 ? "bg-red-500" : i <= 2 ? "bg-yellow-500" : i <= 3 ? "bg-blue-500" : "bg-green-500"
                              : "bg-secondary"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleSetPassword}
                  disabled={password.length < 6 || loading}
                  className="w-full brand-gradient text-white hover:opacity-90 h-11"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : (
                    <><Sparkles size={16} className="mr-2" /><span>Create Account</span></>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
