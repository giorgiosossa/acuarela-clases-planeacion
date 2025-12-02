import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    ChevronsUpDown,
    Clock,
    Loader2,
    Plus,
    Sparkles,
    Trash2,
    UserPlus,
    X,
    Activity,
    Timer,
    Box,
    Eye,
    User,
    AlertCircle,
    FileText,
    History,
    Calendar,
    ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ClassStage {
    etapa: string;
    descripcion: string;
    organizacion: string;
    material: string;
    tiempo_minutos: number;
    intensidad: 'BAJA' | 'MEDIA' | 'ALTA';
}

interface ClassPlan {
    stages: ClassStage[];
}

interface ClassGeneration {
    id: number;
    created_at: string;
    content: ClassPlan;
    status: string;
}

interface Skill {
    id: number;
    name: string;
    index: number;
    level_id: number;
}

interface Swimmer {
    id: number;
    name: string;
    skill_id: number;
    group_id: number;
    currentSkill: Skill;
    observations?: string;
}

interface Level {
    id: number;
    name: string;
}

interface Group {
    id: number;
    hour_start: string;
    days: string;
    note: string;
    level_id: number;
    level: Level;
    swimmers: Swimmer[];
    generations: ClassGeneration[];
}

interface Props {
    day: string;
    groups: Group[];
    levels: Level[];
}

const DAYS_OPTIONS = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Especial',
];

