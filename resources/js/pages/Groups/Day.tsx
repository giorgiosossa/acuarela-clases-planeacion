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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, Trash2, UserPlus, CheckCircle2, Clock, ChevronsUpDown, X } from 'lucide-react';

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
    hour_start: string;
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
        [...initialGroups].sort((a, b) => a.hour_start.localeCompare(b.hour_start))
    );
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const [isCreateSwimmerModalOpen, setIsCreateSwimmerModalOpen] = useState(false);
    const [isDaysPopoverOpen, setIsDaysPopoverOpen] = useState(false);
    const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);
    const [levelSkills, setLevelSkills] = useState<Skill[]>([]);


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
        setNewGroup(prev => ({
            ...prev,
            days: prev.days.includes(selectedDay)
                ? prev.days.filter(d => d !== selectedDay)
                : [...prev.days, selectedDay]
        }));
    };

    const removeDay = (selectedDay: string) => {
        setNewGroup(prev => ({
            ...prev,
            days: prev.days.filter(d => d !== selectedDay)
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
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
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
                    setNewGroup({ hour_start: '', days: [], level_id: '', note: '' });
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

    // Abrir modal de crear grupo
    const openCreateGroupModal = () => {
        setNewGroup({
            hour_start: '',
            days: [day],
            level_id: '',
            note: ''
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
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if(response.ok){
                setGroups(groups=> groups.filter(g=> g.id !== groupId))
            }
        }
    };

    // Abrir modal para crear swimmer
    const openCreateSwimmerModal = async (groupId: number, levelId: number) => {
        setCurrentGroupId(groupId);
        setNewSwimmer({ name: '', skill_id: '' });
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
        if (groupSkills[groupId]) return;

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
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                        <p className="text-muted-foreground mt-1">
                            {groups.length} {groups.length === 1 ? 'grupo' : 'grupos'}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {groups.map((group, index) => {
                            if (!groupSkills[group.id]) {
                                loadGroupSkills(group.level_id, group.id);
                            }

                            return (
                                <div key={group.id}>
                                    <Card className=" hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-1.5">
                                                <div className="flex items-start gap-2 flex-1">

                                                    <div className="space-y-1">
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Clock className="h-5 w-5 text-primary" />
                                                            {formatTime(group.hour_start)}
                                                        </CardTitle>
                                                        <CardDescription>
                                                            Nivel: {group.level.name} • Días: {group.days}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className='flex flex-col sm:flex-row items-start justify-end gap-2 sm:gap-1.5'>
                                                    <Button
                                                        size="sm"
                                                        className="w-full sm:w-auto"
                                                        onClick={() => openCreateSwimmerModal(group.id, group.level_id)}
                                                    >
                                                        <UserPlus className="mr-2 h-4 w-4" />
                                                        Agregar Nadador
                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="w-full sm:w-auto"
                                                        onClick={() => handleDeleteGroup(group.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 sm:mr-0" />
                                                        <span className="sm:hidden ml-2">Eliminar Grupo</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label className="mb-2">Notas</Label>
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

                                            {group.swimmers.length > 0 ? (
                                                <div className="overflow-x-auto">
                                                    <Table className="min-w-[500px] sm:min-w-full">
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Nadador</TableHead>
                                                                <TableHead className="min-w-[150px]">Habilidad Actual</TableHead>
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
                                                                            value={swimmer.skill_id?.toString() ?? ''}
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
                                                                                        {skill.index}. {skill.name}
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
                                                </div>
                                            ) : (
                                                <p className="text-center text-muted-foreground py-4">
                                                    No hay nadadores en este grupo
                                                </p>
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
            <Dialog open={isCreateGroupModalOpen} onOpenChange={setIsCreateGroupModalOpen}>
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
                                    Días <span className="text-destructive ml-1">*</span>
                                </Label>

                                <Popover open={isDaysPopoverOpen} onOpenChange={setIsDaysPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={isDaysPopoverOpen}
                                            className={`w-full justify-between ${error && newGroup.days.length === 0 ? 'border-destructive' : ''}`}
                                        >
                                            {newGroup.days.length === 0 ? (
                                                <span className="text-muted-foreground">Selecciona días...</span>
                                            ) : (
                                                <span>{newGroup.days.length} {newGroup.days.length === 1 ? 'día seleccionado' : 'días seleccionados'}</span>
                                            )}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0" align="start">
                                        <div className="p-2 space-y-1">
                                            {DAYS_OPTIONS.map((dayOption) => (
                                                <div
                                                    key={dayOption}
                                                    className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent cursor-pointer"
                                                    onClick={() => toggleDay(dayOption)}
                                                >
                                                    <Checkbox
                                                        checked={newGroup.days.includes(dayOption)}
                                                        onCheckedChange={() => toggleDay(dayOption)}
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
                                                    onClick={() => setNewGroup({ ...newGroup, days: [] })}
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
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-sm"
                                            >
                                                {selectedDay}
                                                <button
                                                    type="button"
                                                    onClick={() => removeDay(selectedDay)}
                                                    className="hover:bg-primary-foreground/20 rounded-sm p-0.5"
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
                                        Hora <span className="text-destructive ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="hour_start"
                                        type="time"
                                        value={newGroup.hour_start}
                                        onChange={(e) => setNewGroup({ ...newGroup, hour_start: e.target.value })}
                                        className={error ? 'border-destructive' : ''}
                                        autoFocus
                                    />
                                </div>

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
                                <Label htmlFor="swimmer-name">
                                    Nombre <span className="text-destructive ml-1">*</span>
                                </Label>
                                <Input
                                    id="swimmer-name"
                                    type="text"
                                    value={newSwimmer.name}
                                    onChange={(e) => setNewSwimmer({ ...newSwimmer, name: e.target.value })}
                                    placeholder="Nombre completo"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="skill_id">
                                    Habilidad Inicial <span className="text-destructive ml-1">*</span>
                                </Label>
                                <Select
                                    value={newSwimmer.skill_id}
                                    onValueChange={(value) => setNewSwimmer({ ...newSwimmer, skill_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona la habilidad inicial" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {levelSkills.map((skill) => (
                                            <SelectItem key={skill.id} value={skill.id.toString()}>
                                                {skill.index }. {skill.name}
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
