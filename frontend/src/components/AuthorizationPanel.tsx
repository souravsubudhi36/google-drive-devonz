import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronDown, ChevronUp, Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import { getCurrentUserId } from '../api/client';

interface AuthorizationPanelProps {
  users: { id: string; name: string; avatar: string }[];
}

interface CheckResult {
  userId: string;
  relation: string;
  object: string;
  allowed: boolean;
}

export default function AuthorizationPanel({ users }: AuthorizationPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [checkUser, setCheckUser] = useState('');
  const [checkRelation, setCheckRelation] = useState('can_view');
  const [checkObject, setCheckObject] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [checking, setChecking] = useState(false);

  const relations = ['owner', 'editor', 'viewer', 'can_view', 'can_edit', 'can_delete'];

  async function handleCheck() {
    if (!checkUser || !checkObject) return;
    setChecking(true);
    try {
      // We'll test by making a request as the selected user
      const res = await fetch(`/api/documents/${checkObject}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': checkUser,
        },
      });
      const allowed = res.ok;
      setResult({ userId: checkUser, relation: checkRelation, object: checkObject, allowed });
    } catch {
      setResult({ userId: checkUser, relation: checkRelation, object: checkObject, allowed: false });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">Authorization Tester</p>
            <p className="text-[11px] text-neutral-500">Test OpenFGA permission checks</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-3 border-t border-white/[0.04] pt-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">User</label>
                  <select
                    value={checkUser}
                    onChange={e => setCheckUser(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none appearance-none"
                  >
                    <option value="" className="bg-surface-300">Select...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id} className="bg-surface-300">{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Relation</label>
                  <select
                    value={checkRelation}
                    onChange={e => setCheckRelation(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none appearance-none"
                  >
                    {relations.map(r => (
                      <option key={r} value={r} className="bg-surface-300">{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Object ID</label>
                  <input
                    value={checkObject}
                    onChange={e => setCheckObject(e.target.value)}
                    placeholder="doc:arch-overview"
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleCheck}
                disabled={!checkUser || !checkObject || checking}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-30"
              >
                {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                Check Permission
              </button>

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                    result.allowed
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}
                >
                  {result.allowed ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>
                    <strong>{users.find(u => u.id === result.userId)?.name}</strong>
                    {result.allowed ? ' has ' : ' does NOT have '}
                    <code className="px-1 py-0.5 rounded bg-white/[0.06]">{result.relation}</code>
                    {' on '}
                    <code className="px-1 py-0.5 rounded bg-white/[0.06]">{result.object}</code>
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
