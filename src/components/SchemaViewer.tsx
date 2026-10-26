import { useState, useMemo, type FC, type ChangeEvent } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Database,
  Search,
  Copy,
  Check,
  Key,
  Layers,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Building2,
  FileCode2,
  Tag
} from 'lucide-react';
import {
  PRISMA_MODELS,
  PRISMA_ENUMS,
  type SchemaModel,
  type SchemaEnum,
  type SchemaCategory,
  type SchemaField
} from '../data/prismaSchemaData';

const CATEGORIES: { id: SchemaCategory; label: string; icon: FC<{ className?: string }> }[] = [
  { id: 'All', label: 'All Models', icon: Layers },
  { id: 'Admin & Faculty', label: 'Admin & Faculty', icon: ShieldCheck },
  { id: 'Question Bank & AI', label: 'Question Bank & AI', icon: Sparkles },
  { id: 'Review Center', label: 'Review Center', icon: Building2 },
  { id: 'Student & Learning', label: 'Student & Learning', icon: GraduationCap },
  { id: 'Gamification & Integrity', label: 'Gamification & Integrity', icon: Database },
  { id: 'Enums & Types', label: 'Enums & Types', icon: Tag },
];

export const SchemaViewer: FC = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SchemaCategory>('All');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredModels = useMemo(() => {
    if (selectedCategory === 'Enums & Types') return [];

    return PRISMA_MODELS.filter((model: SchemaModel) => {
      const matchesCategory =
        selectedCategory === 'All' || (model.category as string) === selectedCategory;
      if (!matchesCategory) return false;

      if (!search.trim()) return true;

      const q = search.toLowerCase();
      const matchesName = model.name.toLowerCase().includes(q);
      const matchesDesc = model.description.toLowerCase().includes(q);
      const matchesField = model.fields.some(
        (f: SchemaField) =>
          f.name.toLowerCase().includes(q) ||
          f.type.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q)
      );
      return matchesName || matchesDesc || matchesField;
    });
  }, [search, selectedCategory]);

  const filteredEnums = useMemo(() => {
    if (selectedCategory !== 'All' && selectedCategory !== 'Enums & Types' && !search.trim()) {
      return [];
    }
    return PRISMA_ENUMS.filter((e: SchemaEnum) => {
      if (!search.trim()) return selectedCategory === 'Enums & Types' || selectedCategory === 'All';
      const q = search.toLowerCase();
      const matchesName = e.name.toLowerCase().includes(q);
      const matchesDesc = e.description.toLowerCase().includes(q);
      const matchesVal = e.values.some(
        (v) => v.name.toLowerCase().includes(q) || (v.description && v.description.toLowerCase().includes(q))
      );
      return matchesName || matchesDesc || matchesVal;
    });
  }, [search, selectedCategory]);

  const handleCopyModelDSL = (model: SchemaModel) => {
    const lines = [
      `model ${model.name} {`,
      ...model.fields.map((f: SchemaField) => {
        let fieldDef = `  ${f.name.padEnd(24)} ${f.type}`;
        if (f.isId) fieldDef += ' @id @default(auto()) @map("_id") @db.ObjectId';
        else if (f.isUnique) fieldDef += ' @unique';
        if (f.defaultValue) fieldDef += ` @default(${f.defaultValue})`;
        return fieldDef;
      }),
      ...(model.collectionName ? [`  @@map("${model.collectionName}")`] : []),
      `}`
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedKey(model.name);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyEnumDSL = (enumItem: SchemaEnum) => {
    const text = `enum ${enumItem.name} {\n${enumItem.values.map((v) => `  ${v.name}`).join('\n')}\n}`;
    navigator.clipboard.writeText(text);
    setCopiedKey(enumItem.name);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAllModels = () => {
    const allDsl = PRISMA_MODELS.map((m: SchemaModel) => {
      return `model ${m.name} {\n${m.fields
        .map((f: SchemaField) => {
          let fieldDef = `  ${f.name.padEnd(24)} ${f.type}`;
          if (f.isId) fieldDef += ' @id @default(auto()) @map("_id") @db.ObjectId';
          else if (f.isUnique) fieldDef += ' @unique';
          if (f.defaultValue) fieldDef += ` @default(${f.defaultValue})`;
          return fieldDef;
        })
        .join('\n')}\n${m.collectionName ? `  @@map("${m.collectionName}")\n` : ''}}`;
    }).join('\n\n');

    navigator.clipboard.writeText(allDsl);
    setCopiedKey('ALL_MODELS');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-zinc-300" />
            <h3 className="text-xl font-semibold text-white tracking-tight">
              MongoDB & Prisma Data Models
            </h3>
            <Badge variant="outline" className="text-xs bg-zinc-900 border-zinc-700 text-zinc-300 font-mono">
              36 Models • 11 Enums
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Live schema representation of <code className="text-zinc-300 font-mono">capstone/apps/api/prisma/schema.prisma</code> powered by Prisma Client & MongoDB ObjectIDs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <Input
              placeholder="Search models, fields, types, or enums..."
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="pl-8 text-xs bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAllModels}
            className="text-xs h-9 bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 shrink-0 gap-1.5"
            title="Copy all models in Prisma DSL format"
          >
            {copiedKey === 'ALL_MODELS' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Copied All</span>
              </>
            ) : (
              <>
                <FileCode2 className="h-3.5 w-3.5 text-zinc-400" />
                <span>Copy All DSL</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-900">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          let count = 0;
          if (cat.id === 'All') count = PRISMA_MODELS.length;
          else if (cat.id === 'Enums & Types') count = PRISMA_ENUMS.length;
          else count = PRISMA_MODELS.filter((m: SchemaModel) => m.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800/80'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-zinc-300 text-zinc-900' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Models List */}
      {selectedCategory !== 'Enums & Types' && (
        <div className="grid gap-6">
          {filteredModels.map((model: SchemaModel) => (
            <Card key={model.name} className="border-zinc-800 bg-[#0d0d10] text-zinc-200 shadow-sm">
              <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-zinc-800/80">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base font-semibold text-white font-mono tracking-tight">
                      {model.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] bg-zinc-900 border-zinc-800 text-zinc-300">
                      {model.category}
                    </Badge>
                    {model.collectionName && (
                      <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/30 text-amber-300 font-mono">
                        collection: @map("{model.collectionName}")
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] bg-zinc-900/80 border-zinc-800 text-zinc-500 font-mono">
                      {model.fields.length} fields
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-zinc-400">
                    {model.description}
                  </CardDescription>
                </div>

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => handleCopyModelDSL(model)}
                  className="text-[11px] h-7 self-start text-zinc-400 hover:text-white gap-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"
                >
                  {copiedKey === model.name ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Prisma DSL
                    </>
                  )}
                </Button>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800/80 bg-zinc-900/40 font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                        <th className="py-2.5 px-4">Field Name</th>
                        <th className="py-2.5 px-4">Prisma Type</th>
                        <th className="py-2.5 px-4">Constraints</th>
                        <th className="py-2.5 px-4">Default</th>
                        <th className="py-2.5 px-4">Documentation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                      {model.fields.map((field: SchemaField) => (
                        <tr key={field.name} className="hover:bg-zinc-900/30 transition-colors">
                          <td className="py-2.5 px-4 font-semibold text-white">
                            <div className="flex items-center gap-1.5">
                              {field.isId && <Key className="h-3 w-3 text-amber-400 shrink-0" />}
                              <span>{field.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-sky-400 font-mono">
                            {field.type}
                          </td>
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              {field.isRequired ? (
                                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                                  Required
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] border-zinc-800 text-zinc-500">
                                  Optional
                                </Badge>
                              )}
                              {field.isUnique && (
                                <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400 bg-purple-500/5">
                                  @unique
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-zinc-400 font-mono text-[11px]">
                            {field.defaultValue ? (
                              <code className="text-zinc-300 bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">
                                {field.defaultValue}
                              </code>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 font-sans text-zinc-300 max-w-md">
                            {field.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredModels.length === 0 && (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg">
              <Database className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-400 font-medium">No Prisma models match your search query</p>
              <p className="text-xs text-zinc-600 mt-1">Try clearing your search filters</p>
            </div>
          )}
        </div>
      )}

      {/* Enums Section */}
      {(selectedCategory === 'Enums & Types' || (selectedCategory === 'All' && filteredEnums.length > 0)) && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h4 className="text-base font-semibold text-white flex items-center gap-2">
              <Tag className="h-4 w-4 text-zinc-400" />
              Prisma Enums & Scalar Value Types ({filteredEnums.length})
            </h4>
            <span className="text-xs text-zinc-500">Allowed database enumerations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEnums.map((e: SchemaEnum) => (
              <Card key={e.name} className="border-zinc-800 bg-[#0d0d10] text-zinc-200">
                <CardHeader className="flex flex-row items-start justify-between pb-2 border-b border-zinc-800/60">
                  <div>
                    <CardTitle className="text-sm font-semibold text-white font-mono flex items-center gap-2">
                      <span className="text-amber-400">enum</span> {e.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-400 pt-1">
                      {e.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleCopyEnumDSL(e)}
                    className="text-[10px] h-6 text-zinc-400 hover:text-white gap-1 bg-zinc-900 border border-zinc-800 shrink-0"
                  >
                    {copiedKey === e.name ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> DSL
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="space-y-2">
                    {e.values.map((v) => (
                      <div key={v.name} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-xs">
                        <Badge variant="outline" className="w-fit text-[11px] font-mono bg-zinc-900 border-zinc-800 text-sky-300">
                          {v.name}
                        </Badge>
                        {v.description && (
                          <span className="text-zinc-400 text-[11px] text-right font-sans">
                            {v.description}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
