"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle, Sparkles, Loader2 } from "lucide-react"
import { generateClassFacultyMapping } from "@/ai/flows/generate-class-faculty-mapping"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { doc, setDoc, deleteDoc, collection } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { DataTable } from "./data-table"
import type { ClassFacultyMapping, Faculty } from "@/lib/types"
import { Textarea } from "../ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useData } from "../data-provider"
import { useFirebase } from "@/firebase"

interface ClassFacultyMappingTableProps {
}

const mappingSchema = z.object({
    id: z.string().optional(),
    class_name: z.string().min(1, "Class name is required."),
    faculty_id: z.string().min(1, "Faculty must be selected."),
    subject: z.string().min(1, "Subject is required."),
});

const MappingForm = ({ mapping, onSave, onCancel }: { mapping?: ClassFacultyMapping; onSave: (data: Omit<ClassFacultyMapping, 'id'>) => void; onCancel: () => void; }) => {
    const { mappings, faculty } = useData();

    const existingMappings = React.useMemo(() => new Set(mappings.map(m => `${m.class_name}-${m.faculty_id}-${m.subject}`)), [mappings]);
    
    const formSchema = mappingSchema.refine(data => {
        const mappingKey = `${data.class_name}-${data.faculty_id}-${data.subject}`;
        if (mapping?.id && `${mapping.class_name}-${mapping.faculty_id}-${mapping.subject}` === mappingKey) return true;
        return !existingMappings.has(mappingKey);
    }, {
        message: "This exact mapping already exists.",
        path: ["subject"], // Show error on a field
    });
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: mapping || { class_name: "", faculty_id: "", subject: "" },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const { id, ...data } = values;
        onSave(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="class_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Class Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., CS-A" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="faculty_id"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Faculty</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a faculty member" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {faculty.map(f => (
                                <SelectItem key={f.id} value={f.faculty_id}>{f.name} ({f.faculty_id})</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Data Structures" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};


const ActionsCell = ({ mapping }: { mapping: ClassFacultyMapping; }) => {
    const { firestore } = useFirebase();
    const [isEditing, setIsEditing] = React.useState(false);
    const { toast } = useToast();

    const handleEditSave = async (data: Omit<ClassFacultyMapping, 'id'>) => {
        try {
            await setDoc(doc(firestore, 'classFacultyMapping', mapping.id), data, { merge: true });
            toast({ title: "Mapping Updated" });
            setIsEditing(false);
        } catch(error) {
            console.error("Error updating mapping:", error);
            toast({ variant: 'destructive', title: "Update failed" });
        }
    };
    
    const handleDelete = async () => {
        if(confirm(`Are you sure you want to delete this mapping?`)) {
            try {
                await deleteDoc(doc(firestore, 'classFacultyMapping', mapping.id));
                toast({ title: "Mapping Deleted" });
            } catch (error) {
                console.error("Error deleting mapping:", error);
                toast({ variant: 'destructive', title: "Delete failed" });
            }
        }
    };
  
    return (
     <>
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setIsEditing(true)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Mapping</DialogTitle>
                    <DialogDescription>Update this class-faculty mapping.</DialogDescription>
                </DialogHeader>
                <MappingForm mapping={mapping} onSave={handleEditSave} onCancel={() => setIsEditing(false)} />
            </DialogContent>
        </Dialog>
     </>
    );
};

const getColumns = (allFaculty: Faculty[]): ColumnDef<ClassFacultyMapping>[] => [
  {
    accessorKey: "class_name",
    header: "Class Name",
  },
  {
    accessorKey: "faculty_id",
    header: "Faculty",
    cell: ({ row }) => {
        const faculty = allFaculty.find(f => f.faculty_id === row.original.faculty_id);
        return faculty ? `${faculty.name} (${faculty.faculty_id})` : row.original.faculty_id;
    }
  },
  {
    accessorKey: "subject",
    header: "Subject",
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell mapping={row.original} />,
  },
]

export function ClassFacultyMappingTable({}: ClassFacultyMappingTableProps) {
    const { mappings, faculty } = useData();
    const [prompt, setPrompt] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(false);
    const [isAdding, setIsAdding] = React.useState<boolean>(false);
    const { toast } = useToast();
    const { firestore } = useFirebase();
    
    const columns = React.useMemo(() => getColumns(faculty), [faculty]);

    const handleAddSave = async (data: Omit<ClassFacultyMapping, 'id'>) => {
        const newDocRef = doc(collection(firestore, 'classFacultyMapping'));
        try {
            await setDoc(newDocRef, { ...data, id: newDocRef.id });
            toast({ title: "Mapping Added", description: `The new mapping has been created.` });
            setIsAdding(false);
        } catch(error) {
             console.error("Error adding mapping:", error);
            toast({ variant: 'destructive', title: "Add failed" });
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast({ variant: 'destructive', title: "Prompt is empty", description: "Please enter a prompt to generate mappings." });
            return;
        }
        setLoading(true);
        try {
            const output = await generateClassFacultyMapping({ prompt });
            
            const existingMappings = new Set(mappings.map(m => `${m.class_name}-${m.faculty_id}-${m.subject}`));
            let skippedCount = 0;
            let addedCount = 0;

            const promises = output.mappings.map(async (m) => {
                const mappingKey = `${m.class_name}-${m.faculty_id}-${m.subject}`;
                if (existingMappings.has(mappingKey)) {
                    skippedCount++;
                    return;
                }
                existingMappings.add(mappingKey);
                const newDocRef = doc(collection(firestore, 'classFacultyMapping'));
                await setDoc(newDocRef, { ...m, id: newDocRef.id });
                addedCount++;
            });
            
            await Promise.all(promises);

            toast({ title: "Mappings Generated", description: `${addedCount} new mappings added. ${skippedCount} duplicates skipped.` });

        } catch (error) {
            console.error("Failed to generate mappings:", error);
            toast({ variant: 'destructive', title: "Generation Failed", description: "An error occurred while generating mappings." });
        } finally {
            setLoading(false);
        }
    }

  return (
    <Card className="shadow-2xl">
        <CardHeader>
            <CardTitle>Class-Faculty Mappings</CardTitle>
            <CardDescription>Assign faculty and subjects to classes.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                    <h3 className="font-semibold">Generate with AI</h3>
                    <Textarea 
                        placeholder="e.g., 'Assign Dr. Reed (101) to CS-A for Data Structures and Prof. Green (102) to CS-A for Algorithms'" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <Button onClick={handleGenerate} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generate Mappings
                    </Button>
                </div>
                <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg shadow-inner">
                   <Dialog open={isAdding} onOpenChange={setIsAdding}>
                        <DialogTrigger asChild>
                            <div className="text-center">
                                <h3 className="font-semibold">Manual Entry</h3>
                                <p className="text-sm text-muted-foreground mb-4">Or, add a single mapping manually.</p>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Mapping
                                </Button>
                            </div>
                        </DialogTrigger>
                        <DialogContent>
                             <DialogHeader>
                                <DialogTitle>Add New Mapping</DialogTitle>
                                <DialogDescription>Create a new class-faculty assignment.</DialogDescription>
                            </DialogHeader>
                            <MappingForm onSave={handleAddSave} onCancel={() => setIsAdding(false)}/>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <DataTable 
                columns={columns} 
                data={mappings}
                filterColumn="class_name"
                filterPlaceholder="Filter by class name..."
             />
        </CardContent>
    </Card>
  )
}
