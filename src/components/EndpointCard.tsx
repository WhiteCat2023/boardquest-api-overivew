import { useState, type FC } from 'react';
import type { ApiEndpoint, HttpMethod, UserRole } from '../data/apiRoutesData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  Copy,
  Check,
  Send,
  Code2,
  Terminal,
  Clock,
  Shield,
  FileJson,
  Layers,
} from 'lucide-react';

interface EndpointCardProps {
  endpoint: ApiEndpoint;
  serverUrl: string;
  authToken: string;
  activeRole: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const EndpointCard: FC<EndpointCardProps> = ({
  endpoint,
  serverUrl,
  authToken,
  activeRole,
  isExpanded = false,
  onToggleExpand,
}) => {
  const [expanded, setExpanded] = useState(isExpanded);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeCodeLang, setActiveCodeLang] = useState<'curl' | 'js' | 'axios' | 'python'>('curl');
  
  // Try it out simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    status: number;
    timeMs: number;
    data: any;
  } | null>(null);

  const toggle = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setExpanded(!expanded);
    }
  };

  const currentExpanded = onToggleExpand ? isExpanded : expanded;

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getMethodBadgeStyle = (method: HttpMethod) => {
    switch (method) {
      case 'GET':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'POST':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'PUT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'PATCH':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  const getMethodContainerBorder = (method: HttpMethod) => {
    switch (method) {
      case 'GET':
        return 'border-sky-500/20 hover:border-sky-500/40';
      case 'POST':
        return 'border-emerald-500/20 hover:border-emerald-500/40';
      case 'PUT':
        return 'border-amber-500/20 hover:border-amber-500/40';
      case 'PATCH':
        return 'border-purple-500/20 hover:border-purple-500/40';
      case 'DELETE':
        return 'border-rose-500/20 hover:border-rose-500/40';
    }
  };

  const generateCodeSnippet = (lang: 'curl' | 'js' | 'axios' | 'python') => {
    const fullUrl = `${serverUrl.replace(/\/$/, '')}${endpoint.path.replace(/^\/api\/v1/, '')}`;
    const headers = endpoint.authRequired
      ? `  -H "Authorization: Bearer ${authToken || '<ACCESS_TOKEN>'}" \\\n  -H "Content-Type: application/json"`
      : `  -H "Content-Type: application/json"`;

    const bodyJson = endpoint.requestBody
      ? JSON.stringify(endpoint.requestBody.example, null, 2)
      : null;

    switch (lang) {
      case 'curl':
        return `curl -X ${endpoint.method} "${fullUrl}" \\\n${headers}${
          bodyJson ? ` \\\n  -d '${JSON.stringify(endpoint.requestBody?.example)}'` : ''
        }`;
      case 'js':
        return `const response = await fetch("${fullUrl}", {
  method: "${endpoint.method}",
  headers: {
    "Content-Type": "application/json",${
      endpoint.authRequired ? `\n    "Authorization": "Bearer ${authToken || '<ACCESS_TOKEN>'}"` : ''
    }
  }${bodyJson ? `,\n  body: JSON.stringify(${bodyJson})` : ''}
});
const data = await response.json();
console.log(data);`;
      case 'axios':
        return `import axios from 'axios';

const { data } = await axios({
  method: '${endpoint.method.toLowerCase()}',
  url: '${fullUrl}',${
          endpoint.authRequired
            ? `\n  headers: { Authorization: 'Bearer ${authToken || '<ACCESS_TOKEN>'}' },`
            : ''
        }${bodyJson ? `\n  data: ${bodyJson}` : ''}
});
console.log(data);`;
      case 'python':
        return `import requests

url = "${fullUrl}"
headers = {
    "Content-Type": "application/json",${
      endpoint.authRequired ? `\n    "Authorization": "Bearer ${authToken || '<ACCESS_TOKEN>'}"` : ''
    }
}
${bodyJson ? `payload = ${bodyJson}\n` : ''}
response = requests.request("${endpoint.method}", url, headers=headers${
          bodyJson ? ', json=payload' : ''
        })
print(response.json())`;
    }
  };

  const handleSimulateRequest = () => {
    setIsSimulating(true);
    setSimulationResult(null);

    // Realistic network simulation with latency and role check
    setTimeout(() => {
      const isAuthorized =
        !endpoint.authRequired ||
        endpoint.roles.includes('PUBLIC') ||
        endpoint.roles.includes(activeRole as UserRole) ||
        activeRole === 'SUPERADMIN';

      if (endpoint.authRequired && !authToken) {
        setSimulationResult({
          status: 401,
          timeMs: Math.floor(Math.random() * 20) + 15,
          data: {
            success: false,
            statusCode: 401,
            message: "Unauthorized: Missing Bearer Token. Click 'Authorize' at the top to configure.",
            error: "UNAUTHORIZED",
          },
        });
      } else if (endpoint.authRequired && !isAuthorized) {
        setSimulationResult({
          status: 403,
          timeMs: Math.floor(Math.random() * 25) + 20,
          data: {
            success: false,
            statusCode: 403,
            message: `Forbidden: Current role (${activeRole}) does not have required permissions: [${endpoint.roles.join(', ')}]`,
            error: "INSUFFICIENT_PRIVILEGES",
          },
        });
      } else {
        const successResponse = endpoint.responses.find(
          (r) => r.statusCode >= 200 && r.statusCode < 300
        );
        setSimulationResult({
          status: successResponse ? successResponse.statusCode : 200,
          timeMs: Math.floor(Math.random() * 45) + 35,
          data: successResponse?.example || { success: true, message: "Execution simulated successfully" },
        });
      }
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div
      className={`rounded-lg border bg-[#0d0d10] transition-all overflow-hidden ${getMethodContainerBorder(
        endpoint.method
      )} ${currentExpanded ? 'shadow-lg shadow-black/40 ring-1 ring-white/10' : ''}`}
    >
      {/* Header bar (clickable) */}
      <div
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        className="flex items-center justify-between p-3 cursor-pointer select-none gap-3 hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Method Badge */}
          <span
            className={`font-mono text-[11px] font-bold px-2.5 py-1 rounded-md border tracking-wider shrink-0 ${getMethodBadgeStyle(
              endpoint.method
            )}`}
          >
            {endpoint.method}
          </span>

          {/* Endpoint Path */}
          <span className="font-mono text-xs sm:text-sm font-medium text-white truncate">
            {endpoint.path}
          </span>

          {/* Endpoint Summary */}
          <span className="text-xs text-zinc-400 hidden md:inline truncate">
            — {endpoint.summary}
          </span>
        </div>

        {/* Badges & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Roles requirement badge */}
          <div className="hidden lg:flex items-center gap-1">
            {endpoint.roles.slice(0, 2).map((role) => (
              <Badge
                key={role}
                variant="outline"
                className="text-[10px] font-mono px-1.5 py-0 border-zinc-800 bg-zinc-950 text-zinc-400"
              >
                {role}
              </Badge>
            ))}
            {endpoint.roles.length > 2 && (
              <Badge
                variant="outline"
                className="text-[10px] font-mono px-1.5 py-0 border-zinc-800 bg-zinc-950 text-zinc-500"
              >
                +{endpoint.roles.length - 2}
              </Badge>
            )}
          </div>

          {/* Auth indicator */}
          {endpoint.authRequired ? (
            <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded">
              <Lock className="h-3 w-3 text-amber-400/80" />
              <span className="hidden sm:inline">Protected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded">
              <Unlock className="h-3 w-3 text-emerald-400/80" />
              <span className="hidden sm:inline">Public</span>
            </div>
          )}

          {/* Chevron */}
          <div className="text-zinc-500 hover:text-zinc-300 p-1">
            {currentExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details Body */}
      {currentExpanded && (
        <div className="border-t border-zinc-800/80 bg-[#09090b] p-4 sm:p-5 space-y-5 text-zinc-300 text-xs">
          {/* Description & Authorization Specs */}
          <div className="space-y-3">
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
              {endpoint.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-zinc-400" />
                  Access & Required Roles
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {endpoint.roles.map((r) => (
                    <Badge
                      key={r}
                      variant="secondary"
                      className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono"
                    >
                      {r}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-zinc-400" />
                  Target Server Endpoint
                </div>
                <div className="font-mono text-xs text-white truncate pt-1">
                  {serverUrl.replace(/\/$/, '')}
                  <span className="text-zinc-400">{endpoint.path.replace(/^\/api\/v1/, '')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Parameters Table */}
          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-zinc-400" />
                Parameters
              </h4>
              <div className="rounded-lg border border-zinc-800 overflow-x-auto bg-zinc-950">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/60 text-[11px] uppercase font-mono text-zinc-400">
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">In</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Required</th>
                      <th className="py-2 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 font-mono text-[11px]">
                    {endpoint.parameters.map((p) => (
                      <tr key={p.name} className="hover:bg-zinc-900/30">
                        <td className="py-2.5 px-3 font-semibold text-white">{p.name}</td>
                        <td className="py-2.5 px-3 text-zinc-400">{p.in}</td>
                        <td className="py-2.5 px-3 text-sky-400">{p.type}</td>
                        <td className="py-2.5 px-3">
                          {p.required ? (
                            <span className="text-rose-400 font-bold">required</span>
                          ) : (
                            <span className="text-zinc-500">optional</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-zinc-300">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Request Body Section */}
          {endpoint.requestBody && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <FileJson className="h-3.5 w-3.5 text-zinc-400" />
                  Request Body ({endpoint.requestBody.contentType})
                </h4>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(endpoint.requestBody?.example, null, 2),
                      `req-${endpoint.id}`
                    )
                  }
                  className="h-6 text-[11px] gap-1 text-zinc-400 hover:text-white"
                >
                  {copiedSection === `req-${endpoint.id}` ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy JSON
                    </>
                  )}
                </Button>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs overflow-x-auto text-emerald-300">
                <pre>{JSON.stringify(endpoint.requestBody.example, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Responses Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Responses
            </h4>
            <div className="space-y-2">
              {endpoint.responses.map((resp) => {
                const is2xx = resp.statusCode >= 200 && resp.statusCode < 300;
                const is4xx = resp.statusCode >= 400 && resp.statusCode < 500;
                return (
                  <div
                    key={resp.statusCode}
                    className="rounded-lg border border-zinc-800/80 bg-zinc-950 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/60 bg-zinc-900/40">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                            is2xx
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : is4xx
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {resp.statusCode}
                        </span>
                        <span className="font-medium text-xs text-zinc-200">
                          {resp.description}
                        </span>
                      </div>
                      {resp.example && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() =>
                            copyToClipboard(
                              JSON.stringify(resp.example, null, 2),
                              `resp-${endpoint.id}-${resp.statusCode}`
                            )
                          }
                          className="h-5 text-[10px] text-zinc-400 hover:text-white"
                        >
                          {copiedSection === `resp-${endpoint.id}-${resp.statusCode}` ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                    {resp.example && (
                      <div className="p-3 font-mono text-xs overflow-x-auto text-zinc-300 bg-black/40">
                        <pre>{JSON.stringify(resp.example, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Code Generator & Try It Out */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Client Code Generator
                </span>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                {(['curl', 'js', 'axios', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveCodeLang(lang)}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-all ${
                      activeCodeLang === lang
                        ? 'bg-white text-black font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {lang === 'js' ? 'Fetch (JS)' : lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Code Area */}
            <div className="relative rounded-md border border-zinc-800/80 bg-black/70 p-3 font-mono text-xs text-zinc-300 overflow-x-auto">
              <Button
                variant="ghost"
                size="xs"
                onClick={() =>
                  copyToClipboard(generateCodeSnippet(activeCodeLang), `code-${endpoint.id}`)
                }
                className="absolute top-2 right-2 h-6 text-[10px] gap-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300"
              >
                {copiedSection === `code-${endpoint.id}` ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copy
                  </>
                )}
              </Button>
              <pre className="pr-14">{generateCodeSnippet(activeCodeLang)}</pre>
            </div>

            {/* Execute Request Simulation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <div className="text-[11px] text-zinc-500 font-mono">
                Active Role: <span className="text-zinc-300 font-semibold">{activeRole}</span> • Token:{' '}
                <span className="text-zinc-300 font-semibold">
                  {authToken ? 'Attached' : 'None (Public)'}
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleSimulateRequest}
                disabled={isSimulating}
                className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black font-semibold text-xs gap-1.5 shadow-md"
              >
                {isSimulating ? (
                  <>
                    <Clock className="h-3.5 w-3.5 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Simulate Request
                  </>
                )}
              </Button>
            </div>

            {/* Simulation Response Output */}
            {simulationResult && (
              <div className="rounded-lg border border-zinc-800 bg-black p-3.5 space-y-2 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-400 font-mono">Simulated Response</span>
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        simulationResult.status >= 200 && simulationResult.status < 300
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {simulationResult.status}{' '}
                      {simulationResult.status === 200
                        ? 'OK'
                        : simulationResult.status === 201
                        ? 'Created'
                        : simulationResult.status === 401
                        ? 'Unauthorized'
                        : simulationResult.status === 403
                        ? 'Forbidden'
                        : 'Error'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500">
                    <Clock className="h-3 w-3" />
                    {simulationResult.timeMs}ms
                  </div>
                </div>
                <div className="font-mono text-xs overflow-x-auto text-zinc-200 pt-1">
                  <pre>{JSON.stringify(simulationResult.data, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
