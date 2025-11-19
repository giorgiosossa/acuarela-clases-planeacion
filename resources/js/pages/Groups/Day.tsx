import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, Save, Trash2, UserPlus, CheckCircle2, Clock } from 'lucide-react';

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
}

interface Level {
    id: number;
    name: string;
}

interface Group {
    id: number;
    hour: string;
    days: string;
    note: string;
    level_id: number;
    level: Level;
    swimmers: Swimmer[];
}

interface Props {
    day: string;
    groups: Group[];
    levels: Level[];
}

export default function Day({ day, groups: initialGroups, levels }: Props) {
    const [groups, setGroups] = useState<Group[]>(initialGroups);
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const [isCreateSwimmerModalOpen, setIsCreateSwimmerModalOpen] = useState(false);
    const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);
    const [levelSkills, setLevelSkills] = useState<Skill[]>([]);

    // Estados para crear grupo
    const [newGroup, setNewGroup] = useState({
        hour: '',
        level_id: '',
        note: '',
    });

    // Estados para crear swimmer
    const [newSwimmer, setNewSwimmer] = useState({
        name: '',
        skill_id: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

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
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    ...newGroup,
                    days: day,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setGroups([...groups, result.group]);
                setSuccessMessage(result.message);

                setTimeout(() => {
                    setIsCreateGroupModalOpen(false);
                    setNewGroup({ hour: '', level_id: '', note: '' });
                    setSuccessMessage('');
                }, 1500);
            } else {
                setError(result.errors?.[Object.keys(result.errors)[0]]?.[0] || 'Error al crear el grupo');
            }
        } catch (error) {
            setError('Error de conexión. Intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Abrir modal para crear swimmer
    const openCreateSwimmerModal = async (groupId: number, levelId: number) => {
        setCurrentGroupId(groupId);
        setNewSwimmer({ name: '', skill_id: '' });
        setError('');
        setSuccessMessage('');

        // Cargar skills del level
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
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    ...newSwimmer,
                    group_id: currentGroupId,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Actualizar el grupo con el nuevo swimmer
                setGroups(groups.map(g =>
                    g.id === currentGroupId
                        ? { ...g, swimmers: [...g.swimmers, result.swimmer] }
                        : g
                ));

                setSuccessMessage(result.message);

                setTimeout(() => {
                    setIsCreateSwimmerModalOpen(false);
                    setNewSwimmer({ name: '', skill_id: '' });
                    setCurrentGroupId(null);
                    setSuccessMessage('');
                }, 1500);
            } else {
                setError(result.errors?.[Object.keys(result.errors)[0]]?.[0] || 'Error al crear el nadador');
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
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ note }),
            });
        } catch (error) {
            console.error('Error al actualizar nota:', error);
        }
    };

    // Actualizar skill del swimmer
    const handleUpdateSwimmerSkill = async (swimmerId: number, groupId: number, skillId: number) => {
        try {
            const response = await fetch(`/swimmers/${swimmerId}/skill`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ skill_id: skillId }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Actualizar el swimmer en el estado
                setGroups(groups.map(g =>
                    g.id === groupId
                        ? {
                            ...g,
                            swimmers: g.swimmers.map(s =>
                                s.id === swimmerId ? result.swimmer : s
                            )
                        }
                        : g
                ));
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
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setGroups(groups.map(g =>
                    g.id === groupId
                        ? { ...g, swimmers: g.swimmers.filter(s => s.id !== swimmerId) }
                        : g
                ));
            }
        } catch (error) {
            console.error('Error al eliminar swimmer:', error);
        }
    };

    // Cargar skills del level
    const [groupSkills, setGroupSkills] = useState<Record<number, Skill[]>>({});

    const loadGroupSkills = async (levelId: number, groupId: number) => {
        if (groupSkills[groupId]) return; // Ya cargadas

        try {
            const response = await fetch(`/groups/level/${levelId}/skills`);
            const result = await response.json();
            if (result.success) {
                setGroupSkills(prev => ({ ...prev, [groupId]: result.skills }));
            }
        } catch (error) {
            console.error('Error al cargar skills:', error);
        }
    };

    return (
        <AppLayout>
            <Head title={`Grupos - ${day}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <Button asChild variant="ghost">
                            <Link href="/groups">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver a Grupos
                            </Link>
                        </Button>
                        <Button onClick={() => setIsCreateGroupModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Grupo
                        </Button>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-3xl font-bold">{day}</h1>
                        <p className="text-muted-foreground mt-1">
                            {groups.length} {groups.length === 1 ? 'grupo' : 'grupos'}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {groups.map((group) => {
                            // Cargar skills al renderizar el grupo
                            if (!groupSkills[group.id]) {
                                loadGroupSkills(group.level_id, group.id);
                            }

                            return (
                                <Card key={group.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Clock className="h-5 w-5 text-primary" />
                                                    {group.hour}
                                                </CardTitle>
                                                <CardDescription>
                                                    Nivel: {group.level.name}
                                                </CardDescription>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => openCreateSwimmerModal(group.id, group.level_id)}
                                            >
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Agregar Nadador
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Notas */}
                                        <div>
                                            <Label>Notas</Label>
                                            <Textarea
                                                value={group.note}
                                                onChange={(e) => {
                                                    const newNote = e.target.value;
                                                    setGroups(groups.map(g =>
                                                        g.id === group.id ? { ...g, note: newNote } : g
                                                    ));
                                                }}
                                                onBlur={(e) => handleUpdateNote(group.id, e.target.value)}
                                                placeholder="Agregar notas del grupo..."
                                                rows={2}
                                            />
                                        </div>

                                        {/* Tabla de nadadores */}
                                        {group.swimmers.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Nadador</TableHead>
                                                        <TableHead>Habilidad Actual</TableHead>
                                                        <TableHead className="text-right">Acciones</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {group.swimmers.map((swimmer) => (
                                                        <TableRow key={swimmer.id}>
                                                            <TableCell className="font-medium">
                                                                {swimmer.name}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Select
                                                                    value={swimmer.skill_id.toString()}
                                                                    onValueChange={(value) =>
                                                                        handleUpdateSwimmerSkill(
                                                                            swimmer.id,
                                                                            group.id,
                                                                            parseInt(value)
                                                                        )
                                                                    }
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {(groupSkills[group.id] || []).map((skill) => (
                                                                            <SelectItem
                                                                                key={skill.id}
                                                                                value={skill.id.toString()}
                                                                            >
                                                                                {skill.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteSwimmer(swimmer.id, group.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <p className="text-center text-muted-foreground py-4">
                                                No hay nadadores en este grupo
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modal Crear Grupo */}
            <Dialog open={isCreateGroupModalOpen} onOpenChange={setIsCreateGroupModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Grupo</DialogTitle>
                        <DialogDescription>
                            Agrega un nuevo grupo para {day}
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
                                <Label htmlFor="hour">
                                    Hora <span className="text-destructive ml-1">*</span>
                                </Label>
                                <Input
                                    id="hour"
                                    type="text"
                                    value={newGroup.hour}
                                    onChange={(e) => setNewGroup({ ...newGroup, hour: e.target.value })}
                                    placeholder="Ej: 10:00 - 11:00"
                                    className={error ? 'border-destructive' : ''}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="level_id">
                                    Nivel <span className="text-destructive ml-1">*</span>
                                </Label>
                                <Select
                                    value={newGroup.level_id}
                                    onValueChange={(value) => setNewGroup({ ...newGroup, level_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un nivel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {levels.map((level) => (
                                            <SelectItem key={level.id} value={level.id.toString()}>
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
                                    onChange={(e) => setNewGroup({ ...newGroup, note: e.target.value })}
                                    placeholder="Notas opcionales..."
                                    rows={3}
                                />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
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
            <Dialog open={isCreateSwimmerModalOpen} onOpenChange={setIsCreateSwimmerModalOpen}>
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
                                <Label htmlFor="swimmer_name">
                                    Nombre <span className="text-destructive ml-1">*</span>
                                </Label>
                                <Input
                                    id="swimmer_name"
                                    type="text"
                                    value={newSwimmer.name}
                                    onChange={(e) => setNewSwimmer({ ...newSwimmer, name: e.target.value })}
                                    placeholder="Nombre del nadador"
                                    className={error ? 'border-destructive' : ''}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="skill_id">
                                    Habilidad Actual <span className="text-destructive ml-1">*</span>
                                </Label>
                                <Select
                                    value={newSwimmer.skill_id}
                                    onValueChange={(value) => setNewSwimmer({ ...newSwimmer, skill_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una habilidad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {levelSkills.map((skill) => (
                                            <SelectItem key={skill.id} value={skill.id.toString()}>
                                                {skill.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateSwimmerModalOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Agregando...' : 'Agregar Nadador'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
