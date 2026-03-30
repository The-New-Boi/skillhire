import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGenerateTest, useSubmitTest } from "@/hooks/use-skills";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, CheckCircle, Clock, ShieldAlert, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { TestQuestion } from "@shared/schema";
import { useProctoring } from "@/hooks/use-proctoring";
import { UpgradeModal } from "./UpgradeModal";

interface TestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FIELDS = ["React", "TypeScript", "Python", "Node.js", "SQL", "Cyber Security", "DevOps", "Cloud Computing"];

export function TestModal({ open, onOpenChange }: TestModalProps) {
  const [step, setStep] = useState<"select" | "loading" | "test" | "result">("select");
  const [field, setField] = useState("");
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; selectedOption: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [result, setResult] = useState<{ score: number; passed: boolean; aiFeedback?: string } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const generateMutation = useGenerateTest();
  const submitMutation = useSubmitTest();
  const { toast } = useToast();

  const { flags, resetFlags } = useProctoring(step === "test");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "test") {
      if (timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
      } else {
        handleNextQuestion(-1);
      }
    }
    return () => clearInterval(interval);
  }, [step, timeLeft, questions, currentQuestionIdx, answers]);

  const submitTest = async (finalAnswers: any) => {
    setStep("loading");
    try {
      const res = await submitMutation.mutateAsync({
        field,
        answers: finalAnswers,
        questions,
        cheatingFlags: flags
      });
      setResult(res);
      setStep("result");
    } catch (e) {
      setStep("select");
    }
  };

  const handleStartTest = async () => {
    if (!field) return;
    setStep("loading");
    try {
      const qs = await generateMutation.mutateAsync({ field, difficulty: "medium" });
      setQuestions(qs);
      setStep("test");
      setCurrentQuestionIdx(0);
      setAnswers([]);
      setTimeLeft(20);
      resetFlags();
    } catch (e) {
      setStep("select");
    }
  };

  const handleNextQuestion = async (selectedOptionIdx: number = -1) => {
    // Record answer (if timeout, selectedOptionIdx is -1)
    let newAnswers = [...answers];
    if (selectedOptionIdx !== -1) {
      newAnswers = [...answers, { 
        questionId: questions[currentQuestionIdx].id, 
        selectedOption: selectedOptionIdx 
      }];
      setAnswers(newAnswers);
    }

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setTimeLeft(20);
    } else {
      await submitTest(newAnswers);
    }
  };

  const reset = () => {
    setStep("select");
    setField("");
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && reset()}>
      <DialogContent 
        className="sm:max-w-lg bg-card/95 backdrop-blur-xl border-white/10 text-white select-none"
        onContextMenu={(e) => e.preventDefault()} // Disable right-click
        onCopy={(e) => e.preventDefault()} // Disable copy
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-display flex items-center gap-2">
            <Brain className="text-primary" />
            {step === "select" && "Select Skill Assessment"}
            {step === "loading" && "AI Processing..."}
            {step === "test" && `${field} Assessment`}
            {step === "result" && "Assessment Result"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <AnimatePresence mode="wait">
            
            {step === "select" && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">Choose a technology stack to verify your proficiency. The AI will generate unique questions.</p>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                  <p className="text-[11px] text-gray-400 flex items-center gap-2">
                    <ShieldAlert size={12} className="text-primary" />
                    <strong>AI Proctoring Enabled:</strong> This test monitors tab switching, window blurring, and fullscreen exit to ensure integrity.
                  </p>
                </div>
                <Select value={field} onValueChange={setField}>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Select Technology" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10">
                    {FIELDS.map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleStartTest} 
                  className="w-full btn-primary"
                  disabled={!field}
                >
                  Start Assessment
                </Button>
              </motion.div>
            )}

            {step === "loading" && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex flex-col items-center justify-center py-8 space-y-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">Generating questions...</p>
              </motion.div>
            )}

            {step === "test" && questions[currentQuestionIdx] && (
              <motion.div 
                key={currentQuestionIdx}
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">Question {currentQuestionIdx + 1}/{questions.length}</span>
                    <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/20 text-primary flex items-center gap-1">
                      <Eye size={10} /> AI Proctoring Active
                    </Badge>
                  </div>
                  <span className={`flex items-center gap-1 font-mono font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-primary'}`}>
                    <Clock size={14} />
                    00:{timeLeft.toString().padStart(2, '0')}
                  </span>
                </div>
                {flags > 0 && (
                  <div className="flex items-center gap-2 text-red-500 text-xs mt-1 animate-pulse">
                    <ShieldAlert size={12} />
                    <span>Suspicious activity detected! ({flags} incidents)</span>
                  </div>
                )}
                <Progress value={(timeLeft / 20) * 100} className="h-1 bg-white/10 mt-3" />

                <h3 className="text-lg font-medium leading-relaxed">
                  {questions[currentQuestionIdx].question}
                </h3>

                <div className="grid gap-3">
                  {questions[currentQuestionIdx].options.map((opt, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="justify-start text-left h-auto py-3 px-4 border-white/10 hover:bg-primary/20 hover:text-white hover:border-primary/50 transition-all"
                      onClick={() => handleNextQuestion(idx)}
                    >
                      <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs mr-3 font-mono">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "result" && result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="text-center space-y-6"
              >
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center border-4 ${result.passed ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                  {result.passed ? (
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  ) : (
                    <span className="text-2xl font-bold text-red-500">{result.score}%</span>
                  )}
                </div>

                <div>
                  <h3 className="text-2xl font-display font-bold mb-2">
                    {result.passed ? "Assessment Passed!" : "Assessment Failed"}
                  </h3>
                  <p className="text-muted-foreground">
                    You scored <span className="text-white font-bold">{result.score}%</span> proficiency in {field}.
                  </p>
                  {(result as any).cheatingFlags > 0 && (
                    <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-xs text-red-400 flex items-center justify-center gap-2">
                        <ShieldAlert size={14} />
                        {(result as any).cheatingFlags} incidents flagged by AI Proctoring.
                      </p>
                    </div>
                  )}

                  {/* AI Feedback Section */}
                  {result.aiFeedback && (
                    <div className="mt-6 text-left w-full">
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <Brain size={16} className="text-primary" /> AI Detailed Feedback
                      </h4>
                      {result.aiFeedback === "LOCKED" ? (
                        <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4 min-h-[100px]">
                          <div className="blur-sm border-primary/20 text-muted-foreground select-none">
                            Based on your answers, it seems you struggled with advanced concepts. We recommend studying core principles, reviewing the documentation, and practicing scenario-based problems before trying again.
                          </div>
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px]">
                            <Button 
                                variant="outline" 
                                className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                                onClick={() => setShowUpgradeModal(true)}
                            >
                              Upgrade to Unlock Feedback
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
                          {result.aiFeedback}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Button onClick={reset} className={result.passed ? "btn-primary w-full" : "btn-secondary w-full"}>
                  {result.passed ? "Continue to Dashboard" : "Try Again"}
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
        <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
      </DialogContent>
    </Dialog>
  );
}
