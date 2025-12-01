import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Calendar, Users, CheckCircle2, ChevronRight, ChevronsUpDown, X } from 'lucide-react';

interface Level {
    id: number;
    name: string;
}

interface Group {
    id: number;
    hour_start: string;
    days: string;
    note: string;
    level: Level;
    swimmers_count?: number;
}

interface Props {
    groupsByDay: Record<string, Group[]>;
    availableDays: string[];
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

const DAYS_MAP: Record<string, string> = {
    'Lunes': 'Lunes',
    'Martes': 'Martes',
    'Miércoles': 'Miércoles',
    'Jueves': 'Jueves',
    'Viernes': 'Viernes',
    'Sábado': 'Sábado',
    'Domingo': 'Domingo',
};

export default function Index({ groupsByDay, availableDays, levels }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDaysPopoverOpen, setIsDaysPopoverOpen] = useState(false);
    const [newGroup, setNewGroup] = useState({
        hour_start: '',
        days: [] as string[],
        level_id: '',
        note: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const toggleDay = (day: string) => {
        setNewGroup(prev => ({
            ...prev,
            days: prev.days.includes(day)
                ? prev.days.filter(d => d !== day)
                : [...prev.days, day]
        }));
    };

    const removeDay = (day: string) => {
        setNewGroup(prev => ({
            ...prev,
            days: prev.days.filter(d => d !== day)
        }));
    };

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
                setSuccessMessage(result.message);

                setTimeout(() => {
                    setIsCreateModalOpen(false);
                    setNewGroup({ hour_start: '', days: [], level_id: '', note: '' });
                    setSuccessMessage('');
                    router.reload();
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

    const openCreateModal = () => {
        setNewGroup({ hour_start: '', days: [], level_id: '', note: '' });
        setError('');
        setSuccessMessage('');
        setIsCreateModalOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Grupos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl">Grupos por Día</CardTitle>
                                    <CardDescription>
                                        Selecciona un día para ver y gestionar sus grupos
                                    </CardDescription>
                                </div>
                                <Button onClick={openCreateModal}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nuevo Grupo
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {availableDays.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {availableDays.map((day) => {
                                        const dayGroups = groupsByDay[day] || [];
                                        const totalSwimmers = dayGroups.reduce(
                                            (sum, group) => sum + (group.swimmers_count || 0),
                                            0
                                        );

                                        return (
                                            <Link
                                                key={day}
                                                href={`/groups/day/${day}`}
                                                className="block"
                                            >
                                                <Card className="hover:border-primary transition-all cursor-pointer hover:shadow-md">
                                                    <CardHeader>
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <CardTitle className="flex items-center gap-2">
                                                                    <Calendar className="h-5 w-5 text-primary" />
                                                                    {DAYS_MAP[day] || day}
                                                                </CardTitle>
                                                                <CardDescription className="mt-2">
                                                                    {dayGroups.length} {dayGroups.length === 1 ? 'grupo' : 'grupos'}
                                                                </CardDescription>
                                                            </div>
                                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Users className="h-4 w-4" />
                                                            <span>
                                                                {totalSwimmers} {totalSwimmers === 1 ? 'nadador' : 'nadadores'}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground mb-2">
                                        No hay grupos creados aún
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Los grupos se organizarán automáticamente por día
                                    </p>
                                    <Button onClick={openCreateModal}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Crear Primer Grupo
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal Crear Grupo */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Grupo</DialogTitle>
                        <DialogDescription>
                            Agrega un nuevo grupo al sistema
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

                            {/* Selector múltiple de días */}
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
                                            {DAYS_OPTIONS.map((day) => (
                                                <div
                                                    key={day}
                                                    className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent cursor-pointer"
                                                    onClick={() => toggleDay(day)}
                                                >
                                                    <Checkbox
                                                        checked={newGroup.days.includes(day)}
                                                        onCheckedChange={() => toggleDay(day)}
                                                    />
                                                    <label className="flex-1 cursor-pointer text-sm">
                                                        {day}
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

                                {/* Chips de días seleccionados */}
                                {newGroup.days.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {newGroup.days.map((day) => (
                                            <div
                                                key={day}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-sm"
                                            >
                                                {day}
                                                <button
                                                    type="button"
                                                    onClick={() => removeDay(day)}
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
                                    <SelectTrigger className={error && !newGroup.level_id ? 'border-destructive' : ''}>
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
                                onClick={() => setIsCreateModalOpen(false)}
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
        </AppLayout>
    );
}
