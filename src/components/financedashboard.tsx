/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, Transaction, ScheduleItem, FinancialSummary } from "../types";
import { api } from "../lib/api";
import { ShieldCheck, BarChart4, DollarSign, Wallet, Users, LayoutDashboard, Search, Settings, RefreshCw, Layers, Sparkles, UserCheck } from "lucide-react";

interface FinanceDashboardProps {
  onRefreshFinance: () => void;
  registeredUsers: User[];
  onRefreshUser: () => void;
}

export default function FinanceDashboard({ onRefreshFinance, registeredUsers, onRefreshUser }: FinanceDashboardProps) {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [budgetPool, setBudgetPool] = useState(100000);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [updatingBudgetAmount, setUpdatingBudgetAmount] = useState("");
  const [userSearchText, setUserSearchText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [successNotif, setSuccessNotif] = useState("");

  const loadFinancials = async () => {
    setIsUpdating(true);
    try {
      const data = await api.getFinancialSummary();
      setSummary(data.summary);
      setBudgetPool(data.budgetPool);
      setUpdatingBudgetAmount(data.budgetPool.toString());

      const txs = await api.getTransactionsList();
      setTransactions(txs);
    } catch (err) {
      console.error("Failed to load financials:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    loadFinancials();
  }, [registeredUsers]);

  const handleAdjustPoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingBudgetAmount || isNaN(Number(updatingBudgetAmount))) return;
    setIsUpdating(true);

    try {
      const result = await api.adjustBudgetPool(Number(updatingBudgetAmount));
      setSummary(result.summary);
      setBudgetPool(result.budgetPool);
      triggerBannerNotif("Total administrative budgetary pool limit successfully recalibrated.");
      onRefreshFinance();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRoleChange = async (userId: string, targetRole: string) => {
    setIsUpdating(true);
    try {
      await api.assignUserRole(userId, targetRole);
      triggerBannerNotif(`User security rank recalibrated successfully to level: ${targetRole.toUpperCase()}`);
      onRefreshUser();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const triggerBannerNotif = (msg: string) => {
    setSuccessNotif(msg);
    setTimeout(() => setSuccessNotif(""), 6000);
  };

  // User search filter
  const filteredUsers = registeredUsers.filter((u) => {
    return u.name.toLowerCase().includes(userSearchText.toLowerCase()) ||
           u.email.toLowerCase().includes(userSearchText.toLowerCase()) ||
           u.id.toLowerCase().includes(userSearchText.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-6" id="superadmin-engine-panel">
      {/* Visual action alert bar */}
      {successNotif && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] rounded-xl flex items-center gap-2 shadow-xl animate-fade-in">
          <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span>{successNotif}</span>
        </div>
      )}

      {/* Grid of financial metadata overview blocks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5" id="finance-stats-grid">
        
        {/* Core Revenue Metric */}
        <div className="rounded-2xl border border-cyber-border bg-cyber-card/25 p-5 relative overflow-hidden flex flex-col justify-between h-28 hover:border-cyan-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-3 text-cyan-500/10">
            <DollarSign className="w-16 h-16" />
          </div>
          <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">SUMMIT AGGREGATE REVENUE</span>
          <div>
            <h4 className="text-xl font-bold font-mono text-slate-100">${summary?.totalRevenue.toFixed(2) || "0.00"}</h4>
            <div className="flex gap-3 text-[9px] text-slate-500 mt-1 font-mono">
              <span>Tickets: ${summary?.ticketRevenue.toFixed(2)}</span>
              <span>Souvenirs: ${summary?.merchRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Budget Allocation Metric */}
        <div className="rounded-2xl border border-cyber-border bg-cyber-card/25 p-5 relative overflow-hidden flex flex-col justify-between h-28 hover:border-purple-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-3 text-purple-500/10">
            <Wallet className="w-16 h-16" />
          </div>
          <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">SUMMIT ALLOCATED BUDGET</span>
          <div>
            <h4 className="text-xl font-bold font-mono text-slate-100">${summary?.totalBudgetAllocated.toFixed(2) || "0.00"}</h4>
            <div className="w-full bg-cyber-border h-1 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${summary ? Math.min(100, (summary.totalBudgetAllocated / budgetPool) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Available administrative budget pool limits */}
        <div className="rounded-2xl border border-cyber-border bg-cyber-card/25 p-5 relative overflow-hidden flex flex-col justify-between h-28 hover:border-pink-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-3 text-rose-500/10">
            <Layers className="w-16 h-16" />
          </div>
          <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">BUDGETARY RESERVE pool</span>
          <div>
            <h4 className="text-xl font-bold font-mono text-slate-100">${summary?.remainingFreeBudget.toFixed(2) || "0.00"}</h4>
            <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-mono">
              <span>LIMIT: ${budgetPool.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Total user registrations */}
        <div className="rounded-2xl border border-cyber-border bg-cyber-card/25 p-5 relative overflow-hidden flex flex-col justify-between h-28 hover:border-emerald-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-3 text-emerald-500/10">
            <Users className="w-16 h-16" />
          </div>
          <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">ENROLLED REGISTRANTS</span>
          <div>
            <h4 className="text-xl font-bold font-mono text-slate-100">{registeredUsers.length} Users</h4>
            <div className="flex gap-2 text-[9px] text-slate-500 mt-1 font-mono">
              <span>Student: {registeredUsers.filter(u => u.role === 'student').length}</span>
              <span>Admin: {registeredUsers.filter(u => u.role === 'admin').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Structural layout: Budget settings and User Rank Administration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Administrative Settings panel (Column 5) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Calibrate overall Pool */}
          <div className="rounded-2xl border border-cyber-border bg-cyber-card/15 p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold tracking-wider font-display text-slate-200">RE-POOL TREASURY LIMITS</h3>
            </div>
            
            <form onSubmit={handleAdjustPoolSubmit} className="flex gap-2 font-mono">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-3.5 text-slate-500 text-xs">$</span>
                <input
                  type="number"
                  placeholder="Allocate Aggregate Limit"
                  value={updatingBudgetAmount}
                  onChange={(e) => setUpdatingBudgetAmount(e.target.value)}
                  className="w-full text-xs bg-cyber-black border border-cyber-border rounded-xl pl-8 pr-4 py-3.5 text-slate-300 focus:outline-none focus:border-cyan-500/60 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-4 py-3 rounded-xl bg-cyan-500 text-cyber-black text-xs font-bold font-display uppercase tracking-wider transition-colors hover:bg-cyan-400"
              >
                APPLY
              </button>
            </form>
          </div>

          {/* Quick Metrics native bar summary */}
          <div className="rounded-2xl border border-cyber-border bg-cyber-card/15 p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <BarChart4 className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-semibold tracking-wider font-display text-slate-200">REVENUE BREAKDOWN BY SOURCE</h3>
            </div>
            {summary && (
              <div className="flex flex-col gap-4 font-mono text-[10px]">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>TICKET SALES REVENUE</span>
                    <span className="text-cyan-400 font-bold">${summary.ticketRevenue.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-cyber-border h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-cyan-400 h-full rounded-full"
                      style={{ width: `${summary.totalRevenue > 0 ? (summary.ticketRevenue / summary.totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>SOUVENIRS & MERCHANDISE REVENUE</span>
                    <span className="text-purple-400 font-bold">${summary.merchRevenue.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-cyber-border h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${summary.totalRevenue > 0 ? (summary.merchRevenue / summary.totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: User Security Rank Management Console (Column 7) */}
        <div className="lg:col-span-7 rounded-2xl border border-cyber-border bg-cyber-card/15 p-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-cyber-border/40 gap-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold tracking-wider font-display text-slate-200">USER RANK AUTH MANAGEMENT</h3>
            </div>
            
            <div className="relative w-full sm:max-w-[200px]">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Find users..."
                value={userSearchText}
                onChange={(e) => setUserSearchText(e.target.value)}
                className="w-full text-[10px] font-mono bg-cyber-black border border-cyber-border rounded-lg pl-8 pr-3 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500/40"
              />
            </div>
          </div>

          {/* User management list scrollbar container */}
          <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs font-mono">
                No users matched search criteria elements.
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div 
                  key={u.id}
                  className="p-3.5 bg-cyber-black rounded-xl border border-cyber-border/60 flex items-center justify-between gap-3 font-mono text-[10px]"
                >
                  <div className="flex flex-col gap-0.5 truncate">
                    <span className="text-slate-200 font-sans font-medium text-xs tracking-wide">{u.name}</span>
                    <span className="text-[10px] text-slate-500 truncate" title={u.email}>{u.email}</span>
                    <span className="text-[8px] text-slate-600 block">UID: {u.id}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-[8px] font-bold border rounded px-1.5 py-0.2 uppercase ${
                      u.role === "superadmin"
                        ? "border-rose-500/30 text-rose-400 bg-rose-950/10"
                        : u.role === "admin"
                        ? "border-cyan-500/30 text-cyan-400 bg-cyan-950/10"
                        : "border-slate-800 text-slate-400"
                    }`}>
                      {u.role}
                    </span>

                    {/* Quick role change actions */}
                    {u.role !== "superadmin" && (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-cyber-card border border-cyber-border text-slate-300 rounded font-mono text-[9px] p-1 focus:outline-none"
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Global Transaction History Logs (Full audit trailing metrics) */}
      <div className="rounded-2xl border border-cyber-border bg-cyber-card/15 p-5 flex flex-col gap-4">
        <div className="pb-3 border-b border-cyber-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold tracking-wider font-display text-slate-200">REALTIME TRANSACTION AUDIT STREAM</h3>
          </div>
          <button 
            onClick={loadFinancials}
            className="p-2 border border-cyber-border rounded hover:border-cyan-500/40 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Refer Transaction Log"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-[10px]">
            <thead>
              <tr className="border-b border-cyber-border text-slate-500 uppercase tracking-wider text-[9px]">
                <th className="py-2.5 px-3">Tx ID</th>
                <th className="py-2.5 px-3">Registrant</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Item details</th>
                <th className="py-2.5 px-3 text-right">Captured</th>
                <th className="py-2.5 px-3 text-center">Outcome</th>
                <th className="py-2.5 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40 text-slate-300">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs text-mono">
                    No transactions captured in administrative ledgers currently.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-cyber-card/25 transition-colors">
                    <td className="py-3 px-3 uppercase text-cyan-400 font-bold">#{tx.id}</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="text-slate-100 font-medium font-sans">{tx.userName}</span>
                        <span className="text-[9px] text-slate-500">{tx.userEmail}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 uppercase">
                      <span className={`text-[8px] font-bold border py-0.2 px-1 rounded ${
                        tx.type === "merchandise"
                          ? "border-purple-500/20 text-purple-400 bg-purple-950/10"
                          : "border-cyan-500/20 text-cyan-400 bg-cyan-950/10"
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-200 font-sans truncate max-w-[150px]" title={tx.itemName}>{tx.itemName}</td>
                    <td className="py-3 px-3 text-right text-slate-100 font-semibold">${tx.amount.toFixed(2)}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[8px] font-bold border py-0.5 px-1.5 rounded uppercase ${
                        tx.status === "success"
                          ? "border-emerald-500/30 text-emerald-400 bg-emerald-950/20"
                          : "border-rose-500/35 text-rose-400 bg-rose-950/20"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-555 text-[9px]">
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
