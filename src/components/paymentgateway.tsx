import { useState } from "react";
import { Transaction } from "../types";
import { api } from "../lib/api";
import { ShieldAlert, CreditCard, Lock, RefreshCw, CheckCircle, X, HelpCircle, FileText } from "lucide-react";

interface PaymentGatewayProps {
  transaction: Transaction;
  onSuccess: (finalTx: Transaction) => void;
  onClose: () => void;
}

export default function PaymentGateway({ transaction, onSuccess, onClose }: PaymentGatewayProps) {
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("371");
  const [cardholder, setCardholder] = useState("SANDBOX CLIENT");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"gateway" | "processing" | "completed" | "failed">("gateway");
  const [errorMsg, setErrorMsg] = useState("");
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  const handleSimulatePayment = async (status: "success" | "fail") => {
    setIsProcessing(true);
    setStep("processing");
    setErrorMsg("");

    
    setTimeout(async () => {
      try {
        if (status === "fail") {
         
          const finalTx = await api.triggerStripeWebhookSim(transaction.id, false);
          setCompletedTx(finalTx);
          setStep("failed");
          setErrorMsg("Sandbox Payment declined by issuing bank (Simulated Fail).");
          setIsProcessing(false);
          return;
        }

        const finalTx = await api.triggerStripeWebhookSim(transaction.id, true);
        setCompletedTx(finalTx);
        setStep("completed");
        setIsProcessing(false);
        onSuccess(finalTx);
      } catch (err: any) {
        setStep("failed");
        setErrorMsg(err.message || "An unexpected transaction webhook error occurred.");
        setIsProcessing(false);
      }
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-black/90 backdrop-blur-md p-4" id="stripe-checkout-viewport">
      <div className="relative w-full max-w-md border border-cyber-border bg-cyber-dark rounded-2xl shadow-2xl overflow-hidden cyber-glow-teal">
    
        <div className="flex items-center justify-between border-b border-cyber-border/80 bg-cyber-card/40 px-5 py-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold tracking-widest font-mono text-cyan-400">APEX STRIPE SANDBOX GATEWAY</h3>
          </div>
          {step === "gateway" && (
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6">
          {step === "gateway" && (
            <div className="flex flex-col gap-5">

              <div className="rounded-xl bg-cyber-black p-4 border border-cyber-border/40 font-mono">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Transaction Statement</span>
                <h4 className="text-xs text-slate-200 mt-1 font-sans font-medium">{transaction.itemName}</h4>
                <div className="flex justify-between items-end mt-3 pt-3 border-t border-cyber-border/40">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Amount Due</span>
                  <span className="text-lg font-bold text-cyan-400">${transaction.amount.toFixed(2)}</span>
                </div>
              </div>

              
              <div className="flex flex-col gap-3 font-mono">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Credit Card Details (Sandbox Mock)
                </span>
                
              
                <div className="relative p-5 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 text-slate-200 shadow-lg select-none">
                  <div className="flex justify-between items-start">
                    <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">APEX PREMIER CARD</div>
                    <CreditCard className="w-8 h-8 text-cyan-400/80" />
                  </div>
                  <div className="my-5 text-sm tracking-widest text-slate-100">{cardNumber}</div>
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <div>
                      <div className="text-[8px] uppercase text-slate-500">Holder</div>
                      <div>{cardholder}</div>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <div className="text-[8px] uppercase text-slate-500">Exp</div>
                        <div>{expiry}</div>
                      </div>
                      <div>
                        <div className="text-[8px] uppercase text-slate-500">CVV</div>
                        <div>{cvc}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-cyber-card/50 p-3 rounded-lg border border-cyber-border/40 text-[11px] text-slate-400 leading-relaxed font-sans flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Stripe test card digits are populated automatically. Click either <strong>Simulate Webhook Success</strong> or <strong>Fail</strong> below to invoke payment webhook execution.
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={() => handleSimulatePayment("success")}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-cyber-black text-xs font-bold tracking-wider uppercase shadow-xl hover:shadow-cyan-950/20 transition-all duration-300 font-display flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  PROCEED PAY (Webhook Sim Success)
                </button>
                <button
                  onClick={() => handleSimulatePayment("fail")}
                  className="w-full py-2.5 rounded-xl border border-rose-500/30 bg-rose-950/10 hover:bg-rose-950/20 text-rose-400 text-xs font-semibold tracking-wider uppercase transition-all duration-300 font-display cursor-pointer"
                >
                  SIMULATE DECLINED WEBHOOK
                </button>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-10 gap-4" id="tx-loading-panel">
              <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin" />
              <div className="text-center">
                <h4 className="text-sm font-semibold tracking-wide font-display text-slate-200">Processing Sandbox Handshake...</h4>
                <p className="text-[11px] text-slate-500 mt-1 font-mono leading-relaxed">
                  Establishing payment intent, firing secure API webhook receiver payload to endpoint: <code>/api/payments/webhook</code>
                </p>
              </div>
              <div className="w-full max-w-[200px] bg-cyber-border h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-cyan-500 h-full w-[80%] animate-[pulse_1.5s_infinite]" />
              </div>
            </div>
          )}

          {step === "completed" && (
            <div className="flex flex-col items-center justify-center py-6 gap-4 text-center" id="tx-success-panel">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-900/30 border border-emerald-500/40">
                <CheckCircle className="w-8 h-8 text-emerald-400 animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-semibold tracking-wide font-display text-slate-200">PAYMENT WEBHOOK SUCCESSFUL!</h4>
                <p className="text-[11px] text-slate-400 mt-2 font-mono max-w-xs mx-auto leading-relaxed">
                  Stripe webhook securely parsed. Database state changed to <strong className="text-emerald-400">PAID</strong>. Event allocation limits evaluated.
                </p>
              </div>

              {completedTx && (
                <div className="w-full text-left rounded-xl bg-cyber-card/50 border border-cyber-border p-4 font-mono text-[10px] mt-4 flex flex-col gap-1 text-slate-400 border-l-4 border-l-emerald-500">
                  <div className="flex items-center gap-1 text-slate-200 font-sans font-semibold border-b border-cyber-border pb-1.5 mb-1.5 uppercase tracking-wider text-[9px]">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" /> Secure Sandbox Receipt
                  </div>
                  <div><span className="text-slate-500">RECEIPT REF:</span> #{completedTx.id}</div>
                  <div><span className="text-slate-500">BILLTO ACC:</span> {completedTx.userName} ({completedTx.userEmail})</div>
                  <div><span className="text-slate-500">ITEM PURCHASE:</span> {completedTx.itemName}</div>
                  <div><span className="text-slate-500">AMOUNT PAID:</span> ${completedTx.amount.toFixed(2)} USD</div>
                  <div><span className="text-slate-500">TIMESTAMP:</span> {new Date(completedTx.createdAt).toLocaleString()}</div>
                  <div className="mt-1 text-[9px] text-emerald-500 font-bold uppercase py-0.5 px-1 bg-emerald-950/30 rounded border border-emerald-500/20 inline-block self-end">
                    STATUS: SECURE CAPTURED
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-2.5 mt-4 rounded-xl bg-cyber-border text-slate-200 text-xs font-semibold hover:bg-slate-800 transition-all duration-300 font-display cursor-pointer"
              >
                RETURN TO DASHBOARD
              </button>
            </div>
          )}

          {step === "failed" && (
            <div className="flex flex-col items-center justify-center py-6 gap-4 text-center" id="tx-failed-panel">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-rose-900/30 border border-rose-500/40">
                <CheckCircle className="w-8 h-8 text-rose-400 rotate-180" />
              </div>
              <div>
                <h4 className="text-sm font-semibold tracking-wide font-display text-slate-200">PAYMENT TRANSACTION FAILED</h4>
                <p className="text-[11px] text-rose-400 font-mono bg-rose-950/20 border border-rose-900/30 py-2 px-3 rounded-lg max-w-xs mx-auto mt-2 leading-relaxed">
                  {errorMsg}
                </p>
                <p className="text-[11px] text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                  A failed webhook signal was sent back, rolling back any allocated pending transaction states safely. Feel free to retry the Sandbox check.
                </p>
              </div>

              <div className="flex gap-2.5 w-full mt-4">
                <button
                  onClick={() => setStep("gateway")}
                  className="flex-1 py-2.5 rounded-xl border border-cyber-border text-slate-300 text-xs hover:bg-cyber-card/45 transition-colors font-display cursor-pointer"
                >
                  RETRY CHECKOUT
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-cyber-border text-slate-300 text-xs hover:bg-slate-800 transition-colors font-display cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