export default function Day({ day, groups: initialGroups, levels }: Props) {
    const [groups, setGroups] = useState<Group[]>(
        [...initialGroups].sort((a, b) =>
            a.hour_start.localeCompare(b.hour_start),
        ),
    );
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const [isCreateSwimmerModalOpen, setIsCreateSwimmerModalOpen] =
        useState(false);
    const [isDaysPopoverOpen, setIsDaysPopoverOpen] = useState(false);
    const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);
    const [levelSkills, setLevelSkills] = useState<Skill[]>([]);

    const [isCreateClassModalOpen, setIsCreateClassModalOpen] =
        useState(false);
    const [generatedClass, setGeneratedClass] = useState<ClassPlan | null>(null);
    const [isGeneratingClass, setIsGeneratingClass] = useState(false);
    
    // View Swimmer State
    const [viewingSwimmer, setViewingSwimmer] = useState<Swimmer | null>(null);
    const [isViewSwimmerModalOpen, setIsViewSwimmerModalOpen] = useState(false);
    
    // Class Configuration State
    const [classConfig, setClassConfig] = useState({
        duration: 50,
        focus: 'Equilibrado',
        materials: ['Tablas', 'Popotes/Churros', 'Juguetes'] as string[]
    });

    const AVAILABLE_MATERIALS = ['Tablas', 'Popotes/Churros', 'Aletas', 'Pullbuoy', 'Juguetes', 'Tapetes'];

    const toggleMaterial = (material: string) => {
        setClassConfig(prev => ({
            ...prev,
            materials: prev.materials.includes(material)
                ? prev.materials.filter(m => m !== material)
                : [...prev.materials, material]
        }));
    };

    // Estados para crear grupo
    const [newGroup, setNewGroup] = useState({
        hour_start: '',
        days: [] as string[],
        level_id: '',
        note: '',
    });

    // Estados para crear swimmer
    const [newSwimmer, setNewSwimmer] = useState({
        name: '',
        skill_id: '',
        observations: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const toggleDay = (selectedDay: string) => {
        setNewGroup((prev) => ({
            ...prev,
            days: prev.days.includes(selectedDay)
                ? prev.days.filter((d) => d !== selectedDay)
                : [...prev.days, selectedDay],
        }));
    };

    const removeDay = (selectedDay: string) => {
        setNewGroup((prev) => ({
            ...prev,
            days: prev.days.filter((d) => d !== selectedDay),
        }));
    };

    // Crear grupo
    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/groups/modal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    hour_start: newGroup.hour_start,
                    days: newGroup.days.join(', '),
                    level_id: newGroup.level_id,
                    note: newGroup.note,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setGroups([...groups, result.group]);
                setSuccessMessage(result.message);

                setTimeout(() => {
                    setIsCreateGroupModalOpen(false);
                    setNewGroup({
                        hour_start: '',
                        days: [],
                        level_id: '',
                        note: '',
                    });
                    setSuccessMessage('');
                }, 1500);
            } else {
                setError(
                    result.errors?.[Object.keys(result.errors)[0]]?.[0] ||
                        'Error al crear el grupo',
                );
            }
        } catch (error) {
            setError('Error de conexión. Intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Abrir modal de crear grupo
    const openCreateGroupModal = () => {
        setNewGroup({
            hour_start: '',
            days: [day],
            level_id: '',
            note: '',
        });
        setError('');
        setSuccessMessage('');
        setIsCreateGroupModalOpen(true);
    };

    //Eliminar grupo
    const handleDeleteGroup = async (groupId: number) => {
        if (confirm('¿Estás seguro de eliminar este grupo?')) {
            const response = await fetch(`/groups/${groupId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setGroups((groups) => groups.filter((g) => g.id !== groupId));
            }
        }
    };

    // Abrir modal para crear swimmer
    const openCreateSwimmerModal = async (groupId: number, levelId: number) => {
        setCurrentGroupId(groupId);
        setNewSwimmer({ name: '', skill_id: '', observations: '' });
        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch(`/groups/level/${levelId}/skills`);
            const result = await response.json();
            if (result.success) {
                setLevelSkills(result.skills);
                setIsCreateSwimmerModalOpen(true);
            }
        } catch (error) {
            console.error('Error al cargar skills:', error);
        }
    };

    const openCreateClassModal = async (groupId: number, levelId: number) => {
        setCurrentGroupId(groupId);
        setError('');
        setSuccessMessage('');
        setGeneratedClass(null); // Reset previous class
        setIsCreateClassModalOpen(true);
    };

    const handleGenerateClass = async () => {
        if (!currentGroupId) return;
        setIsGeneratingClass(true);
        setError('');
        setGeneratedClass(null); // Clear previous viewing state when generating new
        
        try {
            // 1. Iniciar el trabajo en segundo plano
            const response = await fetch('/groups/generate-class', {
                 method: 'POST',
                 headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ 
                    group_id: currentGroupId,
                    ...classConfig
                }),
            });
            
            const initData = await response.json();
            
            if (initData.success && initData.generationId) {
                // 2. Polling para verificar el estado
                const pollInterval = setInterval(async () => {
                    try {
                        const statusRes = await fetch(`/groups/generate-class/status/${initData.generationId}`);
                        const statusData = await statusRes.json();
                        
                        if (statusData.status === 'completed') {
                            clearInterval(pollInterval);
                            setGeneratedClass(statusData.plan);
                            setIsGeneratingClass(false);
                            // Refresh the page to show the new generation in the history list (optional but good)
                            // window.location.reload(); or use inertia router.reload({ only: ['groups'] })
                        } else if (statusData.status === 'failed') {
                            clearInterval(pollInterval);
                            setError(statusData.error || 'Error en la generación');
                            setIsGeneratingClass(false);
                        }
                        // Si es 'pending' o 'processing', sigue consultando
                    } catch (pollErr) {
                        clearInterval(pollInterval);
                        setError('Error al consultar el estado');
                        setIsGeneratingClass(false);
                    }
                }, 2000); // Consultar cada 2 segundos
            } else {
                setError(initData.message || 'Error al iniciar la generación');
                setIsGeneratingClass(false);
            }
        } catch (err) {
            setError('Error de conexión al generar la clase');
            setIsGeneratingClass(false);
        }
    };

    const viewPreviousClass = (plan: ClassPlan) => {
        setGeneratedClass(plan);
        setIsCreateClassModalOpen(true);
    };

    // Crear swimmer
    const handleCreateSwimmer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentGroupId) return;

        setError('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/swimmers/modal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    ...newSwimmer,
                    group_id: currentGroupId,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setGroups(
                    groups.map((g) =>
                        g.id === currentGroupId
                            ? {
                                  ...g,
                                  swimmers: [...g.swimmers, result.swimmer],
                              }
                            : g,
                    ),
                );

                setSuccessMessage(result.message);

                setTimeout(() => {
                    setIsCreateSwimmerModalOpen(false);
                    setNewSwimmer({ name: '', skill_id: '', observations: '' });
                    setCurrentGroupId(null);
                    setSuccessMessage('');
                }, 1500);
            } else {
                setError(
                    result.errors?.[Object.keys(result.errors)[0]]?.[0] ||
                        'Error al crear el nadador',
                );
            }
        } catch (error) {
            setError('Error de conexión. Intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Actualizar nota del grupo
    const handleUpdateNote = async (groupId: number, note: string) => {
        try {
            await fetch(`/groups/${groupId}/note`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({ note }),
            });
        } catch (error) {
            console.error('Error al actualizar nota:', error);
        }
    };

    // Actualizar skill del swimmer
    const handleUpdateSwimmerSkill = async (
        swimmerId: number,
        groupId: number,
        skillId: number,
    ) => {
        try {
            const response = await fetch(`/swimmers/${swimmerId}/skill`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({ skill_id: skillId }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setGroups(
                    groups.map((g) =>
                        g.id === groupId
                            ? {
                                  ...g,
                                  swimmers: g.swimmers.map((s) =>
                                      s.id === swimmerId ? result.swimmer : s,
                                  ),
                              }
                            : g,
                    ),
                );
                
                // Si estamos viendo este nadador, actualizar su estado también
                if (viewingSwimmer && viewingSwimmer.id === swimmerId) {
                    setViewingSwimmer(result.swimmer);
                }
            }
        } catch (error) {
            console.error('Error al actualizar skill:', error);
        }
    };

    // Eliminar swimmer
    const handleDeleteSwimmer = async (swimmerId: number, groupId: number) => {
        if (!confirm('¿Estás seguro de eliminar este nadador?')) return;

        try {
            const response = await fetch(`/swimmers/${swimmerId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setGroups(
                    groups.map((g) =>
                        g.id === groupId
                            ? {
                                  ...g,
                                  swimmers: g.swimmers.filter(
                                      (s) => s.id !== swimmerId,
                                  ),
                              }
                            : g,
                    ),
                );
            }
        } catch (error) {
            console.error('Error al eliminar swimmer:', error);
        }
    };

    // Cargar skills del level
    const [groupSkills, setGroupSkills] = useState<Record<number, Skill[]>>({});

    const loadGroupSkills = async (levelId: number, groupId: number) => {
        if (groupSkills[groupId]) return;

        try {
            const response = await fetch(`/groups/level/${levelId}/skills`);
            const result = await response.json();
            if (result.success) {
                setGroupSkills((prev) => ({
                    ...prev,
                    [groupId]: result.skills,
                }));
            }
        } catch (error) {
            console.error('Error al cargar skills:', error);
        }
    };

    return (
        <AppLayout>
            <Head title={`Grupos - ${day}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <Button asChild variant="ghost">
                            <Link href="/groups">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver a Grupos
                            </Link>
                        </Button>
                        <Button onClick={openCreateGroupModal}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Grupo
                        </Button>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-3xl font-bold">{day}</h1>
                        <p className="mt-1 text-muted-foreground">
                            {groups.length}{' '}
                            {groups.length === 1 ? 'grupo' : 'grupos'}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {groups.map((group) => {
                            if (!groupSkills[group.id]) {
                                loadGroupSkills(group.level_id, group.id);
                            }

                            return (
                                <div key={group.id}>
                                    <Card className="transition-shadow hover:shadow-md">
                                        <CardHeader>
                                            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:gap-1.5">
                                                <div className="flex flex-1 items-start gap-2">
                                                    <div className="space-y-1">
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Clock className="h-5 w-5 text-primary" />
                                                            {formatTime(
                                                                group.hour_start,
                                                            )}
                                                        </CardTitle>
                                                        <CardDescription>
                                                            Nivel:{' '}
                                                            {group.level.name} •
                                                            Días: {group.days}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-start justify-end gap-2 sm:flex-row sm:gap-1.5">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-full sm:w-auto"
                                                        onClick={() =>
                                                            openCreateClassModal(
                                                                group.id,
                                                                group.level_id,
                                                            )
                                                        }
                                                    >
                                                        <Sparkles className="mr-2 h-4 w-4" />
                                                        Generar clase
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="w-full sm:w-auto"
                                                        onClick={() =>
                                                            openCreateSwimmerModal(
                                                                group.id,
                                                                group.level_id,
                                                            )
                                                        }
                                                    >
                                                        <UserPlus className="mr-2 h-4 w-4" />
                                                        Agregar Nadador
                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="w-full sm:w-auto"
                                                        onClick={() =>
                                                            handleDeleteGroup(
                                                                group.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 sm:mr-0" />
                                                        <span className="ml-2 sm:hidden">
                                                            Eliminar Grupo
                                                        </span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label className="mb-2">
                                                    Notas
                                                </Label>
                                                <Textarea
                                                    value={group.note}
                                                    onChange={(e) => {
                                                        const newNote =
                                                            e.target.value;
                                                        setGroups(
                                                            groups.map((g) =>
                                                                g.id ===
                                                                group.id
                                                                    ? {
                                                                          ...g,
                                                                          note: newNote,
                                                                      }
                                                                    : g,
                                                            ),
                                                        );
                                                    }}
                                                    onBlur={(e) =>
                                                        handleUpdateNote(
                                                            group.id,
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Agregar notas del grupo..."
                                                    rows={2}
                                                />
                                            </div>

                                            {group.swimmers.length > 0 ? (
                                                <div className="overflow-x-auto">
                                                    <Table className="min-w-[500px] sm:min-w-full">
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>
                                                                    Nadador
                                                                </TableHead>
                                                                <TableHead className="min-w-[150px]">
                                                                    Habilidad
                                                                    Actual
                                                                </TableHead>
                                                                <TableHead className="text-right">
                                                                    Acciones
                                                                </TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {group.swimmers.map(
                                                                (swimmer) => (
                                                                    <TableRow
                                                                        key={
                                                                            swimmer.id
                                                                        }
                                                                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                                        onClick={(e) => {
                                                                            // Prevent opening modal if clicking select or delete
                                                                            if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[role="combobox"]')) return;
                                                                            setViewingSwimmer(swimmer);
                                                                            setIsViewSwimmerModalOpen(true);
                                                                        }}
                                                                    >
                                                                        <TableCell className="font-medium">
                                                                            <div className="flex items-center gap-2">
                                                                                <User className="h-4 w-4 text-muted-foreground" />
                                                                                <span>{swimmer.name}</span>
                                                                                {swimmer.observations && (
                                                                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                                                                )}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Select
                                                                                value={
                                                                                    swimmer.skill_id?.toString() ??
                                                                                    ''
                                                                                }
                                                                                onValueChange={(
                                                                                    value,
                                                                                ) =>
                                                                                    handleUpdateSwimmerSkill(
                                                                                        swimmer.id,
                                                                                        group.id,
                                                                                        parseInt(
                                                                                            value,
                                                                                        ),
                                                                                    )
                                                                                }
                                                                            >
                                                                                <SelectTrigger className="h-8">
                                                                                    <SelectValue />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {(
                                                                                        groupSkills[
                                                                                            group
                                                                                                .id
                                                                                        ] ||
                                                                                        []
                                                                                    ).map(
                                                                                        (
                                                                                            skill,
                                                                                        ) => (
                                                                                            <SelectItem
                                                                                                key={
                                                                                                    skill.id
                                                                                                }
                                                                                                value={skill.id.toString()}
                                                                                            >
                                                                                                {
                                                                                                    skill.index
                                                                                                }

                                                                                                .{' '}
                                                                                                {
                                                                                                    skill.name
                                                                                                }
                                                                                            </SelectItem>
                                                                                        ),
                                                                                    )}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </TableCell>
                                                                        <TableCell className="text-right">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                                onClick={() =>
                                                                                    handleDeleteSwimmer(
                                                                                        swimmer.id,
                                                                                        group.id,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ),
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            ) : (
                                                <p className="py-4 text-center text-muted-foreground">
                                                    No hay nadadores en este
                                                    grupo
                                                </p>
                                            )}

                                            {/* Historial de Clases Generadas */}
                                            {group.generations && group.generations.length > 0 && (
                                                <Collapsible className="border rounded-md bg-muted/20">
                                                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-sm font-medium hover:bg-muted/50 transition-colors">
                                                        <div className="flex items-center gap-2">
                                                            <History className="h-4 w-4 text-muted-foreground" />
                                                            <span>Historial de Clases ({group.generations.length})</span>
                                                        </div>
                                                        <ChevronRight className="h-4 w-4 transition-transform duration-200 [data-state=open]:rotate-90" />
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <div className="p-2 space-y-1">
                                                            {group.generations.map((gen) => (
                                                                <button
                                                                    key={gen.id}
                                                                    onClick={() => viewPreviousClass(gen.content)}
                                                                    className="flex items-center justify-between w-full p-2 text-sm rounded-md hover:bg-background border border-transparent hover:border-border transition-colors group"
                                                                >
                                                                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
                                                                        <Calendar className="h-3 w-3" />
                                                                        <span>
                                                                            {new Date(gen.created_at).toLocaleDateString('es-ES', { 
                                                                                weekday: 'short', 
                                                                                day: 'numeric', 
                                                                                month: 'short',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit'
                                                                            })}
                                                                        </span>
                                                                    </div>
                                                                    <Badge variant="secondary" className="text-xs font-normal">
                                                                        Ver Clase
                                                                    </Badge>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modal Crear Grupo */}
            <Dialog
                open={isCreateGroupModalOpen}
                onOpenChange={setIsCreateGroupModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Grupo</DialogTitle>
                        <DialogDescription>
                            Agrega un nuevo grupo (puede tener múltiples días)
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateGroup}>
                        <div className="space-y-4 py-4">
                            {successMessage && (
                                <Alert className="border-green-500 bg-green-50">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800">
                                        {successMessage}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="days">
                                    Días{' '}
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </Label>

                                <Popover
                                    open={isDaysPopoverOpen}
                                    onOpenChange={setIsDaysPopoverOpen}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={isDaysPopoverOpen}
                                            className={`w-full justify-between ${error && newGroup.days.length === 0 ? 'border-destructive' : ''}`}
                                        >
                                            {newGroup.days.length === 0 ? (
                                                <span className="text-muted-foreground">
                                                    Selecciona días...
                                                </span>
                                            ) : (
                                                <span>
                                                    {newGroup.days.length}{' '}
                                                    {newGroup.days.length === 1
                                                        ? 'día seleccionado'
                                                        : 'días seleccionados'}
                                                </span>
                                            )}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-full p-0"
                                        align="start"
                                    >
                                        <div className="space-y-1 p-2">
                                            {DAYS_OPTIONS.map((dayOption) => (
                                                <div
                                                    key={dayOption}
                                                    className="flex cursor-pointer items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent"
                                                    onClick={() =>
                                                        toggleDay(dayOption)
                                                    }
                                                >
                                                    <Checkbox
                                                        checked={newGroup.days.includes(
                                                            dayOption,
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggleDay(dayOption)
                                                        }
                                                    />
                                                    <label className="flex-1 cursor-pointer text-sm">
                                                        {dayOption}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                        {newGroup.days.length > 0 && (
                                            <div className="border-t p-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() =>
                                                        setNewGroup({
                                                            ...newGroup,
                                                            days: [],
                                                        })
                                                    }
                                                >
                                                    Limpiar selección
                                                </Button>
                                            </div>
                                        )}
                                    </PopoverContent>
                                </Popover>

                                {newGroup.days.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {newGroup.days.map((selectedDay) => (
                                            <div
                                                key={selectedDay}
                                                className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-sm text-primary-foreground"
                                            >
                                                {selectedDay}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeDay(selectedDay)
                                                    }
                                                    className="rounded-sm p-0.5 hover:bg-primary-foreground/20"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hour_start">
                                        Hora{' '}
                                        <span className="ml-1 text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="hour_start"
                                        type="time"
                                        value={newGroup.hour_start}
                                        onChange={(e) =>
                                            setNewGroup({
                                                ...newGroup,
                                                hour_start: e.target.value,
                                            })
                                        }
                                        className={
                                            error ? 'border-destructive' : ''
                                        }
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="level_id">
                                    Nivel{' '}
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </Label>
                                <Select
                                    value={newGroup.level_id}
                                    onValueChange={(value) =>
                                        setNewGroup({
                                            ...newGroup,
                                            level_id: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un nivel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {levels.map((level) => (
                                            <SelectItem
                                                key={level.id}
                                                value={level.id.toString()}
                                            >
                                                {level.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="note">Notas</Label>
                                <Textarea
                                    id="note"
                                    value={newGroup.note}
                                    onChange={(e) =>
                                        setNewGroup({
                                            ...newGroup,
                                            note: e.target.value,
                                        })
                                    }
                                    placeholder="Notas opcionales..."
                                    rows={3}
                                />
                            </div>
                            {error && (
                                <p className="text-sm text-destructive">
                                    {error}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateGroupModalOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Creando...' : 'Crear Grupo'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Crear Swimmer */}
            <Dialog
                open={isCreateSwimmerModalOpen}
                onOpenChange={setIsCreateSwimmerModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agregar Nadador</DialogTitle>
                        <DialogDescription>
                            Agrega un nuevo nadador al grupo
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSwimmer}>
                        <div className="space-y-4 py-4">
                            {successMessage && (
                                <Alert className="border-green-500 bg-green-50">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800">
                                        {successMessage}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="swimmer-name">
                                    Nombre{' '}
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </Label>
                                <Input
                                    id="swimmer-name"
                                    type="text"
                                    value={newSwimmer.name}
                                    onChange={(e) =>
                                        setNewSwimmer({
                                            ...newSwimmer,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="Nombre completo"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="skill_id">
                                    Habilidad Inicial{' '}
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </Label>
                                <Select
                                    value={newSwimmer.skill_id}
                                    onValueChange={(value) =>
                                        setNewSwimmer({
                                            ...newSwimmer,
                                            skill_id: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona la habilidad inicial" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {levelSkills.map((skill) => (
                                            <SelectItem
                                                key={skill.id}
                                                value={skill.id.toString()}
                                            >
                                                {skill.index}. {skill.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="observations">
                                    Observaciones / Condiciones
                                </Label>
                                <Textarea
                                    id="observations"
                                    value={newSwimmer.observations}
                                    onChange={(e) =>
                                        setNewSwimmer({
                                            ...newSwimmer,
                                            observations: e.target.value,
                                        })
                                    }
                                    placeholder="Ej: Asma, TDAH, miedo al agua, es hermano de Juan..."
                                    rows={2}
                                />
                            </div>
                            {error && (
                                <p className="text-sm text-destructive">
                                    {error}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setIsCreateSwimmerModalOpen(false)
                                }
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? 'Agregando...'
                                    : 'Agregar Nadador'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Ver Nadador */}
            <Dialog open={isViewSwimmerModalOpen} onOpenChange={setIsViewSwimmerModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                 <User className="h-6 w-6 text-primary" />
                             </div>
                             <div>
                                <DialogTitle className="text-xl">{viewingSwimmer?.name}</DialogTitle>
                                <DialogDescription>Perfil del alumno</DialogDescription>
                             </div>
                        </div>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                             <h4 className="flex items-center gap-2 font-semibold text-primary text-sm">
                                <Activity className="h-4 w-4" /> Habilidad Actual
                            </h4>
                            <div className="bg-muted/40 p-3 rounded-md border">
                                <span className="font-medium">{viewingSwimmer?.currentSkill?.index}. {viewingSwimmer?.currentSkill?.name}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="flex items-center gap-2 font-semibold text-primary text-sm">
                                <FileText className="h-4 w-4" /> Observaciones / Condiciones
                            </h4>
                            {viewingSwimmer?.observations ? (
                                <p className="text-sm text-foreground/80 leading-relaxed bg-amber-50 border border-amber-100 p-3 rounded-md text-amber-900">
                                    {viewingSwimmer.observations}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground italic pl-1">
                                    Sin observaciones registradas.
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setIsViewSwimmerModalOpen(false)}>
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Sheet para generar clase */}
            <Sheet
                open={isCreateClassModalOpen}
                onOpenChange={setIsCreateClassModalOpen}
            >
                <SheetContent className="w-full sm:max-w-2xl lg:max-w-3xl overflow-y-auto p-6 sm:p-8 md:p-10">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-3xl font-bold">Planeación de Clase con IA</SheetTitle>
                        <SheetDescription className="text-base text-muted-foreground">
                            Genera una estructura de clase personalizada basada
                            en el nivel y habilidades de los alumnos.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-8 space-y-8">
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {!generatedClass && !isGeneratingClass && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <Sparkles className="h-10 w-10 text-primary mx-auto mb-2" />
                                    <h3 className="text-lg font-medium">Configura tu Clase</h3>
                                    <p className="text-sm text-muted-foreground">Personaliza los parámetros antes de generar.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Enfoque de la Clase</Label>
                                        <RadioGroup 
                                            value={classConfig.focus} 
                                            onValueChange={(val) => setClassConfig({...classConfig, focus: val})}
                                            className="grid grid-cols-2 gap-4"
                                        >
                                            <div>
                                                <RadioGroupItem value="Técnico" id="f-tech" className="peer sr-only" />
                                                <Label htmlFor="f-tech" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                    <span>Técnico</span>
                                                </Label>
                                            </div>
                                            <div>
                                                <RadioGroupItem value="Lúdico / Divertido" id="f-fun" className="peer sr-only" />
                                                <Label htmlFor="f-fun" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                    <span>Lúdico</span>
                                                </Label>
                                            </div>
                                            <div>
                                                <RadioGroupItem value="Cardio / Resistencia" id="f-cardio" className="peer sr-only" />
                                                <Label htmlFor="f-cardio" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                    <span>Cardio</span>
                                                </Label>
                                            </div>
                                            <div>
                                                <RadioGroupItem value="Equilibrado" id="f-mixed" className="peer sr-only" />
                                                <Label htmlFor="f-mixed" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                    <span>Equilibrado</span>
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Duración: {classConfig.duration} minutos</Label>
                                        <input 
                                            type="range" 
                                            min="30" 
                                            max="90" 
                                            step="5"
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            value={classConfig.duration}
                                            onChange={(e) => setClassConfig({...classConfig, duration: parseInt(e.target.value)})}
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>30m</span>
                                            <span>45m</span>
                                            <span>60m</span>
                                            <span>90m</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Material Disponible</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {AVAILABLE_MATERIALS.map(material => (
                                                <div 
                                                    key={material}
                                                    className={`
                                                        cursor-pointer text-sm border rounded-md px-3 py-2 flex items-center gap-2 transition-colors
                                                        ${classConfig.materials.includes(material) 
                                                            ? 'bg-primary/10 border-primary text-primary' 
                                                            : 'bg-background border-input hover:bg-accent'}
                                                    `}
                                                    onClick={() => toggleMaterial(material)}
                                                >
                                                    <Checkbox 
                                                        checked={classConfig.materials.includes(material)} 
                                                        onCheckedChange={() => toggleMaterial(material)}
                                                        className="pointer-events-none" // Handle click on container
                                                    />
                                                    {material}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button onClick={handleGenerateClass} size="lg" className="w-full mt-4">
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generar Clase
                                    </Button>
                                </div>
                            </div>
                        )}

                        {isGeneratingClass && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                <p className="text-lg font-medium animate-pulse">Diseñando clase...</p>
                                <p className="text-sm text-muted-foreground mt-2">Consultando a Gemini AI</p>
                            </div>
                        )}

                        {generatedClass && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <Timer className="h-4 w-4 text-primary" />
                                            <span className="font-medium">{classConfig.duration} min</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Activity className="h-4 w-4 text-primary" />
                                            <span className="font-medium">{classConfig.focus}</span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="font-normal">
                                        {groups.find(g => g.id === currentGroupId)?.level.name}
                                    </Badge>
                                </div>

                                {generatedClass.stages.map((stage, index) => (
                                    <Card key={index} className="border-l-4 border-l-primary relative overflow-hidden">
                                        <CardHeader className="pb-2 pt-4">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-lg flex items-center">
                                                    <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full mr-2 min-w-[24px] text-center">
                                                        {index + 1}
                                                    </span>
                                                    {stage.etapa}
                                                </CardTitle>
                                                <div className="flex gap-2">
                                                    <Badge variant="secondary" className="flex items-center gap-1">
                                                        <Timer className="h-3 w-3" /> {stage.tiempo_minutos}m
                                                    </Badge>
                                                    <Badge className={`${
                                                        stage.intensidad === 'ALTA' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
                                                        stage.intensidad === 'MEDIA' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                                                        'bg-green-100 text-green-800 hover:bg-green-100'
                                                    } border-none`}>
                                                        {stage.intensidad}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3 text-sm">
                                            <div>
                                                <p className="leading-relaxed">{stage.descripcion}</p>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                                <div className="bg-muted/40 p-2 rounded-md">
                                                    <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider block mb-1">Organización</span>
                                                    <p>{stage.organizacion}</p>
                                                </div>
                                                <div className="bg-muted/40 p-2 rounded-md">
                                                    <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider block mb-1 flex items-center gap-1">
                                                        <Box className="h-3 w-3" /> Material
                                                    </span>
                                                    <p className="text-primary font-medium">{stage.material}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    <SheetFooter>
                        {generatedClass && (
                            <Button
                                onClick={handleGenerateClass}
                                variant="outline"
                                className="mr-auto"
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Regenerar
                            </Button>
                        )}
                        <SheetClose asChild>
                            <Button variant="outline">Cerrar</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
