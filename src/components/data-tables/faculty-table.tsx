
"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

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
import type { Faculty } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { useAuth } from "@/components/auth-provider"

interface FacultyTableProps {
}

const facultySchema = z.object({
    id: z.string().optional(),
    faculty_id: z.string().min(3, "ID must be at least 3 digits").max(4, "ID must be at most 4 digits"),
    name: z.string().min(1, "Name is required."),
    email: z.string().email("Invalid email address."),
    department: z.string().min(1, "Department is required."),
    password: z.string().min(6, "Password must be at least 6 characters."),
});

const FacultyForm = ({ faculty, onSave, onCancel, allFaculty }: { faculty?: Faculty; onSave: (data: Omit<Faculty, 'id' | 'password'>, password?: string) => void; onCancel: () => void; allFaculty: Faculty[] }) => {
    
    const existingFacultyIds = React.useMemo(() => new Set(allFaculty.map(f => f.faculty_id)), [allFaculty]);
    const existingEmails = React.useMemo(() => new Set(allFaculty.map(f => f.email)), [allFaculty]);

    const formSchema = facultySchema.extend({
        faculty_id: z.string().min(3, "ID must be at least 3 digits").max(4, "ID must be at most 4 digits").refine(val => {
            if (faculty?.faculty_id === val) return true;
            return !existingFacultyIds.has(val);
        }, "This Faculty ID already exists."),
        email: z.string().email("Invalid email address.").refine(val => {
            if (faculty?.email === val) return true;
            return !existingEmails.has(val);
        }, "This email already exists."),
        password: faculty ? z.string().optional().refine(val => !val || val.length >= 6, "New password must be at least 6 characters.") : z.string().min(6, "Password must be at least 6 characters."),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: faculty ? { ...faculty, password: "" } : { faculty_id: "", name: "", email: "", department: "", password: "" },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const { id, password, ...data } = values;
        onSave(data, password);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="faculty_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Faculty ID</FormLabel>
                            <FormControl>
                                <Input placeholder="3-4 digit ID" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="Faculty member's email" {...field} disabled={!!faculty}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Faculty member's name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Department</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Computer Science" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder={faculty ? "Leave blank to keep current password" : "Set an initial password"} {...field} />
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

const ActionsCell = ({ faculty, allFaculty }: { faculty: Faculty; allFaculty: Faculty[] }) => {
    const { updateFaculty, deleteFaculty } = useAuth();
    const [isEditing, setIsEditing] = React.useState(false);
    const { toast } = useToast();
    
    const handleEditSave = async (data: Omit<Faculty, 'id' | 'password'>, password?: string) => {
        if (password) {
            alert("Password changes for existing users should be done via the 'Change Password' feature by the user or a password reset flow. This dialog only sets initial passwords.");
        }
        await updateFaculty(faculty.id, data);
        toast({ title: "Faculty Updated", description: `${data.name} has been updated.` });
        setIsEditing(false);
    };

    const handleDelete = () => {
        if(confirm(`Are you sure you want to delete ${faculty.name}?`)) {
            deleteFaculty(faculty.id);
            toast({ title: "Faculty Deleted", description: `${faculty.name} has been removed.` });
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
                    <DialogTitle>Edit Faculty</DialogTitle>
                    <DialogDescription>Update the details for this faculty member.</DialogDescription>
                </DialogHeader>
                <FacultyForm faculty={faculty} onSave={handleEditSave} onCancel={() => setIsEditing(false)} allFaculty={allFaculty} />
            </DialogContent>
        </Dialog>
     </>
    );
};

const getColumns = (allFaculty: Faculty[]): ColumnDef<Faculty>[] => [
  {
    accessorKey: "faculty_id",
    header: "Faculty ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell faculty={row.original} allFaculty={allFaculty} />,
  },
];

export function FacultyTable({}: FacultyTableProps) {
    const { addFaculty, faculty: allFaculty } = useAuth();
    
    const [isAdding, setIsAdding] = React.useState(false);
    const { toast } = useToast();
    
    const columns = React.useMemo(() => getColumns(allFaculty), [allFaculty]);

    const handleAddSave = async (data: Omit<Faculty, 'id' | 'password'>, password?: string) => {
        if (!password) {
            toast({ variant: 'destructive', title: 'Error', description: 'Password is required for new faculty.' });
            return;
        }
        await addFaculty(data, password);
        toast({ title: "Faculty Added", description: `${data.name} has been added.` });
        setIsAdding(false);
    };

  return (
    <Card className="shadow-2xl">
        <CardHeader>
            <CardTitle>Faculty</CardTitle>
            <CardDescription>Add, edit, and remove faculty records.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-end mb-4">
                 <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Faculty
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Faculty</DialogTitle>
                            <DialogDescription>Enter the details for the new faculty member.</DialogDescription>
                        </DialogHeader>
                        <FacultyForm onSave={handleAddSave} onCancel={() => setIsAdding(false)} allFaculty={allFaculty} />
                    </DialogContent>
                </Dialog>
            </div>
            <DataTable 
                columns={columns} 
                data={allFaculty}
                filterColumn="name"
                filterPlaceholder="Filter by name..."
             />
        </CardContent>
    </Card>
  )
}
