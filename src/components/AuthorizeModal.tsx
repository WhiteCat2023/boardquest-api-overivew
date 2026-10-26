import { useState, type FC, type ChangeEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Key, User } from 'lucide-react';

interface AuthorizeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
  onSaveToken: (token: string, roleName: string) => void;
  activeRole: string;
}

const PRESET_ACCOUNTS = [
  {
    role: "DEAN",
    label: "Dean of Medical Technology",
    email: "dean.medtech@swu.edu.ph",
    token: "mock_jwt_token_dean_swu_phinma_2026",
    badge: "Full Academic Access",
  },
  {
    role: "SUPERADMIN",
    label: "System SuperAdmin",
    email: "sysadmin@boardquest-medtech.ph",
    token: "mock_jwt_token_superadmin_root_2026",
    badge: "System Level Access",
  },
  {
    role: "TEAMLEAD",
    label: "Department Team Lead",
    email: "teamlead.chem@swu.edu.ph",
    token: "mock_jwt_token_teamlead_chem_2026",
    badge: "Subject Coordinator",
  },
  {
    role: "TEACHER",
    label: "Faculty Instructor",
    email: "faculty.hema@swu.edu.ph",
    token: "mock_jwt_token_teacher_hema_2026",
    badge: "Question Encoder",
  },
  {
    role: "REVIEW_CENTER_REPRESENTATIVE",
    label: "Review Center Partner",
    email: "rep@toprankreview.edu.ph",
    token: "mock_jwt_token_rc_partner_rep_2026",
    badge: "Partner Tenant Access",
  },
];

export const AuthorizeModal: FC<AuthorizeModalProps> = ({
  open,
  onOpenChange,
  token,
  onSaveToken,
  activeRole,
}) => {
  const [customToken, setCustomToken] = useState(token);

  const handleApplyPreset = (preset: typeof PRESET_ACCOUNTS[0]) => {
    setCustomToken(preset.token);
    onSaveToken(preset.token, preset.role);
    onOpenChange(false);
  };

  const handleSaveCustom = () => {
    onSaveToken(customToken, customToken ? "CUSTOM_TOKEN" : "PUBLIC");
    onOpenChange(false);
  };

  const handleClear = () => {
    setCustomToken("");
    onSaveToken("", "PUBLIC");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-zinc-800 bg-[#0c0c0e] text-zinc-100 p-6 shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight text-white">
                API Authentication & Authorize
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Configure Bearer authorization token to test protected endpoints with proper RBAC roles.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 my-2">
          {/* Quick Preset Selector */}
          <div className="space-y-2.5">
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span>Quick Role Presets</span>
              <span className="text-[10px] text-zinc-500 font-normal">One-click simulated credentials</span>
            </div>
            <div className="grid gap-2">
              {PRESET_ACCOUNTS.map((account) => {
                const isCurrent = activeRole === account.role;
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleApplyPreset(account)}
                    className={`flex items-center justify-between w-full p-2.5 rounded-lg border text-left transition-all gap-3 ${
                      isCurrent
                        ? "border-white/30 bg-white/5 text-white"
                        : "border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/60 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`p-1.5 rounded-md shrink-0 ${isCurrent ? "bg-white text-black" : "bg-zinc-900 text-zinc-400"}`}>
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-white flex items-center gap-1.5">
                          <span className="truncate">{account.label}</span>
                          {isCurrent && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-emerald-500/30 text-emerald-400 bg-emerald-500/10 shrink-0">
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono truncate">{account.email}</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-800 shrink-0 font-mono">
                      {account.role === 'REVIEW_CENTER_REPRESENTATIVE' ? 'RC_REPRESENTATIVE' : account.role}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Bearer Token */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <label htmlFor="custom-token-input" className="text-xs font-medium uppercase tracking-wider text-zinc-400 block">
              Custom Bearer Token
            </label>
            <div className="relative">
              <Input
                id="custom-token-input"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={customToken}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomToken(e.target.value)}
                className="font-mono text-xs bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-zinc-500"
              />
            </div>
            <p className="text-[11px] text-zinc-500">
              Header value applied to request executions: <span className="font-mono text-zinc-400">Authorization: Bearer &lt;token&gt;</span>
            </p>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between pt-2 border-t border-zinc-800/80">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          >
            Clear / Unauthorize
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveCustom}
              className="text-xs bg-white text-black hover:bg-zinc-200 font-medium"
            >
              Apply Token
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
