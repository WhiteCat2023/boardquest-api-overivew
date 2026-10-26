import { useState, useMemo, type ChangeEvent } from 'react';
import {
  API_SPEC_INFO,
  API_CATEGORIES,
  type HttpMethod,
} from './data/apiRoutesData';
import { EndpointCard } from './components/EndpointCard';
import { AuthorizeModal } from './components/AuthorizeModal';
import { SchemaViewer } from './components/SchemaViewer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Lock,
  Server,
  Layers,
  ChevronDown,
  ChevronUp,
  Shield,
  Database,
  X,
} from 'lucide-react';

export function App() {
  // Navigation Section Tab
  const [activeTab, setActiveTab] = useState<'admin' | 'review-center' | 'schema' | 'all'>('admin');

  // Server selection
  const [selectedServer, setSelectedServer] = useState(
    API_SPEC_INFO.servers.find((s) => s.id === 'local')?.url || API_SPEC_INFO.servers[0].url
  );

  // Authentication State
  const [authToken, setAuthToken] = useState('mock_jwt_token_dean_swu_phinma_2026');
  const [activeRole, setActiveRole] = useState('DEAN');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<HttpMethod | 'ALL'>('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

  // Expanded categories state
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    auth: true,
    questions: true,
    students: true,
    'rc-auth': true,
    'rc-assessments': true,
  });

  // Global expand/collapse
  const [globalExpanded, setGlobalExpanded] = useState<boolean | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    API_CATEGORIES.forEach((c) => {
      allExpanded[c.id] = true;
    });
    setExpandedCategories(allExpanded);
    setGlobalExpanded(true);
  };

  const handleCollapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    API_CATEGORIES.forEach((c) => {
      allCollapsed[c.id] = false;
    });
    setExpandedCategories(allCollapsed);
    setGlobalExpanded(false);
  };

  // Filter Categories & Endpoints
  const filteredCategories = useMemo(() => {
    return API_CATEGORIES.filter((category) => {
      if (activeTab === 'admin' && category.section !== 'admin') return false;
      if (activeTab === 'review-center' && category.section !== 'review-center') return false;
      return true;
    })
      .map((category) => {
        const filteredEndpoints = category.endpoints.filter((endpoint) => {
          // Method filter
          if (selectedMethod !== 'ALL' && endpoint.method !== selectedMethod) return false;

          // Role filter
          if (selectedRoleFilter !== 'ALL') {
            if (!endpoint.roles.includes(selectedRoleFilter as any)) return false;
          }

          // Search query filter
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchesPath = endpoint.path.toLowerCase().includes(query);
            const matchesSummary = endpoint.summary.toLowerCase().includes(query);
            const matchesDesc = endpoint.description.toLowerCase().includes(query);
            const matchesMethod = endpoint.method.toLowerCase().includes(query);
            if (!matchesPath && !matchesSummary && !matchesDesc && !matchesMethod) {
              return false;
            }
          }

          return true;
        });

        return {
          ...category,
          endpoints: filteredEndpoints,
        };
      })
      .filter((category) => category.endpoints.length > 0);
  }, [activeTab, selectedMethod, selectedRoleFilter, searchQuery]);

  // Total endpoint count
  const totalEndpointsCount = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.endpoints.length, 0);
  }, [filteredCategories]);

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans selection:bg-white/20 selection:text-white">
      {/* ── TOP HERO HEADER (Referenced from Screenshot) ── */}
      <header className="border-b border-zinc-800/80 bg-[#0a0a0d] px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase font-semibold">
                SWU PHINMA MEDICAL TECHNOLOGY
              </span>
              <span className="text-zinc-600">•</span>
              <span className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase font-semibold">
                BOARDQUEST PLATFORM
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              API documentation
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl">
              Browse the official RESTful endpoint specifications and live SSE event streams. Interactive requests can be simulated directly with simulated role-based access tokens.
            </p>
          </div>

          {/* Navigation Category Switcher Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              Admin API routes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('review-center')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'review-center'
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              Review Center API routes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schema')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'schema'
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Database className="h-3 w-3" />
              Prisma & MongoDB schema
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              All routes master spec
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 space-y-6">
        {activeTab === 'schema' ? (
          <SchemaViewer />
        ) : (
          <>
            {/* ── SWAGGER / OAS INFO CARD ── */}
            <div className="rounded-xl border border-zinc-800 bg-[#0c0c0f] p-5 sm:p-6 space-y-4 shadow-xl shadow-black/40">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                      {API_SPEC_INFO.title}
                    </h2>
                    <Badge variant="secondary" className="font-mono text-[10px] bg-zinc-800 text-zinc-200 border-zinc-700">
                      v{API_SPEC_INFO.version}
                    </Badge>
                    <Badge variant="outline" className="font-mono text-[10px] border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
                      OAS {API_SPEC_INFO.oasVersion}
                    </Badge>
                    <Badge variant="outline" className="font-mono text-[10px] border-sky-500/40 text-sky-400 bg-sky-500/10">
                      Express 5.2
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">
                    {API_SPEC_INFO.description}
                  </p>
                </div>

                {/* Authorize Button */}
                <Button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className={`shrink-0 text-xs font-semibold gap-2 border transition-all ${
                    authToken
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Lock className={`h-3.5 w-3.5 ${authToken ? 'text-emerald-400' : 'text-zinc-400'}`} />
                  <span>Authorize</span>
                  {activeRole && (
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-white">
                      {activeRole}
                    </span>
                  )}
                </Button>
              </div>

              {/* Server Selector Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-mono text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <Server className="h-3.5 w-3.5" /> Servers:
                  </span>
                  <select
                    value={selectedServer}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedServer(e.target.value)}
                    className="h-8 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 font-mono text-xs text-zinc-300 outline-none hover:border-zinc-700 focus:border-zinc-500"
                  >
                    {API_SPEC_INFO.servers.map((s) => (
                      <option key={s.id} value={s.url}>
                        {s.url} — {s.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-2">
                  <span>Base Prefix:</span>
                  <span className="text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    /api/v1
                  </span>
                </div>
              </div>
            </div>

            {/* ── SEARCH & FILTER TOOLBAR ── */}
            <div className="rounded-xl border border-zinc-800 bg-[#0c0c0f] p-4 space-y-3 shadow-md">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative w-full sm:flex-1">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <Input
                    placeholder="Search endpoints, paths, descriptions (e.g. /questions, auth, scores)..."
                    value={searchQuery}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-8 text-xs bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-zinc-600 h-9"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Role Filter */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-zinc-500 text-[11px] font-mono shrink-0 flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Role:
                  </span>
                  <select
                    value={selectedRoleFilter}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedRoleFilter(e.target.value)}
                    className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-2 font-mono text-xs text-zinc-300 outline-none hover:border-zinc-700"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="PUBLIC">PUBLIC</option>
                    <option value="TEACHER">TEACHER</option>
                    <option value="TEAMLEAD">TEAMLEAD</option>
                    <option value="DEAN">DEAN</option>
                    <option value="SUPERADMIN">SUPERADMIN</option>
                    <option value="REVIEW_CENTER_REPRESENTATIVE">REVIEW_CENTER_REPRESENTATIVE</option>
                  </select>
                </div>
              </div>

              {/* Method Filter Buttons & Expand Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/60">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-zinc-500 font-mono mr-1">Method:</span>
                  {(['ALL', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const).map((method) => {
                    const isSelected = selectedMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setSelectedMethod(method)}
                        className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all ${
                          isSelected
                            ? method === 'ALL'
                              ? 'bg-white text-black border-white'
                              : method === 'GET'
                              ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                              : method === 'POST'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : method === 'PUT'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : method === 'PATCH'
                              ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : 'border-zinc-800/80 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-zinc-500">
                    Showing <span className="text-white font-semibold">{totalEndpointsCount}</span> endpoints
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={handleExpandAll}
                      className="text-[11px] text-zinc-400 hover:text-white h-7 gap-1"
                    >
                      <ChevronDown className="h-3 w-3" /> Expand All
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={handleCollapseAll}
                      className="text-[11px] text-zinc-400 hover:text-white h-7 gap-1"
                    >
                      <ChevronUp className="h-3 w-3" /> Collapse All
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── API CATEGORIES & ENDPOINTS LIST ── */}
            <div className="space-y-6">
              {filteredCategories.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-[#0c0c0f] p-12 text-center space-y-3">
                  <Layers className="h-10 w-10 text-zinc-600 mx-auto" />
                  <h3 className="text-base font-semibold text-white">No endpoints match your filter</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Try adjusting your search query, selecting "ALL" methods, or resetting the role filter.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedMethod('ALL');
                      setSelectedRoleFilter('ALL');
                    }}
                    className="text-xs border-zinc-800 text-zinc-300 hover:bg-zinc-900"
                  >
                    Reset All Filters
                  </Button>
                </div>
              ) : (
                filteredCategories.map((category) => {
                  const isCatExpanded = expandedCategories[category.id] ?? true;
                  return (
                    <div
                      key={category.id}
                      className="rounded-xl border border-zinc-800/90 bg-[#0a0a0d] overflow-hidden shadow-lg shadow-black/30"
                    >
                      {/* Category Header Bar */}
                      <button
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className="w-full flex items-center justify-between p-4 bg-zinc-950/80 hover:bg-zinc-900/60 border-b border-zinc-800/60 transition-colors text-left"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                              {category.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] border-zinc-800 bg-zinc-900 text-zinc-400"
                            >
                              {category.basePath}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="text-[10px] bg-white/10 text-zinc-300 font-mono"
                            >
                              {category.endpoints.length} {category.endpoints.length === 1 ? 'endpoint' : 'endpoints'}
                            </Badge>
                          </div>
                          <p className="text-xs text-zinc-400">{category.description}</p>
                        </div>
                        <div className="text-zinc-500 hover:text-white p-1">
                          {isCatExpanded ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </div>
                      </button>

                      {/* Endpoints List */}
                      {isCatExpanded && (
                        <div className="p-3 sm:p-4 space-y-3 bg-[#08080a]">
                          {category.endpoints.map((endpoint) => (
                            <EndpointCard
                              key={endpoint.id}
                              endpoint={endpoint}
                              serverUrl={selectedServer}
                              authToken={authToken}
                              activeRole={activeRole}
                              isExpanded={globalExpanded !== null ? globalExpanded : undefined}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-800/80 bg-[#0a0a0d] py-6 px-4 text-center text-xs text-zinc-500 space-y-2 mt-12">
        <div className="flex items-center justify-center gap-2 font-mono text-[11px]">
          <span>BoardQuest Medical Technology Board Review Platform</span>
          <span>•</span>
          <span>SWU PHINMA</span>
          <span>•</span>
          <span className="text-zinc-400">OpenAPI Spec v3.1</span>
        </div>
        <p className="text-[10px] text-zinc-600">
          All endpoints protected by Argon2id password hashing, JWT asymmetric verification, rate limiting, and RBAC authorization middleware.
        </p>
      </footer>

      {/* ── AUTHORIZE TOKEN MODAL ── */}
      <AuthorizeModal
        open={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        token={authToken}
        activeRole={activeRole}
        onSaveToken={(token, role) => {
          setAuthToken(token);
          setActiveRole(role);
        }}
      />
    </div>
  );
}

export default App;
