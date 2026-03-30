import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, useRegister } from "@/hooks/use-auth-api";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Shield, Zap, ArrowRight, CheckCircle2, Trophy, Briefcase } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Full name is required"),
  role: z.enum(["candidate", "recruiter"]),
});

// Floating particles component
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, Math.random() * -200 - 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 8 + 6,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}

// Feature highlights
const features = [
  { icon: Brain, title: "AI-Powered Tests", desc: "Smart skill assessment with dynamic questions" },
  { icon: Shield, title: "Verified Skills", desc: "Earn badges that prove your expertise" },
  { icon: Trophy, title: "Leaderboard", desc: "Compete and rank among top candidates" },
  { icon: Briefcase, title: "Smart Matching", desc: "Jobs matched to your verified skill set" },
];

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [currentFeature, setCurrentFeature] = useState(0);
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const { isAuthenticated, user } = useAuth();
  const [_, setLocation] = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation(user.role === "recruiter" ? "/recruiter" : "/dashboard");
    }
  }, [isAuthenticated, user, setLocation]);

  // Cycle through features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "", name: "", role: "candidate" },
  });

  const onLogin = (data: z.infer<typeof loginSchema>) => loginMutation.mutate(data);
  const onRegister = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        setActiveTab("login");
      }
    });
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
        </div>
        <FloatingParticles />
      </div>

      {/* Left side - Hero */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-lg"
        >
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary via-purple-500 to-secondary flex items-center justify-center shadow-2xl shadow-primary/30">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight text-white">
                SkillHire<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">.AI</span>
              </h1>
              <p className="text-xs text-primary/60 font-medium tracking-widest uppercase">Intelligence meets talent</p>
            </div>
          </motion.div>

          {/* Hero Text */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-bold font-display text-white leading-tight mb-6"
          >
            Where{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-cyan-400">
              Verified Skills
            </span>{" "}
            Meet Dream Jobs
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 text-lg leading-relaxed mb-10"
          >
            Take AI-powered assessments, earn skill badges, and get matched with companies that value your proven abilities.
          </motion.p>

          {/* Feature Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              const isActive = i === currentFeature;
              return (
                <motion.div
                  key={i}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                    isActive
                      ? "bg-primary/10 border-primary/30 shadow-lg shadow-primary/5"
                      : "bg-white/5 border-white/5"
                  }`}
                  animate={{ x: isActive ? 8 : 0 }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive ? "bg-primary/20" : "bg-white/10"
                  }`}>
                    <Icon size={20} className={isActive ? "text-primary" : "text-gray-500"} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isActive ? "text-white" : "text-gray-400"}`}>{feature.title}</h3>
                    <p className={`text-xs ${isActive ? "text-gray-300" : "text-gray-600"}`}>{feature.desc}</p>
                  </div>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="ml-auto"
                    >
                      <CheckCircle2 size={16} className="text-primary" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex gap-8 mt-10 pt-8 border-t border-white/10"
          >
            {[
              { value: "1K+", label: "Active Users" },
              { value: "50+", label: "Companies" },
              { value: "95%", label: "Match Rate" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary via-purple-500 to-secondary mb-4 shadow-2xl shadow-primary/30">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-white mb-1">
              SkillHire<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">.AI</span>
            </h1>
            <p className="text-sm text-muted-foreground">AI-powered recruitment platform</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-white/10 p-1 mb-6 rounded-xl">
              <TabsTrigger value="login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="login" key="login">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="glass-card border-white/10 shadow-2xl shadow-black/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl font-display">Welcome Back</CardTitle>
                      <CardDescription>Enter your credentials to continue</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter username" {...field} className="h-12 bg-white/5 border-white/10 text-white rounded-xl focus:border-primary/50 focus:ring-primary/20 placeholder:text-gray-600" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} className="h-12 bg-white/5 border-white/10 text-white rounded-xl focus:border-primary/50 focus:ring-primary/20 placeholder:text-gray-600" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? (
                              <span className="flex items-center gap-2">
                                <Zap className="animate-spin" size={16} /> Authenticating...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                Sign In <ArrowRight size={16} />
                              </span>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="register" key="register">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="glass-card border-white/10 shadow-2xl shadow-black/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl font-display">Create Account</CardTitle>
                      <CardDescription>Join as a candidate or recruiter</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={registerForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-300 text-xs">Username</FormLabel>
                                  <FormControl>
                                    <Input placeholder="johndoe" {...field} className="h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-primary/50 placeholder:text-gray-600" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-300 text-xs">Full Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John Doe" {...field} className="h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-primary/50 placeholder:text-gray-600" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300 text-xs">Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="you@example.com" {...field} className="h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-primary/50 placeholder:text-gray-600" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300 text-xs">Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} className="h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-primary/50 placeholder:text-gray-600" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300 text-xs">I am a...</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-primary/50">
                                      <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-card border-white/10 rounded-xl">
                                    <SelectItem value="candidate">🎯 Candidate (Looking for jobs)</SelectItem>
                                    <SelectItem value="recruiter">🏢 Recruiter (Hiring talent)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? (
                              <span className="flex items-center gap-2">
                                <Zap className="animate-spin" size={16} /> Creating Account...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                Get Started <ArrowRight size={16} />
                              </span>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>

          {/* Bottom text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-xs text-gray-600 mt-6"
          >
            Powered by AI • Secured by Design • Built for Talent
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
